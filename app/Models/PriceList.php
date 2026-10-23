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
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $team_id
 * @property int|null $category_id
 * @property int|null $subcategory_id
 * @property int|null $parameter_id
 * @property string|null $result_type
 * @property array<string, mixed>|null $options
 * @property string $name
 * @property string|null $description
 * @property string|null $ranges
 * @property string|null $uom
 * @property bool $is_category
 * @property int $is_inventory
 * @property string|null $price
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property CarbonInterface|null $deleted_at
 * @property-read self|null $category
 * @property-read Collection<int, self> $categories
 * @property-read self|null $subCategory
 * @property-read Collection<int, self> $subcategories
 * @property-read self|null $parameter
 * @property-read Collection<int, self> $parameters
 * @property-read Collection<int, self> $items
 * @property-read Collection<int, self> $subitems
 * @property-read Collection<int, Line> $lines
 * @property-read Collection<int, TestResult> $testResults
 * @property-read Inventory|null $inventory
 * @property-read DrugInventory|null $drugInventory
 * @property-read LabInventory|null $labInventory
 * @property-read Team|null $team
 */
class PriceList extends Model
{
    /** @use HasFactory<PriceListFactory> */
    use HasFactory;

    /**
     * Price list categories that may be requested as a treatment or service.
     *
     * @var list<string>
     */
    public const SERVICE_CATEGORIES = [
        'Dental Services',
        'Ophthalmic Services',
        'Nursing Services',
        'Imaging/Radiography',
        'Maternity Services',
        'Mortuary Services',
    ];

    protected $guarded = [];

    /**
     * Limit the query to billable services within the given price list categories.
     *
     * The catalog holds both shapes: legacy items sit under a subcategory that
     * points at its category, while the newer service groups point straight at
     * their category (and are their own subcategory). All three paths are
     * checked so either shape resolves.
     *
     * Rows without a subcategory are grouping nodes, not requestable services.
     *
     * @param  Builder<PriceList>  $query
     * @param  list<string>  $categories
     * @return Builder<PriceList>
     */
    public function scopeInServiceCategories(Builder $query, array $categories = self::SERVICE_CATEGORIES): Builder
    {
        return $query
            ->whereNotNull('subcategory_id')
            ->where(function (Builder $query) use ($categories): void {
                $query
                    ->whereHas('category', fn (Builder $query): Builder => $query->whereIn('name', $categories))
                    ->orWhereHas('subCategory', fn (Builder $query): Builder => $query->whereIn('name', $categories))
                    ->orWhereHas('subCategory.category', fn (Builder $query): Builder => $query->whereIn('name', $categories));
            });
    }

    /**
     * @return BelongsTo<self, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(self::class, 'category_id');
    }

    /**
     * @return HasMany<self, $this>
     */
    public function categories(): HasMany
    {
        return $this->hasMany(self::class, 'category_id');
    }

    /**
     * @return BelongsTo<self, $this>
     */
    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(self::class, 'subcategory_id');
    }

    /**
     * @return HasMany<self, $this>
     */
    public function subcategories(): HasMany
    {
        return $this->hasMany(self::class, 'subcategory_id');
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
     * @return HasMany<self, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(self::class, 'subcategory_id')
            ->where('is_category', false);
    }

    /**
     * @return HasMany<self, $this>
     */
    public function subitems(): HasMany
    {
        return $this->hasMany(self::class, 'subcategory_id');
    }

    /**
     * @return HasMany<Line, $this>
     */
    public function lines(): HasMany
    {
        return $this->hasMany(Line::class);
    }

    /**
     * @return HasMany<TestResult, $this>
     */
    public function testResults(): HasMany
    {
        return $this->hasMany(TestResult::class, 'parameter_id');
    }

    /**
     * @return HasOne<Inventory, $this>
     */
    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class, 'price_list_id');
    }

    /**
     * @return HasOne<DrugInventory, $this>
     */
    public function drugInventory(): HasOne
    {
        return $this->hasOne(DrugInventory::class, 'price_list_id');
    }

    /**
     * @return HasOne<LabInventory, $this>
     */
    public function labInventory(): HasOne
    {
        return $this->hasOne(LabInventory::class, 'price_list_id');
    }

    /**
     * Resolve the acquisition cost from the price list's linked inventory.
     */
    public function unitCost(): ?float
    {
        $inventory = $this->labInventory
            ?? $this->drugInventory
            ?? $this->inventory;

        return $inventory === null ? null : (float) $inventory->cost;
    }

    protected $casts = [
        'options' => 'array',
        'is_category' => 'boolean',
        'price' => 'decimal:2',
    ];

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
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
