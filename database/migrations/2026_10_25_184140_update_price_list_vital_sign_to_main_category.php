<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Move PriceList items from Treatment category to Vital Sign category
     * when Vital Sign was the subcategory.
     */
    public function up(): void
    {
        DB::table('price_lists')
            ->where('category_id', 1)
            ->where('subcategory_id', 4)
            ->update([
                'category_id' => 4,
                'subcategory_id' => null,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('price_lists')
            ->where('category_id', 4)
            ->whereNull('subcategory_id')
            ->whereIn('id', [503, 504, 505, 506, 507, 508, 510, 511, 512])
            ->update([
                'category_id' => 1,
                'subcategory_id' => 4,
            ]);
    }
};
