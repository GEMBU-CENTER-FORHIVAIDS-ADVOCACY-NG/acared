<?php

namespace App\Models;

use App\Concerns\LogsActivityWithPatient;
use Carbon\CarbonInterface;
use Database\Factories\BillingFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property string $patient_id
 * @property int $user_id
 * @property string|null $billable_type
 * @property int|null $billable_id
 * @property string $total
 * @property string $status
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property CarbonInterface|null $deleted_at
 * @property-read Patient|null $patient
 * @property-read User|null $user
 * @property-read Billing|Admission|null $billable
 * @property-read Admission|null $admission
 * @property-read Collection<int, Appointment> $appointments
 * @property-read Collection<int, Line> $lines
 * @property-read Collection<int, Payment> $payments
 * @property-read Team|null $team
 */
class Billing extends Model
{
    /** @use HasFactory<BillingFactory> */
    use HasFactory, LogsActivity, LogsActivityWithPatient;

    use SoftDeletes;

    protected $guarded = [];

    /**
     * Scope the query to the billings that can be scheduled.
     *
     * @param  Builder<Billing>  $query
     * @return Builder<Billing>
     */
    public function scopeAvailableForScheduling(Builder $query): Builder
    {
        return $query
            ->where('team_id', auth()->user()?->currentTeam?->getKey())
            ->whereIn('billable_type', [
                Patient::class,
                'Patient',
                'App\\Models\\Patient',
                self::class,
                'Billing',
                'App\\Models\\Billing',
            ])
            ->whereNotIn('status', ['started', 'completed', 'scheduled'])
            ->whereDoesntHave('appointments', function (Builder $q) {
                $q->whereIn('status', ['started', 'completed', 'scheduled']);
            });
    }

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
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function billable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return BelongsTo<Admission, $this>
     */
    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class, 'billable_id');
    }

    /**
     * @return HasMany<Appointment, $this>
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * @return HasMany<Line, $this>
     */
    public function lines(): HasMany
    {
        return $this->hasMany(Line::class, 'lineable_id', 'billable_id')
            ->where('lineable_type', $this->billable_type);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    protected $casts = [
        'total' => 'decimal:2',
    ];

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
