<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->string('logo')->nullable()->after('is_personal');
            $table->string('phone')->nullable()->after('logo');
            $table->string('mobile')->nullable()->after('phone');
            $table->string('email')->unique()->nullable()->after('mobile');
            $table->longText('address')->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->dropColumn(['logo', 'phone', 'mobile', 'email', 'address']);
        });
    }
};
