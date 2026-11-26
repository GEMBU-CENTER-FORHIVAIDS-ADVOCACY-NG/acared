<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\PriceList;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WardRoundController extends Controller
{
    public function patientSearch(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        if ($search === '') {
            return response()->json(['data' => []]);
        }

        $patients = Patient::query()
            ->where(function (Builder $q) use ($search): void {
                $q->where('slug', 'like', "%{$search}%")
                    ->orWhere('firstName', 'like', "%{$search}%")
                    ->orWhere('lastName', 'like', "%{$search}%")
                    ->orWhere('fullName', 'like', "%{$search}%");
            })
            ->limit(20)
            ->get(['id', 'slug', 'firstName', 'middleName', 'lastName', 'fullName', 'gender', 'birthDate', 'phone', 'mobile', 'category_id'])
            ->map(fn (Patient $patient) => [
                'slug' => $patient->slug,
                'name' => $patient->fullName ?? trim(($patient->firstName ?? '').' '.($patient->lastName ?? '')),
                'first_name' => $patient->firstName,
                'last_name' => $patient->lastName,
                'gender' => $patient->gender,
                'birth_date' => $patient->birthDate?->format('Y-m-d'),
                'phone' => $patient->phone ?? $patient->mobile,
            ])->values();

        return response()->json(['data' => $patients]);
    }

    public function billingOptions(Request $request): JsonResponse
    {
        $services = PriceList::query()
            ->where(function (Builder $query): void {
                $query->whereHas('subCategory', fn (Builder $q) => $q->whereIn('name', [
                    'Treatment', 'Nursing Services', 'Maternity Services', 'Mortuary Services',
                    'Surgery', 'Ophthalmic Services', 'Dental Services', 'Imaging', 'Imaging/Radiography',
                ]))->orWhereHas('category', fn (Builder $q) => $q->whereRaw('LOWER(name) = ?', ['surgery']));
            })
            ->orderBy('name')
            ->get(['id', 'name', 'price'])
            ->map(fn (PriceList $priceList) => [
                'id' => $priceList->getKey(),
                'name' => $priceList->name,
                'price' => (float) ($priceList->price ?? 0),
            ])->values();

        $teamId = $request->attributes->get('currentTeam')->id;
        $doctors = User::query()
            ->whereHas('teams', fn (Builder $query) => $query->whereKey($teamId))
            ->whereHas('roles', fn (Builder $query) => $query->where('name', 'Consultant'))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $user) => ['id' => $user->id, 'name' => $user->name])->values();

        $wards = Ward::query()->wards()->where('is_ward', true)->orderBy('name')->get(['id', 'name'])
            ->map(fn (Ward $ward) => ['id' => $ward->id, 'name' => $ward->name])->values();

        return response()->json(['data' => [
            'services' => $services,
            'doctors' => $doctors,
            'wards' => $wards,
        ]]);
    }
}
