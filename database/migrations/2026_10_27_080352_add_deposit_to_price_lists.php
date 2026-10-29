<?php

use App\Models\PriceList;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if a "Deposit" PriceList already exists (name is unique globally)
        $deposit = PriceList::withoutGlobalScope('team')->where('name', 'Deposit')->first();

        if ($deposit) {
            // Update existing Deposit to be a standalone category
            $deposit->update([
                'category_id' => null,
                'is_category' => true,
                'description' => 'Wallet deposit category',
            ]);

            return;
        }

        // Find a team to assign the Deposit category to
        $team = DB::table('teams')->first();

        if ($team) {
            PriceList::create([
                'team_id' => $team->id,
                'category_id' => null,
                'name' => 'Deposit',
                'description' => 'Wallet deposit category',
                'price' => 0,
                'is_category' => true,
                'is_inventory' => false,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        PriceList::where('name', 'Deposit')->delete();
    }
};
