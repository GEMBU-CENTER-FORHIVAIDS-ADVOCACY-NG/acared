<?php

namespace App\Models;

use App\Concerns\LogsActivityWithPatient;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Database\Factories\PatientFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property int $category_id
 * @property string $slug
 * @property string|null $art
 * @property string|null $slugOther
 * @property string $firstName
 * @property string|null $middleName
 * @property string $lastName
 * @property string|null $fullName
 * @property string|null $gender
 * @property CarbonInterface|null $birthDate
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $mobile
 * @property string|null $marital_status
 * @property string|null $occupation
 * @property int $country_id
 * @property int $state_id
 * @property int $lga_id
 * @property string|null $address
 * @property string|null $kinFullName
 * @property string|null $kinPhone
 * @property string|null $kinEmail
 * @property string|null $relation
 * @property float $wallet
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property CarbonInterface|null $deleted_at
 * @property-read State|null $state
 * @property-read Lga|null $lga
 * @property-read Country|null $country
 * @property-read Collection<int, WalletHistory> $walletHistories
 * @property-read Collection<int, Line> $lines
 * @property-read Collection<int, Billing> $billings
 * @property-read Team|null $team
 * @property-read Category|null $category
 * @property-read Collection<int, Stock> $receivable
 * @property-read Collection<int, Laboratory> $laboratories
 * @property-read Collection<int, Admission> $admissions
 * @property-read mixed $age
 */
class Patient extends Model
{
    /** @use HasFactory<PatientFactory> */
    use HasFactory, LogsActivity, LogsActivityWithPatient, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'birthDate' => 'date',
    ];

    protected function age(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->birthDate
            ? (function () {
                $birthDate = Carbon::parse($this->birthDate);
                $years = round($birthDate->diffInYears(now()));
                $months = round($birthDate->copy()->addYears($years)->diffInMonths(now()));

                return "$years years $months months";
            })()
            : null
        );
    }

    /**
     * @return BelongsTo<State, $this>
     */
    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    /**
     * @return BelongsTo<Lga, $this>
     */
    public function lga(): BelongsTo
    {
        return $this->belongsTo(Lga::class);
    }

    /**
     * @return BelongsTo<Country, $this>
     */
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    /**
     * @return HasMany<WalletHistory, $this>
     */
    public function walletHistories(): HasMany
    {
        return $this->hasMany(WalletHistory::class, 'patient_id', 'slug');
    }

    /**
     * @return MorphMany<Line, $this>
     */
    public function lines(): MorphMany
    {
        return $this->morphMany(Line::class, 'lineable');
    }

    /**
     * @return MorphMany<Billing, $this>
     */
    public function billings(): MorphMany
    {
        return $this->morphMany(Billing::class, 'billable');
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return MorphMany<Stock, $this>
     */
    public function receivable(): MorphMany
    {
        return $this->morphMany(Stock::class, 'receivable');
    }

    /**
     * @return HasMany<Laboratory, $this>
     */
    public function laboratories(): HasMany
    {
        return $this->hasMany(Laboratory::class, 'patient_id', 'slug');
    }

    /**
     * @return HasMany<Admission, $this>
     */
    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class, 'patient_id', 'slug');
    }

    /**
     * Determine if the patient is currently admitted to a ward.
     */
    public function isAdmitted(): bool
    {
        if ($this->relationLoaded('admissions')) {
            return $this->admissions->contains(
                fn (Admission $admission) => strtolower((string) $admission->status) === 'admitted'
            );
        }

        return $this->admissions()
            ->whereRaw('LOWER(status) = ?', ['admitted'])
            ->exists();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(fn (string $eventName) => $this->patientDescriptionPrefix().$eventName);
    }

    protected static function booted(): void
    {
        static::saving(function (Patient $patient): void {
            $patient->fullName = trim(implode(' ', array_filter([
                $patient->firstName,
                $patient->middleName,
                $patient->lastName,
            ], fn ($part) => $part !== null && $part !== '')));
        });

        static::addGlobalScope('team', function (Builder $query) {
            if (auth()->hasUser() && auth()->user()->currentTeam) {
                $query->whereBelongsTo(auth()->user()->currentTeam);
            }
        });
    }
}
