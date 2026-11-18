<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Line;
use App\Models\PriceList;
use App\Models\Treatment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class WardRoundBillingController extends Controller
{
    /**
     * Create a billing for an existing patient from the ward round page.
     */
    public function newBilling(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $teamId = $user->currentTeam->getKey();

        $request->validate([
            'existing_patient_id' => [
                'required',
                'string',
                Rule::exists('patients', 'slug')->where(fn ($query) => $query->where('team_id', $teamId)),
            ],
            'billings' => ['required', 'array', 'min:1'],
            'billings.*.lines' => ['required', 'array', 'min:1'],
            'billings.*.lines.*.price_list_id' => [
                'required',
                'integer',
                Rule::exists(PriceList::class, 'id')->where(fn ($query) => $query->where('team_id', $teamId)),
            ],
            'billings.*.lines.*.unitPrice' => ['required', 'numeric', 'min:0'],
        ]);

        $patientSlug = $request->input('existing_patient_id');

        $this->applyBillings($patientSlug, $teamId, $user, (array) $request->input('billings', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => "Billing applied to {$patientSlug}."]);

        return back();
    }

    /**
     * Get the options for creating a new billing from the ward round page.
     *
     * @return array{services: array<int, array{id: int, name: string, price: float}>}
     */
    public function billingOptions(Request $request): array
    {
        $teamId = $request->user()->currentTeam->getKey();

        return [
            'services' => PriceList::query()
                ->where('team_id', $teamId)
                ->whereHas('subCategory', fn (Builder $query) => $query->whereIn('name', [
                    'Treatment',
                    'Nursing Services',
                    'Maternity Services',
                    'Mortuary Services',
                    'Surgery',
                    'Ophthalmic Services',
                    'Dental Services',
                    'Imaging',
                    'Imaging/Radiography',
                ]))
                ->orderBy('name')
                ->get(['id', 'name', 'price'])
                ->map(fn (PriceList $priceList) => [
                    'id' => $priceList->getKey(),
                    'name' => $priceList->name,
                    'price' => (float) ($priceList->price ?? 0),
                ])
                ->all(),
        ];
    }

    /**
     * Create the patient invoices and their lines.
     *
     * @param  array<int, array{lines: array<int, array{price_list_id: int, unitPrice: float}>, total?: float}>  $billings
     */
    private function applyBillings(string $patientSlug, int $teamId, User $user, array $billings): void
    {
        foreach ($billings as $billingData) {
            if (empty($billingData['lines'])) {
                continue;
            }

            $total = $billingData['total'] ?? collect($billingData['lines'])->sum(fn (array $line) => $line['unitPrice']);

            $treatment = Treatment::create([
                'team_id' => $teamId,
                'patient_id' => $patientSlug,
                'user_id' => $user->getKey(),
                'status' => 'billed',
                'total' => $total,
            ]);

            Billing::create([
                'team_id' => $teamId,
                'patient_id' => $patientSlug,
                'billable_type' => Treatment::class,
                'billable_id' => $treatment->getKey(),
                'user_id' => $user->getKey(),
                'total' => $total,
                'status' => 'billed',
            ]);

            foreach ($billingData['lines'] as $lineData) {
                Line::create([
                    'team_id' => $teamId,
                    'patient_id' => $patientSlug,
                    'price_list_id' => $lineData['price_list_id'],
                    'unitPrice' => $lineData['unitPrice'],
                    'quantity' => 1,
                    'lineable_type' => Treatment::class,
                    'lineable_id' => $treatment->getKey(),
                ]);
            }
        }
    }
}
