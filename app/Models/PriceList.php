<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\PriceListFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

/**
 * @property int $id
 * @property int $team_id
 * @property int|null $category_id
 * @property int|null $subcategory_id
 * @property int|null $parameter_id
 * @property string|null $result_type
 * @property array|null $options
 * @property string $name
 * @property string|null $description
 * @property string|null $ranges
 * @property string|null $uom
 * @property bool $is_category
 * @property bool $is_inventory
 * @property float|null $price
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property CarbonInterface|null $deleted_at
 * @property-read self|null $category
 * @property-read self|null $subCategory
 * @property-read self|null $parameter
 * @property-read Collection<int, self> $parameters
 * @property-read Collection<int, Inventory> $inventories
 * @property-read Collection<int, DrugInventory> $drugInventories
 * @property-read Collection<int, LabInventory> $labInventories
 * @property-read Collection<int, TestResult> $testResults
 * @property-read Team|null $team
 */
class PriceList extends Model
{
    /** @use HasFactory<PriceListFactory> */
    use HasFactory, LogsActivity;

    use SoftDeletes;

    protected $guarded = [];

    /**
     * @return BelongsTo<self, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(self::class, 'category_id');
    }

    /**
     * @return BelongsTo<self, $this>
     */
    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(self::class, 'subcategory_id');
    }

    /**
     * @return BelongsTo<self, $this>
     */
    public function parameter(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parameter_id');
    }

    /**
     * @return HasMany<self, $this>
     */
    public function parameters(): HasMany
    {
        return $this->hasMany(self::class, 'parameter_id');
    }

    /**
     * @return HasMany<Inventory, $this>
     */
    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class, 'price_list_id');
    }

    /**
     * @return HasMany<DrugInventory, $this>
     */
    public function drugInventories(): HasMany
    {
        return $this->hasMany(DrugInventory::class, 'price_list_id');
    }

    /**
     * @return HasMany<LabInventory, $this>
     */
    public function labInventories(): HasMany
    {
        return $this->hasMany(LabInventory::class, 'price_list_id');
    }

    /**
     * @return HasMany<TestResult, $this>
     */
    public function testResults(): HasMany
    {
        return $this->hasMany(TestResult::class);
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the unit cost from the first related inventory record.
     */
    public function unitCost(): ?float
    {
        $inventory = $this->inventories->first()
            ?? $this->drugInventories->first()
            ?? $this->labInventories->first();

        return $inventory?->cost;
    }

    protected $casts = [
        'is_category' => 'boolean',
        'is_inventory' => 'boolean',
        'options' => 'array',
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
