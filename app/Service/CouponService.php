<?php

namespace App\Service;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class CouponService
{
    public function resolve(string $code, float $billingAmount): Coupon
    {
        $coupon = Coupon::query()->where('code', $code)
            ->where('team_id', auth()->user()?->currentTeam?->getKey())
            ->firstOrFail();

        throw_unless(
            $coupon->isValid($billingAmount),
            new \Exception('Coupon is invalid, expired, or does not meet the minimum amount.')
        );

        return $coupon;
    }

    public function apply(Coupon $coupon, Payment $payment): float
    {
        return DB::transaction(function () use ($coupon, $payment) {
            $discount = $coupon->calculateDiscount($payment->amount);

            CouponUsage::create([
                'coupon_id' => $coupon->id,
                'payment_id' => $payment->id,
                'user_id' => auth()->id(),
                'discount_amount' => $discount,
            ]);

            $coupon->increment('used_count');

            $payment->update([
                'discount' => $discount,
                'amount_due' => max(0, $payment->amount - $discount),
            ]);

            return $discount;
        });
    }

    public function applyByCode(string $code, Payment $payment): float
    {
        $coupon = $this->resolve($code, $payment->amount);

        return $this->apply($coupon, $payment);
    }
}
