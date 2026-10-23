<?php

namespace App\Service;

use App\Models\Appointment;
use App\Models\Billing;
use App\Models\PriceList;
use App\Models\Team;
use App\Models\User;
use App\Models\Vital;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use LogicException;
use Throwable;

final class ScheduleAppointment
{
    /**
     * @param  array{billing_id: int|string, doctor_id: int|string, starts_at: string, purpose?: string|null, vital_signs?: list<array{price_list_id: int|string, results: string}>}  $data
     *
     * @throws ValidationException
     */
    public function handle(array $data): Appointment
    {
        Gate::authorize('create', Appointment::class);

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
        $billingId = $data['billing_id'] ?? null;

        if (blank($doctorId)) {
            throw ValidationException::withMessages([
                'doctor_id' => 'Choose a doctor.',
            ]);
        }

        if (blank($billingId)) {
            throw ValidationException::withMessages([
                'billing_id' => 'Choose a paid billing record.',
            ]);
        }

        $endsAt = $startsAt->addMinutes(Appointment::DEFAULT_DURATION_MINUTES);

        return DB::transaction(function () use ($billingId, $data, $doctorId, $endsAt, $team, $startsAt, $userId): Appointment {
            $doctor = User::query()
                ->whereKey($doctorId)
                ->whereHas('teams', fn (Builder $query): Builder => $query->whereKey($team->getKey()))
                ->lockForUpdate()
                ->first();

            if (! $doctor instanceof User) {
                throw ValidationException::withMessages([
                    'doctor_id' => 'Choose a doctor assigned to the active team.',
                ]);
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

            $appointment = Appointment::query()->create([
                'team_id' => $team->getKey(),
                'user_id' => $userId,
                'patient_id' => $billing->patient_id,
                'billing_id' => $billing->getKey(),
                'doctor_id' => $doctor->getKey(),
                'purpose' => $data['purpose'] ?? null,
                'status' => 'scheduled',
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
            ]);

            $vitalSigns = $data['vital_signs'] ?? [];

            if ($vitalSigns !== []) {
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
                    'appointment_id' => $appointment->getKey(),
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

            $billing->update(['status' => 'scheduled']);

            return $appointment;
        }, 3);
    }
}
