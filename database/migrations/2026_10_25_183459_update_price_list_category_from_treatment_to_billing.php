<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Move PriceList items from Treatment category to Billing category
     * when Billing was the subcategory.
     */
    public function up(): void
    {
        DB::table('price_lists')
            ->where('category_id', 1)
            ->where('subcategory_id', 3)
            ->update([
                'category_id' => 3,
                'subcategory_id' => null,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('price_lists')
            ->where('category_id', 3)
            ->whereNull('subcategory_id')
            ->whereIn('id', [1044, 1045, 1070, 1072, 1080, 1103, 1130, 1139, 1166, 1202, 1215, 1230, 1231, 1252, 1280, 1282, 1291])
            ->update([
                'category_id' => 1,
                'subcategory_id' => 3,
            ]);
    }
};
