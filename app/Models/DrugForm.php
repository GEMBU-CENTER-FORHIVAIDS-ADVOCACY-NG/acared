<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\DrugFormFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $team_id
 * @property string $name
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read Collection<int, Inventory> $inventories
 * @property-read Collection<int, DrugInventory> $drugInventories
 * @property-read Collection<int, LabInventory> $labInventories
 * @property-read Team|null $team
 */
class DrugForm extends Model
{
    /** @use HasFactory<DrugFormFactory> */
    use HasFactory;

    protected $guarded = [];

    /**
     * @return HasMany<Inventory, $this>
     */
    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    /**
     * @return HasMany<DrugInventory, $this>
     */
    public function drugInventories(): HasMany
    {
        return $this->hasMany(DrugInventory::class);
    }

    /**
     * @return HasMany<LabInventory, $this>
     */
    public function labInventories(): HasMany
    {
        return $this->hasMany(LabInventory::class);
    }

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
