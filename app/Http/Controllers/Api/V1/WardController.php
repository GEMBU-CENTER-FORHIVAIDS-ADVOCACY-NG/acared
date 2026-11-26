<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreWardRequest;
use App\Http\Resources\Api\V1\WardResource;
use App\Models\Admission;
use App\Models\Ward;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class WardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));
        $wardsQuery = Ward::query()
            ->where('is_ward', true)
            ->where('team_id', $request->attributes->get('currentTeam')->id)
            ->when($query !== '', fn (Builder $builder) => $builder->where('name', 'like', "%{$query}%"))
            ->withCount(['beds', 'admissions as active_admissions_count' => fn ($admissions) => $admissions->active()])
            ->with(['beds' => fn ($beds) => $beds->withTrashed()->withCount(['bedAdmissions as active_admissions_count' => fn ($admissions) => $admissions->active()])])
            ->orderBy('name');
        if ($request->boolean('trashed')) {
            $wardsQuery->onlyTrashed();
        }
        $wards = $wardsQuery->paginate($request->integer('per_page', 15));

        $wards->getCollection()->transform(function (Ward $ward) {
            $ward->setAttribute('occupied_beds_count', $ward->beds->filter(fn (Ward $bed) => $bed->active_admissions_count > 0)->count());

            return $ward;
        });

        return WardResource::collection($wards)->response();
    }

    public function show(Request $request, Ward $ward): WardResource
    {
        abort_unless($ward->is_ward && $ward->team_id === $request->attributes->get('currentTeam')->id, 404);
        $ward->loadMissing(['beds'])->loadCount(['beds', 'admissions as active_admissions_count' => fn ($admissions) => $admissions->active()]);
        $ward->setAttribute('occupied_beds_count', $ward->beds->filter(fn (Ward $bed) => $bed->bedAdmissions()->active()->exists())->count());

        return new WardResource($ward);
    }

    public function store(StoreWardRequest $request): JsonResponse
    {
        $teamId = $request->attributes->get('currentTeam')->id;
        $data = $request->validated();
        $this->assertBedCapacity($data);

        $ward = DB::transaction(function () use ($data, $teamId): Ward {
            $ward = Ward::query()->create([
                'team_id' => $teamId,
                'is_ward' => true,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'capacity' => $data['capacity'],
            ]);

            $beds = collect($data['beds'] ?? [])->map(fn (array $bed) => [
                'team_id' => $teamId,
                'is_ward' => false,
                'name' => $bed['name'],
                'status' => 'available',
            ])->all();
            if ($beds !== []) {
                $ward->beds()->createMany($beds);
            }

            return $ward;
        });

        $ward->load(['beds'])->loadCount(['beds', 'admissions as active_admissions_count' => fn ($admissions) => $admissions->active()]);
        $ward->setAttribute('occupied_beds_count', 0);

        return (new WardResource($ward))
            ->additional(['message' => 'Ward created.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(StoreWardRequest $request, Ward $ward): WardResource
    {
        abort_unless($ward->is_ward && $ward->team_id === $request->attributes->get('currentTeam')->id, 404);
        $teamId = $request->attributes->get('currentTeam')->id;
        $data = $request->validated();
        $this->assertBedCapacity($data);

        foreach ($data['beds'] ?? [] as $bed) {
            if (isset($bed['id']) && ! $ward->beds()->whereKey($bed['id'])->exists()) {
                throw ValidationException::withMessages(['beds' => 'A selected bed does not belong to this ward.']);
            }
        }

        DB::transaction(function () use ($data, $teamId, $ward): void {
            $ward->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'capacity' => $data['capacity'],
            ]);

            $submittedBeds = collect($data['beds'] ?? []);
            $ids = $submittedBeds->pluck('id')->filter()->all();
            $ward->beds()->whereNotIn('id', $ids)->whereDoesntHave('bedAdmissions', fn (Builder $builder) => $builder->active())->delete();
            foreach ($submittedBeds as $bed) {
                if (isset($bed['id'])) {
                    $ward->beds()->whereKey($bed['id'])->update(['name' => $bed['name']]);
                } else {
                    $ward->beds()->create([
                        'team_id' => $teamId,
                        'is_ward' => false,
                        'name' => $bed['name'],
                        'status' => 'available',
                    ]);
                }
            }
        });

        $ward->load(['beds'])->loadCount(['beds', 'admissions as active_admissions_count' => fn ($admissions) => $admissions->active()]);
        $ward->setAttribute('occupied_beds_count', $ward->beds->filter(fn (Ward $bed) => $bed->bedAdmissions()->active()->exists())->count());

        return (new WardResource($ward))->additional(['message' => 'Ward updated.']);
    }

    public function destroy(Request $request, Ward $ward): JsonResponse
    {
        abort_unless($ward->is_ward && $ward->team_id === $request->attributes->get('currentTeam')->id, 404);
        if ($ward->bedAdmissions()->active()->exists() || $ward->beds()->whereHas('bedAdmissions', fn (Builder $builder) => $builder->active())->exists()) {
            throw ValidationException::withMessages(['ward' => 'Discharge patients before deleting this ward.']);
        }

        $ward->beds()->delete();
        $ward->delete();

        return response()->json(['message' => 'Ward deleted.']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $teamId = $request->attributes->get('currentTeam')->id;
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists('wards', 'id')->where('team_id', $teamId)->where('is_ward', true)],
        ]);

        $hasActive = Ward::query()->whereIn('id', $data['ids'])->where(function (Builder $builder): void {
            $builder->whereHas('bedAdmissions', fn (Builder $admissions) => $admissions->active())
                ->orWhereHas('beds', fn (Builder $beds) => $beds->whereHas('bedAdmissions', fn (Builder $admissions) => $admissions->active()));
        })->exists();
        if ($hasActive) {
            throw ValidationException::withMessages(['ids' => 'Discharge patients before deleting their ward or bed.']);
        }

        Ward::query()->whereIn('id', $data['ids'])->each(function (Ward $ward): void {
            $ward->beds()->delete();
            $ward->delete();
        });

        return response()->json(['message' => 'Wards deleted.']);
    }

    public function restore(Request $request, int $ward): JsonResponse
    {
        $teamId = $request->attributes->get('currentTeam')->id;
        $record = Ward::withTrashed()->where('team_id', $teamId)->where('is_ward', true)->whereKey($ward)->firstOrFail();
        $record->restore();
        $record->beds()->withTrashed()->restore();

        return (new WardResource($record->fresh(['beds'])))->additional(['message' => 'Ward restored.'])->response();
    }

    public function forceDestroy(Request $request, int $ward): JsonResponse
    {
        $teamId = $request->attributes->get('currentTeam')->id;
        $record = Ward::withTrashed()->where('team_id', $teamId)->where('is_ward', true)->whereKey($ward)->firstOrFail();
        if (Admission::query()->where(fn (Builder $builder) => $builder->where('ward_id', $ward)->orWhereIn('bed_id', $record->beds()->withTrashed()->pluck('id')))->exists()) {
            throw ValidationException::withMessages(['ward' => 'Admissions reference this ward or bed.']);
        }
        $record->beds()->withTrashed()->forceDelete();
        $record->forceDelete();

        return response()->json(['message' => 'Ward permanently deleted.']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function assertBedCapacity(array $data): void
    {
        if (count($data['beds'] ?? []) > (int) $data['capacity']) {
            throw ValidationException::withMessages(['beds' => 'The number of beds cannot exceed the ward capacity.']);
        }
    }
}
