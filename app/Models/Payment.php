<?php

namespace App\Models;

use App\Concerns\LogsActivityWithPatient;
use Carbon\CarbonInterface;
use Database\Factories\PaymentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property string $patient_id
 * @property int $user_id
 * @property int|null $billing_id
 * @property int $method_id
 * @property float $amount
 * @property int $discount_percentage
 * @property float $discount_amount
 * @property float $wallet
 * @property float $mercy_fund
 * @property float $infant_formula
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read Billing|null $billing
 * @property-read Method|null $method
 * @property-read Patient|null $patient
 * @property-read Collection<int, WalletHistory> $walletHistories
 * @property-read User|null $user
 * @property-read Team|null $team
 * @property-read CouponUsage|null $couponUsage
 */
class Payment extends Model
{
    /** @use HasFactory<PaymentFactory> */
    use HasFactory, LogsActivity, LogsActivityWithPatient;

    protected $guarded = [];

    /**
     * @return BelongsTo<Billing, $this>
     */
    public function billing(): BelongsTo
    {
        return $this->belongsTo(Billing::class);
    }

    /**
     * @return BelongsTo<Method, $this>
     */
    public function method(): BelongsTo
    {
        return $this->belongsTo(Method::class);
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'slug');
    }

    /**
     * @return HasMany<WalletHistory, $this>
     */
    public function walletHistories(): HasMany
    {
        return $this->hasMany(WalletHistory::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * @return HasOne<CouponUsage, $this>
     */
    public function couponUsage(): HasOne
    {
        return $this->hasOne(CouponUsage::class);
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
