<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdateDispenseStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder backfills the `dispense_status` column for all previously
     * dispensed prescription lines. It identifies lines that were already
     * dispensed based on `paid = true` where the prescription status is 'dispensed'
     * and the line's `dispense_status` is still 'pending'.
     */
    public function run(): void
    {
        $updated = DB::table('lines')
            ->join('prescriptions', 'lines.lineable_id', '=', 'prescriptions.id')
            ->where('lines.lineable_type', 'App\Models\Prescription')
            ->where('prescriptions.status', 'dispensed')
            ->where('lines.paid', true)
            ->where('lines.dispense_status', 'pending')
            ->update(['lines.dispense_status' => 'dispensed']);

        $this->command->info("Updated {$updated} line(s) to dispense_status = 'dispensed'.");
    }
}
