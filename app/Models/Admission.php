<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\AdmissionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * @property int $id
 * @property int $team_id
 * @property string $patient_id
 * @property int|null $doctor_id
 * @property int $ward_id
 * @property int|null $bed_id
 * @property int|null $appointment_id
 * @property string|null $notes
 * @property int $duration
 * @property string $status
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read Patient|null $patient
 * @property-read User|null $doctor
 * @property-read Ward|null $ward
 * @property-read Ward|null $bed
 * @property-read Appointment|null $appointment
 * @property-read Collection<int, Billing> $billings
 * @property-read Collection<int, Consultation> $consultations
 * @property-read Collection<int, Examination> $examinations
 * @property-read Collection<int, Laboratory> $laboratories
 * @property-read Collection<int, Nursing> $nursings
 * @property-read Collection<int, Prescription> $prescriptions
 * @property-read Collection<int, Treatment> $treatments
 * @property-read Team|null $team
 */
class Admission extends Model
{
    /** @use HasFactory<AdmissionFactory> */
    use HasFactory;

    public const array INACTIVE_STATUSES = ['discharged'];

    protected $guarded = [];

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'slug');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * @return BelongsTo<Ward, $this>
     */
    public function ward(): BelongsTo
    {
        return $this->belongsTo(Ward::class, 'ward_id');
    }

    /**
     * @return BelongsTo<Ward, $this>
     */
    public function bed(): BelongsTo
    {
        return $this->belongsTo(Ward::class, 'bed_id');
    }

    /**
     * @return BelongsTo<Appointment, $this>
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'appointment_id');
    }

    /**
     * @return MorphMany<Billing>
     */
    public function billings(): MorphMany
    {
        return $this->morphMany(Billing::class, 'billable');
    }

    /**
     * @return MorphMany<Consultation>
     */
    public function consultations(): MorphMany
    {
        return $this->morphMany(Consultation::class, 'subject');
    }

    /**
     * @return MorphMany<Examination>
     */
    public function examinations(): MorphMany
    {
        return $this->morphMany(Examination::class, 'subject');
    }

    /**
     * @return MorphMany<Laboratory>
     */
    public function laboratories(): MorphMany
    {
        return $this->morphMany(Laboratory::class, 'subject');
    }

    /**
     * @return MorphMany<Nursing>
     */
    public function nursings(): MorphMany
    {
        return $this->morphMany(Nursing::class, 'subject');
    }

    /**
     * @return MorphMany<Prescription>
     */
    public function prescriptions(): MorphMany
    {
        return $this->morphMany(Prescription::class, 'subject');
    }

    /**
     * @return MorphMany<Treatment>
     */
    public function treatments(): MorphMany
    {
        return $this->morphMany(Treatment::class, 'subject');
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * @param  Builder<Admission>  $query
     * @return Builder<Admission>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNotIn('status', self::INACTIVE_STATUSES);
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
