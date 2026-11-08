<?php

namespace Database\Seeders;

use App\Models\Billing;
use App\Models\Line;
use App\Models\Payment;
use Illuminate\Database\Seeder;

class UpdateNegativePaymentLinesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Finding billings with negative total payments...');

        // Find all billings where the sum of payments is negative
        $billings = Billing::query()->get();

        $updatedCount = 0;
        $linesUpdated = 0;

        foreach ($billings as $billing) {
            // Calculate total payment amount across all payment methods
            $totalPaymentAmount = Payment::query()
                ->where('billing_id', $billing->id)
                ->selectRaw('COALESCE(SUM(amount + wallet + mercy_fund + infant_formula), 0) as total')
                ->value('total');

            $totalPaymentAmount = (float) $totalPaymentAmount;

            if ($totalPaymentAmount < 0) {
                // Get all line items for this billing
                $lines = Line::query()
                    ->where('lineable_id', $billing->billable_id)
                    ->where('lineable_type', $billing->billable_type)
                    ->where('unitPrice', '>', 0) // Only update if not already negative
                    ->get(['id', 'unitPrice']);

                foreach ($lines as $line) {
                    $line->update([
                        'unitPrice' => -abs((float) $line->unitPrice),
                    ]);
                    $linesUpdated++;
                }

                if ($lines->count() > 0) {
                    $updatedCount++;
                }
            }
        }

        $this->command->info("Updated {$updatedCount} billings with {$linesUpdated} line items.");
    }
}
