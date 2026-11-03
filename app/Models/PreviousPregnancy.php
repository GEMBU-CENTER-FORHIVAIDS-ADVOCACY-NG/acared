<?php

namespace App\Models;

use App\Concerns\LogsActivityWithPatient;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property string $patient_id
 * @property int|null $nurse_id
 * @property int|null $year
 * @property string|null $ga
 * @property string|null $duration_of_pregnancy
 * @property string|null $duration_of_labour
 * @property bool|null $abortion
 * @property bool|null $iufd
 * @property bool|null $aph
 * @property bool|null $pph
 * @property string|null $sex
 * @property float|null $weight
 * @property string|null $mode_of_delivery
 * @property string|null $age_life
 * @property string|null $age_death
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read Patient|null $patient
 * @property-read User|null $nurse
 * @property-read Team|null $team
 */
class PreviousPregnancy extends Model
{
    use LogsActivity, LogsActivityWithPatient;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'abortion' => 'boolean',
            'iufd' => 'boolean',
            'aph' => 'boolean',
            'pph' => 'boolean',
        ];
    }

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
    public function nurse(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nurse_id');
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
