<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreLaboratoryRequest;
use App\Http\Resources\Api\V1\LaboratoryResource;
use App\Models\Laboratory;
use App\Models\Line;
use App\Models\PriceList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LaboratoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Laboratory::query()->with(['patient:id,slug,firstName,lastName', 'doctor:id,name']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('patient')) {
            $query->where('patient_id', $request->string('patient'));
        }

        $labs = $query->latest()->paginate($request->integer('per_page', 15));

        return LaboratoryResource::collection($labs)->response();
    }

    public function show(Laboratory $laboratory): LaboratoryResource
    {
        $laboratory->loadMissing(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'lines.priceList']);

        return new LaboratoryResource($laboratory);
    }

    public function store(StoreLaboratoryRequest $request): JsonResponse
    {
        $teamId = $request->attributes->get('currentTeam')->id;
        $data = $request->validated();

        $lines = $data['lines'];
        $priceLists = PriceList::query()
            ->with(['labInventories', 'drugInventories', 'inventories'])
            ->whereIn('id', array_column($lines, 'price_list_id'))
            ->get()
            ->keyBy(fn (PriceList $p): int => (int) $p->getKey());

        $lines = array_map(function (array $line) use ($priceLists): array {
            $priceList = $priceLists->get((int) $line['price_list_id']);

            return [
                ...$line,
                'unitPrice' => (float) ($line['unitPrice'] ?? $priceList?->price ?? 0),
                'unitCost' => ($line['unitCost'] ?? null) ?: $priceList?->unitCost(),
            ];
        }, $lines);

        $total = collect($lines)->sum(fn (array $line) => (float) ($line['quantity'] ?? 1) * (float) ($line['unitPrice'] ?? 0));

        $laboratory = DB::transaction(function () use ($request, $data, $teamId, $total, $lines): Laboratory {
            $laboratory = Laboratory::create([
                'team_id' => $teamId,
                'patient_id' => $data['patient_id'],
                'doctor_id' => $request->user()->getKey(),
                'status' => 'pending',
                'total' => $data['total'] ?? $total,
            ]);

            foreach ($lines as $line) {
                $laboratory->lines()->create([
                    'team_id' => $teamId,
                    'patient_id' => $data['patient_id'],
                    'user_id' => $request->user()->getKey(),
                    'price_list_id' => $line['price_list_id'],
                    'quantity' => $line['quantity'] ?? 1,
                    'unitPrice' => $line['unitPrice'] ?? 0,
                    'unitCost' => $line['unitCost'] ?? null,
                ]);
            }

            $laboratory->billings()->create([
                'team_id' => $teamId,
                'patient_id' => $data['patient_id'],
                'user_id' => $request->user()->getKey(),
                'total' => $data['total'] ?? $total,
                'status' => 'billed',
            ]);

            return $laboratory;
        });

        return (new LaboratoryResource($laboratory->load(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'lines.priceList'])))
            ->additional(['message' => 'Laboratory request created.'])
            ->response()
            ->setStatusCode(201);
    }

    public function storeResults(Request $request, Laboratory $laboratory): LaboratoryResource
    {
        if (! in_array($laboratory->status, ['pending', 'paid', 'submitted'], true)) {
            throw ValidationException::withMessages(['status' => 'Laboratory request cannot receive results in its current status.']);
        }

        $this->persistResults($request, $laboratory);

        return (new LaboratoryResource($laboratory->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'lines.priceList'])))
            ->additional(['message' => 'Results submitted successfully.']);
    }

    public function cancel(Request $request, Laboratory $laboratory): LaboratoryResource|JsonResponse
    {
        if ($laboratory->status !== 'submitted') {
            throw ValidationException::withMessages(['status' => 'Only submitted laboratory requests can be cancelled.']);
        }

        $teamId = $request->attributes->get('currentTeam')->id;
        $cancelLineIds = array_map('intval', array_filter((array) $request->input('refund_line_ids', [])));
        if (empty($cancelLineIds)) {
            throw ValidationException::withMessages(['refund_line_ids' => 'Please select at least one test to cancel.']);
        }

        $lines = $laboratory->lines()->with(['priceList', 'testResults'])->get();
        $cancelLines = $lines->filter(fn (Line $line) => in_array($line->id, $cancelLineIds, true));
        if ($cancelLines->isEmpty()) {
            throw ValidationException::withMessages(['refund_line_ids' => 'Selected tests not found.']);
        }

        DB::transaction(function () use ($laboratory, $teamId, $request, $cancelLines): void {
            $negativeTotal = $cancelLines->sum(fn (Line $line) => (float) $line->quantity * -(float) $line->unitPrice);
            $cancelLaboratory = Laboratory::create([
                'team_id' => $teamId,
                'patient_id' => $laboratory->patient_id,
                'doctor_id' => $request->user()->getKey(),
                'status' => 'cancel',
                'total' => $negativeTotal,
            ]);

            foreach ($cancelLines as $line) {
                $cancelLaboratory->lines()->create([
                    'team_id' => $teamId,
                    'patient_id' => $laboratory->patient_id,
                    'user_id' => $request->user()->getKey(),
                    'price_list_id' => $line->price_list_id,
                    'quantity' => $line->quantity,
                    'unitPrice' => $line->unitPrice,
                    'unitCost' => $line->unitCost,
                ]);
                $line->delete();
            }

            $cancelLaboratory->billings()->create([
                'team_id' => $teamId,
                'patient_id' => $laboratory->patient_id,
                'user_id' => $request->user()->getKey(),
                'total' => $negativeTotal,
                'status' => 'billed',
            ]);

            $remaining = $laboratory->lines()->sum(DB::raw('quantity * unitPrice'));
            $laboratory->update(['total' => $remaining]);
            $billing = $laboratory->billings()->where('status', 'paid')->latest()->first() ?? $laboratory->billings()->latest()->first();
            if ($billing) {
                $billing->update(['total' => $remaining]);
            }
        });

        return (new LaboratoryResource($laboratory->fresh(['patient:id,slug,firstName,lastName', 'doctor:id,name', 'lines.priceList'])))
            ->additional(['message' => 'Selected tests cancelled and sent for refund.']);
    }

    private function persistResults(Request $request, Laboratory $laboratory): void
    {
        // Backward compat: old format {results: [{line_id,result,comment}]}
        if ($request->has('results') && ! $request->has('lines')) {
            $validated = $request->validate([
                'results' => ['required', 'array', 'min:1'],
                'results.*.line_id' => ['required', 'integer'],
                'results.*.result' => ['nullable', 'string'],
                'results.*.comment' => ['nullable', 'string'],
            ]);
            DB::transaction(function () use ($laboratory, $validated): void {
                foreach ($validated['results'] as $row) {
                    $line = $laboratory->lines()->whereKey($row['line_id'])->first();
                    if ($line) {
                        $line->update(['results' => $row['result'] ?? null, 'comment' => $row['comment'] ?? null]);
                    }
                }
                $laboratory->update(['status' => in_array($laboratory->status, ['paid', 'submitted'], true) ? 'submitted' : 'completed']);
            });

            return;
        }

        $validated = $request->validate([
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.id' => ['required', 'integer', Rule::exists('lines', 'id')->where('lineable_id', $laboratory->getKey())->where('lineable_type', Laboratory::class)],
            'lines.*.results' => ['nullable', 'string'],
            'lines.*.test_results' => ['nullable', 'array'],
            'lines.*.test_results.*.key' => ['required_with:lines.*.test_results', 'string'],
            'lines.*.test_results.*.value' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($laboratory, $validated): void {
            foreach ($validated['lines'] as $lineData) {
                $line = $laboratory->lines()->whereKey($lineData['id'])->first();
                if (! $line) {
                    continue;
                }
                $line->update(['results' => $lineData['results'] ?? null]);
                $line->testResults()->delete();
                foreach (($lineData['test_results'] ?? []) as $result) {
                    $line->testResults()->create(['key' => $result['key'], 'value' => $result['value'] ?? null]);
                }
            }
            $laboratory->update(['status' => in_array($laboratory->status, ['paid', 'submitted'], true) ? 'submitted' : 'completed']);
        });
    }
}
