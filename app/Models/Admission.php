<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\AdmissionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
 * @property-read Collection<int, Line> $lines
 * @property-read Appointment|null $appointment
 * @property-read Collection<int, Billing> $billings
 * @property-read Collection<int, Laboratory> $laboratories
 * @property-read Collection<int, Complaint> $complaints
 * @property-read Collection<int, Examination> $examinations
 * @property-read Collection<int, Diagnose> $diagnoses
 * @property-read Collection<int, Nursing> $nursings
 * @property-read Team|null $team
 */
class Admission extends Model
{
    /** @use HasFactory<AdmissionFactory> */
    use HasFactory;

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
     * @return MorphMany<Line, $this>
     */
    public function lines(): MorphMany
    {
        return $this->morphMany(Line::class, 'lineable');
    }

    /**
     * @return BelongsTo<Appointment, $this>
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * @return MorphMany<Billing, $this>
     */
    public function billings(): MorphMany
    {
        return $this->morphMany(Billing::class, 'billable');
    }

    /**
     * @return HasMany<Laboratory, $this>
     */
    public function laboratories(): HasMany
    {
        return $this->hasMany(Laboratory::class, 'patient_id', 'patient_id');
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

    /**
     * @return HasMany<Nursing, $this>
     */
    public function nursings(): HasMany
    {
        return $this->hasMany(Nursing::class, 'appointment_id');
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Admission states that no longer hold a bed.
     *
     * @var array<int, string>
     */
    public const INACTIVE_STATUSES = ['discharged', 'cancelled'];

    /**
     * An admission that still occupies a bed, whether it was requested
     * (pending) or has been admitted.
     *
     * @param  Builder<Admission>  $query
     * @return Builder<Admission>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNotIn('status', self::INACTIVE_STATUSES);
    }

    /**
     * Whether this admission still holds the bed it was raised against.
     */
    public function isActive(): bool
    {
        return ! in_array($this->status, self::INACTIVE_STATUSES, true);
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
