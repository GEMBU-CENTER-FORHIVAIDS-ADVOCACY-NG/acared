<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->longText('notes')->nullable()->change();
            $table->longText('notes_en')->nullable()->after('notes');
            $table->longText('notes_ha')->nullable()->after('notes_en');
            $table->longText('notes_ff')->nullable()->after('notes_ha');
        });

        DB::table('complaints')->whereNull('notes_en')->update(['notes_en' => DB::raw('notes')]);
    }

    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropColumn(['notes_ff', 'notes_ha', 'notes_en']);
        });
    }
};
