<?php

namespace App\Models;

use App\Concerns\LogsActivityWithPatient;
use Carbon\CarbonInterface;
use Database\Factories\VitalFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property string $patient_id
 * @property int|null $appointment_id
 * @property int|null $nursing_id
 * @property int|null $user_id
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property CarbonInterface|null $deleted_at
 * @property-read User|null $user
 * @property-read Patient|null $patient
 * @property-read Collection<int, Line> $lines
 * @property-read Team|null $team
 */
class Vital extends Model
{
    /** @use HasFactory<VitalFactory> */
    use HasFactory, LogsActivity, LogsActivityWithPatient;

    protected $guarded = [];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'slug');
    }

    /**
     * @return MorphMany<Line, $this>
     */
    public function lines(): MorphMany
    {
        return $this->morphMany(Line::class, 'lineable');
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
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
