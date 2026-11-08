<?php

namespace Database\Seeders;

use App\Models\PriceList;
use Illuminate\Database\Seeder;

class UpdateDepositToCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $deposit = PriceList::withoutGlobalScope('team')
            ->where('name', 'Deposit')
            ->first();

        if ($deposit) {
            $deposit->update([
                'is_category' => true,
                'category_id' => null,
            ]);

            $this->command->info('Updated "Deposit" to be a standalone category.');
        } else {
            $this->command->error('Deposit price list not found.');
        }
    }
}
