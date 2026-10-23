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
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('alpha3')->unique(); // e.g., AED, USD
            $table->integer('number');
            $table->integer('decimals');
            $table->string('langEN');
            $table->string('langIT');
            $table->string('symbol_decimal')->nullable(); // Stores decimal HTML entities
            $table->string('symbol_hex')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
