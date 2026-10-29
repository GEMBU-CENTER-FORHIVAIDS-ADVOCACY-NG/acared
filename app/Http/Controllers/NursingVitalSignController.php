<?php

namespace App\Http\Controllers;

use App\Models\Nursing;
use App\Models\PriceList;
use App\Models\Vital;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NursingVitalSignController extends Controller
{
    public function index(Request $request, string $current_team, Nursing $nursing): Response
    {
        $nursing->load('patient');
        $vitals = Vital::query()
            ->where('patient_id', $nursing->patient_id)
            ->with(['user', 'lines.priceList'])
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Vital $vital): array => [
                'id' => $vital->getKey(),
                'lines' => $vital->lines->map(fn ($line): array => [
                    'id' => $line->getKey(),
                    'priceListId' => $line->price_list_id,
                    'name' => $line->priceList?->name,
                    'results' => $line->results,
                    'uom' => strip_tags((string) $line->priceList?->uom),
                ])->all(),
                'userName' => $vital->user?->name,
                'canEdit' => (int) $vital->user_id === (int) $request->user()->getKey(),
                'createdAt' => $vital->created_at?->toIso8601String(),
            ]);

        $priceLists = PriceList::query()
            ->whereHas('category', fn ($query) => $query->whereRaw('LOWER(name) = ?', ['vital sign']))
            ->orderBy('name')
            ->get(['id', 'name', 'uom'])
            ->map(fn (PriceList $priceList): array => [
                'id' => $priceList->getKey(),
                'name' => $priceList->name,
                'uom' => strip_tags((string) $priceList->uom),
            ]);

        return Inertia::render('nursing/records/vital-signs', [
            'nursing' => ['id' => $nursing->getKey(), 'patientId' => $nursing->patient_id, 'patientName' => $nursing->patient?->fullName],
            'vitals' => $vitals,
            'priceLists' => $priceLists,
        ]);
    }

    public function store(Request $request, string $current_team, Nursing $nursing): RedirectResponse
    {
        $data = $this->validated($request);
        DB::transaction(function () use ($request, $nursing, $data): void {
            $vital = Vital::query()->create([
                'team_id' => $request->user()->currentTeam->getKey(),
                'patient_id' => $nursing->patient_id,
                'nursing_id' => $nursing->getKey(),
                'user_id' => $request->user()->getKey(),
            ]);
            $this->syncLines($vital, $request, $nursing, $data['lines']);
        });

        return to_route('nursing.records.vital-signs.index', [$current_team, $nursing->getKey()]);
    }

    public function update(Request $request, string $current_team, Nursing $nursing, Vital $vital): RedirectResponse
    {
        $this->authorizeVital($request, $nursing, $vital);
        $data = $this->validated($request);
        DB::transaction(function () use ($request, $nursing, $vital, $data): void {
            $vital->lines()->delete();
            $this->syncLines($vital, $request, $nursing, $data['lines']);
        });

        return to_route('nursing.records.vital-signs.index', [$current_team, $nursing->getKey()]);
    }

    public function destroy(Request $request, string $current_team, Nursing $nursing, Vital $vital): RedirectResponse
    {
        $this->authorizeVital($request, $nursing, $vital);
        DB::transaction(function () use ($vital): void {
            $vital->lines()->delete();
            $vital->delete();
        });

        return to_route('nursing.records.vital-signs.index', [$current_team, $nursing->getKey()]);
    }

    /** @return array{lines: list<array{price_list_id: int, results: string}>} */
    private function validated(Request $request): array
    {
        $teamId = $request->user()->currentTeam->getKey();

        return $request->validate([
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.price_list_id' => [
                'required', 'integer',
                Rule::exists('price_lists', 'id')->where('team_id', $teamId),
                function (string $attribute, mixed $value, \Closure $fail) use ($teamId): void {
                    $isVital = PriceList::query()->whereKey($value)->where('team_id', $teamId)
                        ->whereHas('category', fn ($query) => $query->whereRaw('LOWER(name) = ?', ['vital sign']))
                        ->exists();
                    if (! $isVital) {
                        $fail('Choose a valid vital sign.');
                    }
                },
            ],
            'lines.*.results' => ['required', 'string', 'max:10000'],
        ]);
    }

    /** @param list<array{price_list_id: int, results: string}> $lines */
    private function syncLines(Vital $vital, Request $request, Nursing $nursing, array $lines): void
    {
        foreach ($lines as $line) {
            $vital->lines()->create([
                'team_id' => $request->user()->currentTeam->getKey(),
                'patient_id' => $nursing->patient_id,
                'user_id' => $request->user()->getKey(),
                'price_list_id' => $line['price_list_id'],
                'quantity' => 1,
                'unitPrice' => 0,
                'results' => $line['results'],
            ]);
        }
    }

    private function authorizeVital(Request $request, Nursing $nursing, Vital $vital): void
    {
        abort_unless($vital->patient_id === $nursing->patient_id, 404);
        abort_unless((int) $vital->user_id === (int) $request->user()->getKey(), 403);
    }
}
