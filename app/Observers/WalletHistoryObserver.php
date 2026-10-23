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
        if (! $walletHistory->patient_id || ! $walletHistory->debit) {
            return;
        }

        DB::transaction(function () use ($walletHistory) {
            $patient = $walletHistory->patient;

            // Deduct from whichever patient was selected
            $patient->decrement('wallet', $walletHistory->debit);

            // Update balance snapshot on the history record itself
            $walletHistory->payment()->update([
                'wallet' => $walletHistory->debit,
            ]);
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
