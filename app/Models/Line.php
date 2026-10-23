<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\LineFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property int $team_id
 * @property string $patient_id
 * @property int|null $user_id
 * @property string|null $lineable_type
 * @property int|null $lineable_id
 * @property int $price_list_id
 * @property int|null $quantity
 * @property string $unitPrice
 * @property string|null $frequency
 * @property string|null $duration
 * @property string|null $dosage
 * @property string|null $results
 * @property float|null $unitCost
 * @property float|null $totalPrice
 * @property float|null $totalCost
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read Patient|null $patient
 * @property-read User|null $user
 * @property-read Billing|Laboratory|Prescription|null $lineable
 * @property-read PriceList|null $priceList
 * @property-read Laboratory|null $laboratory
 * @property-read Collection<int, TestResult> $testResults
 * @property-read Markup|null $markup
 * @property-read Team|null $team
 */
class Line extends Model
{
    /** @use HasFactory<LineFactory> */
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
     * @return BelongsTo<Laboratory, $this>
     */
    public function laboratory(): BelongsTo
    {
        return $this->belongsTo(Laboratory::class, 'lineable_id')->where('lineable_type', Laboratory::class);
    }

    /**
     * @return HasMany<TestResult, $this>
     */
    public function testResults(): HasMany
    {
        return $this->hasMany(TestResult::class);
    }

    /**
     * @return BelongsTo<Markup, $this>
     */
    public function markup(): BelongsTo
    {
        return $this->belongsTo(Markup::class);
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    protected $casts = [
        'unitPrice' => 'decimal:2',
        'frequency' => 'decimal:2',
        'duration' => 'decimal:2',
        'dosage' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('team', function (Builder $query) {
            if (auth()->hasUser() && auth()->user()->currentTeam) {
                $query->whereBelongsTo(auth()->user()->currentTeam);
            }
        });
    }
}
