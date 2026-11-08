<?php

namespace Database\Seeders;

use App\Models\Billing;
use Illuminate\Database\Seeder;

class BackfillScheduledBillingsSeeder extends Seeder
{
    /**
     * Run the seeder to backfill existing billing records.
     *
     * Update all billings with status 'scheduled', 'started', or 'completed'
     * to set status to 'paid' and is_scheduled to true.
     */
    public function run(): void
    {
        $updated = Billing::whereIn('status', ['scheduled', 'started', 'completed'])
            ->update([
                'status' => 'paid',
                'is_scheduled' => true,
            ]);

        $this->command->info("Updated {$updated} billing records to status 'paid' and is_scheduled = true.");
    }
}
