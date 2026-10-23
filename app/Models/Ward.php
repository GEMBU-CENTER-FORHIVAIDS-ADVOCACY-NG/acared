<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\WardFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $team_id
 * @property int|null $ward_id
 * @property bool $is_ward
 * @property string $name
 * @property string|null $description
 * @property int $capacity
 * @property string $status
 * @property int $beds_count
 * @property int $occupied_beds_count
 * @property int $patients_count
 * @property int $active_admissions_count
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property CarbonInterface|null $deleted_at
 * @property-read self|null $ward
 * @property-read self|null $bed
 * @property-read Collection<int, self> $beds
 * @property-read Collection<int, Admission> $admissions
 * @property-read Collection<int, Admission> $bedAdmissions
 * @property-read Team|null $team
 */
class Ward extends Model
{
    /** @use HasFactory<WardFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $guarded = [];

    /**
     * @return BelongsTo<self, $this>
     */
    public function ward(): BelongsTo
    {
        return $this->belongsTo(self::class);

    }

    /**
     * @return BelongsTo<self, $this>
     */
    public function bed(): BelongsTo
    {
        return $this->belongsTo(self::class)
            ->where('is_ward', false);

    }

    /**
     * @return HasMany<self, $this>
     */
    public function beds(): HasMany
    {
        return $this->hasMany(self::class, 'ward_id');
    }

    /**
     * @return HasMany<Admission, $this>
     */
    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class, 'ward_id');
    }

    /**
     * Admissions recorded against this row when it is a bed rather than a ward.
     *
     * @return HasMany<Admission, $this>
     */
    public function bedAdmissions(): HasMany
    {
        return $this->hasMany(Admission::class, 'bed_id');
    }

    /**
     * @param  Builder<Ward>  $query
     * @return Builder<Ward>
     */
    public function scopeWards(Builder $query): Builder
    {
        return $query->where('is_ward', true);
    }

    protected $casts = [
        'is_ward' => 'boolean',
        'capacity' => 'integer',
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
