<?php

namespace App\Models;

use App\Concerns\LogsActivityWithInventory;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property int $purchase_order_id
 * @property int $inventory_id
 * @property int $markup_id
 * @property int $quantity
 * @property float $unitPrice
 * @property float $unitCost
 * @property float $totalPrice
 * @property float $totalCost
 * @property CarbonInterface|null $expires_at
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read PurchaseOrder|null $purchaseOrder
 * @property-read Inventory|null $inventory
 * @property-read Markup|null $markup
 * @property-read Team|null $team
 */
class OrderItem extends Model
{
    use LogsActivity, LogsActivityWithInventory;

    protected $guarded = [];

    /**
     * @return BelongsTo<PurchaseOrder, $this>
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * @return BelongsTo<Inventory, $this>
     */
    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }

    /**
     * @return BelongsTo<Markup, $this>
     */
    public function markup(): BelongsTo
    {
        return $this->belongsTo(Markup::class, 'markup_id');
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
