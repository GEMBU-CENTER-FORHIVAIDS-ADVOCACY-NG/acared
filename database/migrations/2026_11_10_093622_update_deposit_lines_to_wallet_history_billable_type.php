<?php

use App\Models\Billing;
use App\Models\WalletHistory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Update existing deposit lines to use WalletHistory as lineable_type.
     *
     * Previously, deposit lines were created with lineable_type = Billing::class
     * and lineable_id = billing.id. They should use lineable_type = WalletHistory::class
     * and lineable_id = wallet_history.id so that Billing::lines() can find them
     * and financial reports are consistent.
     */
    public function up(): void
    {
        // Find all billings that have WalletHistory as their billable_type (deposit billings)
        $depositBillings = DB::table('billings')
            ->where('billable_type', WalletHistory::class)
            ->select('id', 'billable_id')
            ->get();

        foreach ($depositBillings as $billing) {
            // Update lines that were attached to the billing with Billing::class
            // to point to the WalletHistory instead
            DB::table('lines')
                ->where('lineable_type', Billing::class)
                ->where('lineable_id', $billing->id)
                ->update([
                    'lineable_type' => WalletHistory::class,
                    'lineable_id' => $billing->billable_id,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse: Change WalletHistory lines back to Billing::class
        // We need to find the billing records and update lines back
        $depositBillings = DB::table('billings')
            ->where('billable_type', WalletHistory::class)
            ->select('id', 'billable_id')
            ->get();

        foreach ($depositBillings as $billing) {
            DB::table('lines')
                ->where('lineable_type', WalletHistory::class)
                ->where('lineable_id', $billing->billable_id)
                ->update([
                    'lineable_type' => Billing::class,
                    'lineable_id' => $billing->id,
                ]);
        }
    }
};
