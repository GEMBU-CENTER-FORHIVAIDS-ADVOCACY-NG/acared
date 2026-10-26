<?php

namespace App\Service;

use App\Models\Appointment;
use App\Models\Billing;
use App\Models\Consultation;
use App\Models\Nursing;
use App\Models\PriceList;
use App\Models\Team;
use App\Models\User;
use App\Models\Vital;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use LogicException;
use Throwable;

final class ScheduleAppointment
{
    /**
     * @param  array{billing_id: int|string, doctor_id?: int|string, nurse_id?: int|string, starts_at: string, purpose?: string|null, vital_signs?: list<array{price_list_id: int|string, results: string}>}  $data
     *
     * @throws ValidationException
     */
    public function handle(array $data): Model
    {
        $team = auth()->user()?->currentTeam;

        if (! $team instanceof Team) {
            throw new LogicException('An active team is required to schedule an appointment.');
        }

        $userId = auth()->id();

        if ($userId === null) {
            throw new LogicException('An authenticated user is required to schedule an appointment.');
        }

        $startsAtValue = $data['starts_at'] ?? null;

        if (! is_string($startsAtValue) || blank($startsAtValue)) {
            throw ValidationException::withMessages([
                'starts_at' => 'Choose an appointment date and time.',
            ]);
        }

        try {
            $startsAt = CarbonImmutable::parse($startsAtValue);
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'starts_at' => 'Choose a valid appointment date and time.',
            ]);
        }

        if ($startsAt->isPast()) {
            throw ValidationException::withMessages([
                'starts_at' => 'The appointment time must be in the future.',
            ]);
        }

        $doctorId = $data['doctor_id'] ?? null;
        $nurseId = $data['nurse_id'] ?? null;
        $billingId = $data['billing_id'] ?? null;

        if (blank($doctorId) && blank($nurseId)) {
            throw ValidationException::withMessages([
                'doctor_id' => 'Choose a doctor or nurse.',
            ]);
        }

        if (blank($billingId)) {
            throw ValidationException::withMessages([
                'billing_id' => 'Choose a paid billing record.',
            ]);
        }

        $endsAt = $startsAt->addMinutes(Appointment::DEFAULT_DURATION_MINUTES);

        // Branch: doctor → Appointment + Consultation, nurse → Nursing
        $isDoctor = filled($doctorId);
        $isNurse = filled($nurseId);

        if ($isDoctor) {
            Gate::authorize('create', Appointment::class);
            Gate::authorize('create', Consultation::class);
        } else {
            Gate::authorize('create', Nursing::class);
        }

        return DB::transaction(function () use ($billingId, $data, $doctorId, $endsAt, $isDoctor, $nurseId, $team, $startsAt, $userId): Model {
            $assignedUser = null;
            $assignedUserId = $doctorId ?: $nurseId;

            if ($assignedUserId) {
                $assignedUser = User::query()
                    ->whereKey($assignedUserId)
                    ->whereHas('teams', fn (Builder $query): Builder => $query->whereKey($team->getKey()))
                    ->lockForUpdate()
                    ->first();

                if (! $assignedUser instanceof User) {
                    $field = $doctorId ? 'doctor_id' : 'nurse_id';
                    throw ValidationException::withMessages([
                        $field => 'Choose a valid staff member assigned to the active team.',
                    ]);
                }
            }

            $billing = Billing::query()
                ->availableForScheduling()
                ->whereKey($billingId)
                ->lockForUpdate()
                ->first();

            if (! $billing instanceof Billing) {
                throw ValidationException::withMessages([
                    'billing_id' => 'Choose a billing record available for scheduling from the active team.',
                ]);
            }

            $purpose = $data['purpose'] ?? null;

            if ($isDoctor) {
                $result = $this->createDoctorAppointment(
                    team: $team,
                    userId: $userId,
                    billing: $billing,
                    assignedUser: $assignedUser,
                    startsAt: $startsAt,
                    endsAt: $endsAt,
                    purpose: $purpose,
                    data: $data,
                );
            } else {
                $result = $this->createNurseAppointment(
                    team: $team,
                    userId: $userId,
                    billing: $billing,
                    assignedUser: $assignedUser,
                    startsAt: $startsAt,
                    endsAt: $endsAt,
                    purpose: $purpose,
                    data: $data,
                );
            }

            $billing->update(['status' => 'scheduled']);

            return $result;
        }, 3);
    }

    /**
     * Create an Appointment and linked Consultation for a doctor appointment.
     *
     * @param  array<string, mixed>  $data
     */
    private function createDoctorAppointment(
        Team $team,
        int $userId,
        Billing $billing,
        ?User $assignedUser,
        CarbonImmutable $startsAt,
        CarbonImmutable $endsAt,
        ?string $purpose,
        array $data,
    ): Appointment {
        $appointment = Appointment::query()->create([
            'team_id' => $team->getKey(),
            'user_id' => $userId,
            'patient_id' => $billing->patient_id,
            'billing_id' => $billing->getKey(),
            'doctor_id' => $assignedUser?->getKey(),
            'purpose' => $purpose,
            'status' => 'scheduled',
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ]);

        Consultation::query()->create([
            'team_id' => $team->getKey(),
            'user_id' => $userId,
            'patient_id' => $billing->patient_id,
            'billing_id' => $billing->getKey(),
            'doctor_id' => $assignedUser?->getKey(),
            'appointment_id' => $appointment->getKey(),
            'purpose' => $purpose,
            'status' => 'scheduled',
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ]);

        $this->createVitalSigns(
            team: $team,
            userId: $userId,
            billing: $billing,
            parentModel: $appointment,
            data: $data,
        );

        return $appointment;
    }

    /**
     * Create a Nursing record for a nurse appointment.
     *
     * @param  array<string, mixed>  $data
     */
    private function createNurseAppointment(
        Team $team,
        int $userId,
        Billing $billing,
        ?User $assignedUser,
        CarbonImmutable $startsAt,
        CarbonImmutable $endsAt,
        ?string $purpose,
        array $data,
    ): Nursing {
        $nursing = Nursing::query()->create([
            'team_id' => $team->getKey(),
            'user_id' => $userId,
            'patient_id' => $billing->patient_id,
            'billing_id' => $billing->getKey(),
            'nurse_id' => $assignedUser?->getKey(),
            'purpose' => $purpose,
            'status' => 'scheduled',
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ]);

        $this->createVitalSigns(
            team: $team,
            userId: $userId,
            billing: $billing,
            parentModel: $nursing,
            data: $data,
        );

        return $nursing;
    }

    /**
     * Create vital signs associated with the given parent model.
     *
     * @param  array<string, mixed>  $data
     */
    private function createVitalSigns(
        Team $team,
        int $userId,
        Billing $billing,
        Model $parentModel,
        array $data,
    ): void {
        $vitalSigns = $data['vital_signs'] ?? [];

        if ($vitalSigns === []) {
            return;
        }

        $priceLists = PriceList::query()
            ->whereIn('id', array_column($vitalSigns, 'price_list_id'))
            ->whereHas('subCategory', fn (Builder $query): Builder => $query->where('name', 'Vital sign'))
            ->get()
            ->keyBy('id');

        if ($priceLists->count() !== count($vitalSigns)) {
            throw ValidationException::withMessages([
                'vital_signs' => 'Choose valid vital signs from the active team catalog.',
            ]);
        }

        $vital = Vital::query()->create([
            'team_id' => $team->getKey(),
            'patient_id' => $billing->patient_id,
            'user_id' => $userId,
        ]);

        foreach ($vitalSigns as $vitalSign) {
            $priceList = $priceLists->get($vitalSign['price_list_id']);

            if (! $priceList instanceof PriceList) {
                throw ValidationException::withMessages([
                    'vital_signs' => 'Choose valid vital signs from the active team catalog.',
                ]);
            }

            $vital->lines()->create([
                'team_id' => $team->getKey(),
                'patient_id' => $billing->patient_id,
                'user_id' => $userId,
                'price_list_id' => $priceList->getKey(),
                'unitPrice' => (float) ($priceList->price ?? 0),
                'results' => $vitalSign['results'],
            ]);
        }
    }
}
