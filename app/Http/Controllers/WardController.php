<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Ward;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WardController extends Controller
{
    public function index(Request $request): Response
    {
        $query = trim((string) $request->query('q', ''));
        $trashed = $request->boolean('trashed');
        $perPage = in_array((int) $request->query('perPage', 25), [10, 25, 50, 100], true) ? (int) $request->query('perPage', 25) : 25;
        $wards = Ward::query()
            ->when($trashed, fn (Builder $builder) => $builder->onlyTrashed())
            ->with(['ward', 'beds' => fn (HasMany $beds) => $trashed ? $beds->onlyTrashed() : $beds])
            ->withCount(['admissions as active_admissions_count' => fn ($admissions) => $admissions->active()])
            ->when($query !== '', fn (Builder $builder) => $builder->where('name', 'like', "%{$query}%"))
            ->orderByDesc('is_ward')->orderBy('name')->paginate($perPage)->withQueryString()
            ->through(fn (Ward $ward) => [
                'id' => $ward->id,
                'name' => $ward->name,
                'description' => $ward->description,
                'capacity' => $ward->capacity,
                'status' => $ward->status,
                'isWard' => $ward->is_ward,
                'wardName' => $ward->ward?->name,
                'beds' => $ward->beds->map(fn (Ward $bed) => ['id' => $bed->id, 'name' => $bed->name, 'status' => $bed->status, 'deletedAt' => $bed->deleted_at?->toIso8601String()])->values(),
                'activeAdmissionsCount' => $ward->active_admissions_count,
                'deletedAt' => $ward->deleted_at?->toIso8601String(),
                'updatedAt' => $ward->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('nursing/wards/index', [
            'wards' => $wards,
            'filters' => ['q' => $query, 'trashed' => $trashed, 'perPage' => $perPage],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        DB::transaction(function () use ($data, $request): void {
            $ward = Ward::create([
                'team_id' => $request->user()->currentTeam->getKey(),
                'is_ward' => true,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'capacity' => $data['capacity'],
            ]);
            /** @var array<int, array<string, mixed>> $beds */
            $beds = $data['beds'] ?? [];

            $ward->beds()->createMany(collect($beds)->map(fn (array $bed) => [
                'team_id' => $request->user()->currentTeam->getKey(),
                'is_ward' => false,
                'name' => $bed['name'],
                'status' => 'available',
            ])->all());
        });

        return to_route('nursing.wards.index', $request->user()->currentTeam->slug);
    }

    public function update(Request $request, string $current_team, Ward $ward): RedirectResponse
    {
        abort_unless($ward->is_ward, 404);
        $data = $this->validated($request);
        $this->assertBedCapacity($data);
        foreach ($data['beds'] ?? [] as $bed) {
            if (isset($bed['id']) && ! $ward->beds()->whereKey($bed['id'])->exists()) {
                throw ValidationException::withMessages(['beds' => 'A selected bed does not belong to this ward.']);
            }
        }
        DB::transaction(function () use ($data, $request, $ward): void {
            $ward->update(['name' => $data['name'], 'description' => $data['description'] ?? null, 'capacity' => $data['capacity']]);
            /** @var array<int, array<string, mixed>> $bedRows */
            $bedRows = $data['beds'] ?? [];

            $submittedBeds = collect($bedRows);
            $ids = $submittedBeds->pluck('id')->filter()->all();
            $ward->beds()->whereNotIn('id', $ids)->whereDoesntHave('bedAdmissions', fn (Builder $builder) => $builder->active())->delete();
            foreach ($submittedBeds as $bed) {
                if (isset($bed['id'])) {
                    $ward->beds()->whereKey($bed['id'])->update(['name' => $bed['name']]);
                } else {
                    $ward->beds()->create(['team_id' => $request->user()->currentTeam->getKey(), 'is_ward' => false, 'name' => $bed['name'], 'status' => 'available']);
                }
            }
        });

        return to_route('nursing.wards.index', $request->user()->currentTeam->slug);
    }

    public function destroy(Request $request, string $current_team, Ward $ward): RedirectResponse
    {
        abort_if($ward->bedAdmissions()->active()->exists() || ($ward->is_ward && $ward->beds()->whereHas('bedAdmissions', fn (Builder $builder) => $builder->active())->exists()), 422, 'Discharge patients before deleting this ward or bed.');
        $ward->delete();

        return to_route('nursing.wards.index', $request->user()->currentTeam->slug);
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $teamId = $request->user()->currentTeam->getKey();
        $data = $request->validate(['ids' => ['required', 'array', 'min:1'], 'ids.*' => ['integer', Rule::exists('wards', 'id')->where('team_id', $teamId)]]);
        abort_if(Ward::query()->whereIn('id', $data['ids'])->where(function (Builder $builder): void {
            $builder->whereHas('bedAdmissions', fn (Builder $admissions) => $admissions->active())
                ->orWhereHas('beds', fn (Builder $beds) => $beds->whereHas('bedAdmissions', fn (Builder $admissions) => $admissions->active()));
        })->exists(), 422, 'Discharge patients before deleting their ward or bed.');
        Ward::query()->whereIn('id', $data['ids'])->each(fn (Ward $ward) => $ward->delete());

        return to_route('nursing.wards.index', $request->user()->currentTeam->slug);
    }

    public function restore(Request $request, string $current_team, int $ward): RedirectResponse
    {
        Ward::withTrashed()->whereKey($ward)->firstOrFail()->restore();

        return to_route('nursing.wards.index', [$request->user()->currentTeam->slug, 'trashed' => 1]);
    }

    public function forceDestroy(Request $request, string $current_team, int $ward): RedirectResponse
    {
        $record = Ward::withTrashed()->whereKey($ward)->firstOrFail();
        abort_if($record->is_ward && $record->beds()->withTrashed()->exists(), 422, 'Delete beds before permanently deleting this ward.');
        abort_if(Admission::query()->where(fn (Builder $builder) => $builder->where('ward_id', $ward)->orWhere('bed_id', $ward))->exists(), 422, 'Admissions reference this ward or bed.');
        $record->forceDelete();

        return to_route('nursing.wards.index', [$request->user()->currentTeam->slug, 'trashed' => 1]);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'capacity' => ['required', 'integer', 'min:0', 'max:500'],
            'beds' => ['nullable', 'array', 'max:500'],
            'beds.*.id' => ['nullable', 'integer', Rule::exists('wards', 'id')->where('team_id', $request->user()->currentTeam->getKey())],
            'beds.*.name' => ['required', 'string', 'max:255'],
        ]);

        $this->assertBedCapacity($data);

        return $data;
    }

    /** @param array<string, mixed> $data */
    private function assertBedCapacity(array $data): void
    {
        if (count($data['beds'] ?? []) > (int) $data['capacity']) {
            throw ValidationException::withMessages(['beds' => 'The number of beds cannot exceed the ward capacity.']);
        }
    }
}
