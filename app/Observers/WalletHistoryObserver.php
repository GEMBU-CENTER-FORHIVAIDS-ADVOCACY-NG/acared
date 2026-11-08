<?php

namespace App\Observers;

use App\Models\WalletHistory;
use Illuminate\Support\Facades\DB;

class WalletHistoryObserver
{
    /**
     * Handle the WalletHistory "created" event.
     */
    public function created(WalletHistory $walletHistory): void
    {
        if (! $walletHistory->patient_id) {
            return;
        }

        $payment = $walletHistory->payment;

        // If the payment's wallet column is already set (positive or negative), the controller has already
        // handled the wallet update for this wallet_debit. Skip observer processing.
        if ($payment && (float) $payment->wallet !== 0) {
            return;
        }

        DB::transaction(function () use ($walletHistory) {
            $patient = $walletHistory->patient;

            // Calculate the running total: sum of (credit - debit) for all wallet histories up to this one
            $total = WalletHistory::query()->where('patient_id', $walletHistory->patient_id)
                ->where('id', '<=', $walletHistory->id)
                ->sum('credit') - WalletHistory::query()->where('patient_id', $walletHistory->patient_id)
                ->where('id', '<=', $walletHistory->id)
                ->sum('debit');

            $walletHistory->update([
                'total' => $total,
            ]);

            if ($walletHistory->debit) {
                // Debit: decrease wallet balance
                $patient->decrement('wallet', $walletHistory->debit);

                // Update balance snapshot on the payment record
                $walletHistory->payment()->update([
                    'wallet' => $walletHistory->debit,
                ]);
            }

            if ($walletHistory->credit) {
                // Credit: increase wallet balance
                $patient->increment('wallet', $walletHistory->credit);

                // Update balance snapshot on the payment record
                $walletHistory->payment()->update([
                    'wallet' => $walletHistory->credit,
                ]);
            }
        });
    }

    /**
     * Handle the WalletHistory "updated" event.
     */
    public function updated(WalletHistory $walletHistory): void
    {
        //
    }

    /**
     * Handle the WalletHistory "deleted" event.
     */
    public function deleted(WalletHistory $walletHistory): void
    {
        //
    }

    /**
     * Handle the WalletHistory "restored" event.
     */
    public function restored(WalletHistory $walletHistory): void
    {
        //
    }

    /**
     * Handle the WalletHistory "force deleted" event.
     */
    public function forceDeleted(WalletHistory $walletHistory): void
    {
        //
    }
}
