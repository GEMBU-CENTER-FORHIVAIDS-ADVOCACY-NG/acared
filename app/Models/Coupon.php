<?php

namespace App\Models;

use App\Concerns\LogsActivityWithPatient;
use Carbon\CarbonInterface;
use Database\Factories\CouponFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property string $patient_id
 * @property string $code
 * @property string $type
 * @property float $value
 * @property float|null $max_uses
 * @property float $used_count
 * @property float $min_billing_amount
 * @property float|null $max_discount_amount
 * @property CarbonInterface|null $expires_at
 * @property string|null $fund_type
 * @property string $status
 * @property int|null $approved_by
 * @property CarbonInterface|null $approved_at
 * @property bool $is_active
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property CarbonInterface|null $deleted_at
 * @property-read Team|null $team
 * @property-read Patient|null $patient
 * @property-read Collection<int, CouponUsage> $usages
 * @property-read User|null $approvedBy
 */
class Coupon extends Model
{
    /** @use HasFactory<CouponFactory> */
    use HasFactory, LogsActivity, LogsActivityWithPatient;

    use SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'expires_at' => 'datetime',
        'approved_at' => 'datetime',
        'is_active' => 'boolean',
        'fund_type' => 'string',
    ];

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * @return BelongsTo<Patient, $this>
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'slug');
    }

    /**
     * @return HasMany<CouponUsage, $this>
     */
    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // --- helpers ---

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Approve the coupon.
     */
    public function approve(User $user): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $user->getKey(),
            'approved_at' => now(),
        ]);
    }

    /**
     * Reject the coupon.
     */
    public function reject(User $user): void
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $user->getKey(),
            'approved_at' => now(),
        ]);
    }

    public function isValid(float $billingAmount): bool
    {
        return $this->isApproved()
            && $this->is_active
            && ($this->expires_at === null || $this->expires_at->isFuture())
            && ($this->max_uses === null || $this->used_count < $this->max_uses)
            && $billingAmount >= $this->min_billing_amount;
    }

    public function calculateDiscount(float $amount): float
    {
        $discount = $this->type === 'percentage'
            ? $amount * ($this->value / 100)
            : $this->value;

        if ($this->max_discount_amount) {
            $discount = min($discount, $this->max_discount_amount);
        }

        return min($discount, $amount); // never exceed bill total
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
