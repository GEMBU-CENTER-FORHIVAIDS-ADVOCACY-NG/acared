<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\InventoryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
class Inventory extends Model
{
    /** @use HasFactory<InventoryFactory> */
    use HasFactory;

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

    // app/Models/Inventory.php

    public function transferToLab(int|float $quantity, $receiver): LabInventory
    {
        $labInventory = LabInventory::where('sku', $this->sku)->first();

        if ($labInventory) {
            $labInventory->update([
                'quantity' => $labInventory->quantity + $quantity, // accumulate instead of overwrite
                'price' => $this->price,
                'cost' => $this->cost,
                'expires_at' => $this->expires_at,
            ]);
        } else {
            $labInventory = LabInventory::create([
                'sku' => $this->sku,
                'price_list_id' => $this->price_list_id,
                'drug_form_id' => $this->drug_form_id,
                'min_qty' => $this->min_qty,
                'quantity' => $quantity,
                'price' => $this->price,
                'cost' => $this->cost,
                'status' => $this->status,
                'expires_at' => $this->expires_at,
            ]);
        }

        $this->decrement('quantity', $quantity);

        // Refresh model to get updated quantity after decrement
        $this->refresh();

        // Update status based on quantity vs min_qty
        $this->update([
            'status' => $this->quantity <= $this->min_qty ? 'low' : 'available',
        ]);

        Stock::create([
            'team_id' => $this->team_id,
            'user_id' => auth()->id(),
            'inventory_id' => $this->id,
            'stockable_id' => $labInventory->id,
            'stockable_type' => Inventory::class,
            'quantity' => -$quantity,
            'receivable_id' => $receiver,
            'receivable_type' => User::class,
            'status' => 'Transferred',
        ]);

        Stock::create([
            'team_id' => $this->team_id,
            'user_id' => auth()->id(),
            'inventory_id' => $this->id,
            'stockable_id' => $labInventory->id,
            'stockable_type' => LabInventory::class,
            'quantity' => $quantity,
            'receivable_id' => $receiver,
            'receivable_type' => User::class,
            'status' => 'Transferred',
        ]);

        return $labInventory;
    }

    public function transferToPharm(int|float $quantity, $receiver): DrugInventory
    {
        $drugInventory = DrugInventory::where('sku', $this->sku)->first();

        if ($drugInventory) {
            $drugInventory->update([
                'quantity' => $drugInventory->quantity + $quantity, // accumulate instead of overwrite
                'price' => $this->price,
                'cost' => $this->cost,
                'expires_at' => $this->expires_at,
            ]);
        } else {
            $drugInventory = DrugInventory::create([
                'sku' => $this->sku,
                'price_list_id' => $this->price_list_id,
                'drug_form_id' => $this->drug_form_id,
                'min_qty' => $this->min_qty,
                'quantity' => $quantity,
                'price' => $this->price,
                'cost' => $this->cost,
                'status' => $this->status,
                'expires_at' => $this->expires_at,
            ]);
        }

        $this->decrement('quantity', $quantity);

        // Refresh model to get updated quantity after decrement
        $this->refresh();

        // Update status based on quantity vs min_qty
        $this->update([
            'status' => $this->quantity <= $this->min_qty ? 'low' : 'available',
        ]);

        Stock::create([
            'team_id' => $this->team_id,
            'user_id' => auth()->id(),
            'inventory_id' => $this->id,
            'stockable_id' => $drugInventory->id,
            'stockable_type' => Inventory::class,
            'quantity' => -$quantity,
            'receivable_id' => $receiver,
            'receivable_type' => User::class,
            'status' => 'Transferred',
        ]);

        Stock::create([
            'team_id' => $this->team_id,
            'user_id' => auth()->id(),
            'inventory_id' => $this->id,
            'stockable_id' => $drugInventory->id,
            'stockable_type' => DrugInventory::class,
            'quantity' => $quantity,
            'receivable_id' => $receiver,
            'receivable_type' => User::class,
            'status' => 'Transferred',
        ]);

        return $drugInventory;
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
