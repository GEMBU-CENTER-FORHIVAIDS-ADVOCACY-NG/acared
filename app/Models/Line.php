<?php

namespace App\Models;

use App\Concerns\LogsActivityWithPatient;
use Carbon\CarbonInterface;
use Database\Factories\LineFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property string $patient_id
 * @property int|null $user_id
 * @property string|null $lineable_type
 * @property int|null $lineable_id
 * @property int $price_list_id
 * @property int|null $quantity
 * @property float $unitPrice
 * @property float|null $frequency
 * @property float|null $duration
 * @property float|null $dosage
 * @property string|null $comment
 * @property string|null $results
 * @property float|null $unitCost
 * @property float|null $totalPrice
 * @property float|null $totalCost
 * @property bool $paid
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read Patient|null $patient
 * @property-read User|null $user
 * @property-read Model|null $lineable
 * @property-read PriceList|null $priceList
 * @property-read Team|null $team
 * @property-read Collection<int, TestResult> $testResults
 */
class Line extends Model
{
    /** @use HasFactory<LineFactory> */
    use HasFactory, LogsActivity, LogsActivityWithPatient;

    protected $guarded = [];

    protected $casts = [
        'paid' => 'boolean',
    ];

    protected function totalPrice(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->quantity && $this->unitPrice ? $this->quantity * $this->unitPrice : null,
        );
    }

    protected function totalCost(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->quantity && $this->unitCost ? $this->quantity * $this->unitCost : null,
        );
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
    public function lineable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return BelongsTo<PriceList, $this>
     */
    public function priceList(): BelongsTo
    {
        return $this->belongsTo(PriceList::class);
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * @return HasMany<TestResult>
     */
    public function testResults(): HasMany
    {
        return $this->hasMany(TestResult::class);
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
