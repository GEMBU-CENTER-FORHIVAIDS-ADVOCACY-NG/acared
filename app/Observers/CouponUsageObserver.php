<?php

namespace App\Observers;

use App\Models\CouponUsage;
use Illuminate\Support\Facades\DB;

class CouponUsageObserver
{
    public function created(CouponUsage $couponUsage): void
    {
        $this->syncPaymentAndCoupon($couponUsage);
    }

    public function updated(CouponUsage $couponUsage): void
    {
        // Only re-sync if discount_amount actually changed
        if ($couponUsage->wasChanged('discount_amount')) {
            $this->syncPaymentAndCoupon($couponUsage);
        }
    }

    private function syncPaymentAndCoupon(CouponUsage $couponUsage): void
    {
        // Guard: both FKs must be present and amount must be non-zero
        if (
            ! $couponUsage->payment_id ||
            ! $couponUsage->coupon_id ||
            ! $couponUsage->discount_amount
        ) {
            return;
        }

        DB::transaction(function () use ($couponUsage) {
            // Update mercy_fund on the parent payment
            $couponUsage->payment()->update([
                'mercy_fund' => $couponUsage->discount_amount,
            ]);

            // Deduct from coupon's remaining balance
            // Using decrement because min_billing_amount is the remaining balance
            $couponUsage->coupon()->increment(
                'used_count',
                1
            );

            $couponUsage->coupon()->increment(
                'min_billing_amount',
                $couponUsage->discount_amount,
            );

            // Fetch the coupon model once — reuse it everywhere
            $coupon = $couponUsage->coupon()->first();

            if ($coupon === null) {
                return;
            }

            $coupon->refresh();

            if ($coupon->value === $coupon->min_billing_amount) {
                $coupon->update(['is_active' => false]);
            }
        });
    }

    public function deleted(CouponUsage $couponUsage): void
    {
        // Reverse the deduction if coupon usage is deleted
        if (! $couponUsage->payment_id || ! $couponUsage->coupon_id || ! $couponUsage->discount_amount) {
            return;
        }

        DB::transaction(function () use ($couponUsage) {
            $couponUsage->payment()->update(['mercy_fund' => 0]);
            $couponUsage->coupon()->increment('min_billing_amount', $couponUsage->discount_amount);
        });
    }

    public function restored(CouponUsage $couponUsage): void {}

    public function forceDeleted(CouponUsage $couponUsage): void {}
}
