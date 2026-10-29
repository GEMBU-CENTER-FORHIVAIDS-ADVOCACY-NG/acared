<?php

namespace App\Models;

use App\Concerns\LogsActivityWithInventory;
use Carbon\CarbonInterface;
use Database\Factories\LabInventoryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property string $sku
 * @property int $price_list_id
 * @property int $drug_form_id
 * @property int $min_qty
 * @property float $quantity
 * @property float $price
 * @property float $cost
 * @property float|null $value
 * @property float|null $profit
 * @property string $status
 * @property CarbonInterface|null $expires_at
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read PriceList|null $priceList
 * @property-read DrugForm|null $drugForm
 * @property-read Collection<int, Stock> $stocks
 * @property-read Collection<int, OrderItem> $orderItems
 * @property-read Team|null $team
 */
class LabInventory extends Model
{
    /** @use HasFactory<LabInventoryFactory> */
    use HasFactory, LogsActivity, LogsActivityWithInventory;

    protected $guarded = [];

    /**
     * @return BelongsTo<PriceList, $this>
     */
    public function priceList(): BelongsTo
    {
        return $this->belongsTo(PriceList::class, 'price_list_id');
    }

    /**
     * @return BelongsTo<DrugForm, $this>
     */
    public function drugForm(): BelongsTo
    {
        return $this->belongsTo(DrugForm::class);
    }

    /**
     * @return HasMany<Stock, $this>
     */
    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    protected function value(): Attribute
    {
        return Attribute::make(
            get: fn () => ($this->quantity ?? 0) * ($this->cost ?? 0),
        );
    }

    protected function profit(): Attribute
    {
        return Attribute::make(
            get: fn () => (($this->quantity ?? 0) * ($this->price ?? 0)) - ($this->cost ?? 0),
        );
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(fn (string $eventName) => $this->inventoryDescriptionPrefix().$eventName);
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
