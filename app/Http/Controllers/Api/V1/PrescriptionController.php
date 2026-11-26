<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\DispensePrescriptionRequest;
use App\Http\Requests\Api\V1\StorePrescriptionRequest;
use App\Http\Resources\Api\V1\PrescriptionResource;
use App\Models\DrugInventory;
use App\Models\Line;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\PriceList;
use App\Service\InventoryUsageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PrescriptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Prescription::query()->with(['patient:id,slug,firstName,lastName', 'doctor:id,name']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('patient')) {
            $query->where('patient_id', $request->string('patient'));
        }

        $prescriptions = $query->latest()->paginate($request->integer('per_page', 15));

        return PrescriptionResource::collection($prescriptions)->response();
    }

    public function show(Prescription $prescription): PrescriptionResource
    {
        $prescription->loadMissing(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'lines.priceList']);

        return new PrescriptionResource($prescription);
    }

    public function store(StorePrescriptionRequest $request): JsonResponse
    {
        $teamId = $request->attributes->get('currentTeam')->id;
        $data = $request->validated();

        $prescription = DB::transaction(function () use ($request, $data, $teamId): Prescription {
            $prescription = Prescription::create([
                'team_id' => $teamId,
                'patient_id' => $data['patient_id'],
                'doctor_id' => $request->user()->getKey(),
                'status' => 'pending',
                'total' => 0,
            ]);

            $total = 0.0;
            foreach ($data['lines'] as $line) {
                $priceList = PriceList::query()->whereKey($line['price_list_id'])->firstOrFail();
                $quantity = (float) $line['quantity'];
                $unitPrice = (float) $priceList->price;
                $total += $quantity * $unitPrice;

                $prescription->lines()->create([
                    'team_id' => $teamId,
                    'patient_id' => $data['patient_id'],
                    'user_id' => $request->user()->getKey(),
                    'price_list_id' => $priceList->getKey(),
                    'quantity' => $quantity,
                    'unitPrice' => $unitPrice,
                    'unitCost' => $priceList->unitCost() ?? 0,
                    'frequency' => $line['frequency'] ?? null,
                    'duration' => $line['duration'] ?? null,
                    'dosage' => $line['dosage'] ?? null,
                    'comment' => $line['comment'] ?? null,
                ]);
            }

            $prescription->update(['total' => $total, 'status' => 'billed']);
            $prescription->billings()->create([
                'team_id' => $teamId,
                'patient_id' => $data['patient_id'],
                'user_id' => $request->user()->getKey(),
                'total' => $total,
                'status' => 'billed',
            ]);

            return $prescription;
        });

        return (new PrescriptionResource($prescription->load(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'lines.priceList'])))
            ->additional(['message' => 'Prescription created.'])
            ->response()
            ->setStatusCode(201);
    }

    public function dispense(DispensePrescriptionRequest $request, Prescription $prescription): PrescriptionResource
    {
        if ($prescription->status !== 'paid') {
            throw ValidationException::withMessages(['status' => 'Only paid prescriptions can be dispensed.']);
        }

        $prescription->load(['lines.priceList.drugInventory', 'patient']);
        $missingStock = $prescription->lines
            ->filter(fn (Line $line): bool => $line->priceList?->drugInventory === null)
            ->map(fn (Line $line): string => $line->priceList->name ?? "Price list #{$line->price_list_id}")
            ->values();

        if ($missingStock->isNotEmpty()) {
            throw ValidationException::withMessages(['stock' => 'No pharmacy stock available for: '.$missingStock->implode(', ')]);
        }

        DB::transaction(function () use ($prescription): void {
            $patient = Patient::query()->where('slug', $prescription->patient_id)->firstOrFail();
            foreach ($prescription->lines as $line) {
                /** @var DrugInventory $drugInventory */
                $drugInventory = $line->priceList->drugInventory;
                app(InventoryUsageService::class)->use(
                    $drugInventory,
                    quantity: (int) $line->quantity,
                    stockStatus: 'Dispensed',
                    patientId: (int) $patient->getKey(),
                );
                $line->update(['dispense_status' => 'dispensed']);
            }
            $prescription->update(['status' => 'dispensed']);
        });

        return (new PrescriptionResource($prescription->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'lines.priceList'])))
            ->additional(['message' => 'Prescription dispensed.']);
    }

    public function refund(Request $request, Prescription $prescription): PrescriptionResource
    {
        if ($prescription->status !== 'dispensed') {
            throw ValidationException::withMessages(['status' => 'Only dispensed prescriptions can be refunded.']);
        }

        $teamId = $request->attributes->get('currentTeam')->id;
        $request->validate([
            'lines' => ['nullable', 'array'],
            'lines.*.refund' => ['sometimes', 'boolean'],
            'lines.*.line_id' => ['required_with:lines', 'integer'],
            'lines.*.quantity' => ['nullable', 'numeric', 'min:0.001'],
        ]);
        $inputLines = collect($request->input('lines', []));
        $selected = $inputLines->isNotEmpty()
            ? $inputLines->where('refund', true)->values()
            : $prescription->lines()->get()->map(fn ($l) => ['line_id' => $l->id, 'quantity' => $l->quantity, 'refund' => true])->values();
        if ($selected->isEmpty()) {
            // no lines to refund; mark as refunded for simple status parity
            $prescription->update(['status' => 'refunded']);

            return (new PrescriptionResource($prescription->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'lines.priceList'])))
                ->additional(['message' => 'Refund processed successfully.']);
        }

        $refunded = DB::transaction(function () use ($request, $prescription, $selected, $teamId): Prescription {
            $receiver = Patient::query()->where('slug', $prescription->patient_id)->firstOrFail();

            $refunded = Prescription::create([
                'team_id' => $teamId,
                'patient_id' => $prescription->patient_id,
                'appointment_id' => $prescription->appointment_id,
                'doctor_id' => $prescription->doctor_id,
                'status' => 'refunded',
                'total' => 0,
            ]);

            $refundTotal = 0.0;
            foreach ($selected as $lineData) {
                $line = $prescription->lines()->whereKey($lineData['line_id'])->first();
                if (! $line) {
                    continue;
                }
                $refundQuantity = (float) ($lineData['quantity'] ?? $line->quantity);
                $refundTotal += $refundQuantity * (float) $line->unitPrice;

                $drugInventory = DrugInventory::query()->where('price_list_id', $line->price_list_id)->first();
                if (! $drugInventory) {
                    throw ValidationException::withMessages(['stock' => 'The medication does not have a linked drug inventory record.']);
                }

                app(InventoryUsageService::class)->return(
                    $drugInventory,
                    quantity: (int) $refundQuantity,
                    stockStatus: 'Returned',
                    patientId: (int) $receiver->getKey(),
                    stockableId: (int) $refunded->getKey(),
                );

                $refunded->lines()->create([
                    'team_id' => $teamId,
                    'price_list_id' => $line->price_list_id,
                    'unitPrice' => $line->unitPrice,
                    'unitCost' => $line->unitCost,
                    'frequency' => $line->frequency,
                    'duration' => $line->duration,
                    'dosage' => $line->dosage,
                    'quantity' => $refundQuantity,
                    'patient_id' => $line->patient_id,
                    'user_id' => $line->user_id,
                    'dispense_status' => 'dispensed',
                ]);
            }

            $refunded->update(['total' => $refundTotal]);
            if ($refundTotal > 0) {
                $refunded->billings()->create([
                    'team_id' => $teamId,
                    'patient_id' => $prescription->patient_id,
                    'user_id' => $request->user()->getKey(),
                    'total' => -1 * $refundTotal,
                    'status' => 'billed',
                ]);
            }

            return $refunded;
        });

        return (new PrescriptionResource($refunded->load(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'lines.priceList'])))
            ->additional(['message' => 'Refund processed successfully.']);
    }
}
