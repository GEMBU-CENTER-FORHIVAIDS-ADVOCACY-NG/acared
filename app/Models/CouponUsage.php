<?php

namespace App\Models;

use App\Concerns\LogsActivityWithPatient;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $coupon_id
 * @property int $payment_id
 * @property int $user_id
 * @property float $discount_amount
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read Coupon|null $coupon
 * @property-read Payment|null $payment
 * @property-read User|null $user
 */
class CouponUsage extends Model
{
    use LogsActivity, LogsActivityWithPatient;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->setDescriptionForEvent(fn (string $eventName) => $this->patientDescriptionPrefix().$eventName);
    }

    protected $guarded = [];

    /**
     * @return BelongsTo<Coupon, $this>
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * @return BelongsTo<Payment, $this>
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
