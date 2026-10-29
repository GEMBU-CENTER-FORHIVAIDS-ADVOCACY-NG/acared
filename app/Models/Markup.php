<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\MarkupFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

/**
 * @property int $id
 * @property int $team_id
 * @property string $name
 * @property int $value
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read Collection<int, Line> $lines
 * @property-read Team|null $team
 */
class Markup extends Model
{
    /** @use HasFactory<MarkupFactory> */
    use HasFactory, LogsActivity;

    protected $guarded = [];

    protected $table = 'mark_ups';

    /**
     * @return HasMany<Line, $this>
     */
    public function lines(): HasMany
    {
        return $this->hasMany(Line::class);
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
