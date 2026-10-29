<?php

namespace App\Models;

use App\Concerns\LogsActivityWithPatient;
use Carbon\CarbonInterface;
use Database\Factories\ConsultationFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property string $patient_id
 * @property int|null $user_id
 * @property int $billing_id
 * @property int|null $doctor_id
 * @property int|null $appointment_id
 * @property string|null $purpose
 * @property string $status
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property CarbonInterface|null $starts_at
 * @property CarbonInterface|null $ends_at
 * @property-read User|null $user
 * @property-read User|null $doctor
 * @property-read Patient|null $patient
 * @property-read Billing|null $billing
 * @property-read Appointment|null $appointment
 * @property-read Collection<int, Billing> $billings
 * @property-read Collection<int, Line> $lines
 * @property-read Collection<int, Laboratory> $laboratories
 * @property-read Collection<int, Vital> $vitals
 * @property-read Collection<int, Treatment> $treatments
 * @property-read Collection<int, Prescription> $prescriptions
 * @property-read Collection<int, Admission> $admissions
 * @property-read Collection<int, Complaint> $complaints
 * @property-read Collection<int, Examination> $examinations
 * @property-read Collection<int, Diagnose> $diagnoses
 * @property-read Team|null $team
 */
class Consultation extends Model
{
    /** @use HasFactory<ConsultationFactory> */
    use HasFactory, LogsActivity, LogsActivityWithPatient;

    public const DEFAULT_DURATION_MINUTES = 10;

    protected $guarded = [];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'slug');
    }

    /**
     * @return BelongsTo<Billing, $this>
     */
    public function billing(): BelongsTo
    {
        return $this->belongsTo(Billing::class);
    }

    /**
     * @return BelongsTo<Appointment, $this>
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * @return HasMany<Billing, $this>
     */
    public function billings(): HasMany
    {
        return $this->hasMany(Billing::class, 'patient_id', 'slug');
    }

    /**
     * @return MorphMany<Line, $this>
     */
    public function lines(): MorphMany
    {
        return $this->morphMany(Line::class, 'lineable');
    }

    /**
     * @return HasMany<Laboratory, $this>
     */
    public function laboratories(): HasMany
    {
        return $this->hasMany(Laboratory::class, 'patient_id', 'patient_id');
    }

    /**
     * @return HasMany<Vital, $this>
     */
    public function vitals(): HasMany
    {
        return $this->hasMany(Vital::class, 'patient_id', 'patient_id');
    }

    /**
     * @return HasMany<Treatment, $this>
     */
    public function treatments(): HasMany
    {
        return $this->hasMany(Treatment::class, 'patient_id', 'patient_id');
    }

    /**
     * @return HasMany<Prescription, $this>
     */
    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class, 'patient_id', 'patient_id');
    }

    /**
     * @return HasMany<Admission, $this>
     */
    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class, 'patient_id', 'patient_id');
    }

    /**
     * @return HasMany<Complaint, $this>
     */
    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'patient_id', 'patient_id');
    }

    /**
     * @return HasMany<Examination, $this>
     */
    public function examinations(): HasMany
    {
        return $this->hasMany(Examination::class, 'patient_id', 'patient_id');
    }

    /**
     * @return HasMany<Diagnose, $this>
     */
    public function diagnoses(): HasMany
    {
        return $this->hasMany(Diagnose::class, 'patient_id', 'patient_id');
    }

    public function calendarState(): string
    {
        $now = now();
        $startsAt = $this->starts_at ?? $this->created_at ?? $now;
        $endsAt = $this->ends_at ?? $startsAt->copy()->addMinutes(self::DEFAULT_DURATION_MINUTES);

        // Active: ongoing right now or explicitly started.
        if ($this->status === 'started' || ($startsAt->lessThanOrEqualTo($now) && $endsAt->greaterThanOrEqualTo($now))) {
            return 'active';
        }

        // Past: not today and already happened.
        if (! $startsAt->isToday() && $startsAt->isPast()) {
            return 'past';
        }

        return 'future';
    }

    public function calendarColor(): string
    {
        return match ($this->calendarState()) {
            'active' => '#22c55e', // success (green)
            'past' => '#f59e0b', // primary (amber)
            default => '#ef4444', // danger (red)
        };
    }

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function statusColor(): string
    {
        return match ($this->status) {
            'scheduled' => 'warning',
            'started' => 'info',
            'completed' => 'success',
            'cancelled' => 'danger',
            default => 'gray',
        };
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(fn (string $eventName) => $this->patientDescriptionPrefix().$eventName);
    }

    protected static function booted(): void
    {
        static::addGlobalScope('team', function (Builder $query) {
            if (auth()->hasUser() && auth()->user()->currentTeam) {
                $query->whereBelongsTo(auth()->user()->currentTeam);
            }
        });
    }
}
