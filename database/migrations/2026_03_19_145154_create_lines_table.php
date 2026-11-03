<?php

use App\Models\PriceList;
use App\Models\Team;
use App\Models\User;
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
        Schema::create('lines', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Team::class)->constrained()->cascadeOnDelete();
            $table->string('patient_id');
            $table->foreign('patient_id')->references('slug')->on('patients')->cascadeOnDelete();
            $table->foreignIdFor(User::class)->nullable()->constrained()->cascadeOnDelete();
            $table->nullableMorphs('lineable');
            $table->foreignIdFor(PriceList::class)->constrained()->cascadeOnDelete();
            $table->integer('quantity')->nullable();
            $table->decimal('unitPrice', 20);
            $table->decimal('frequency', 20)->nullable();
            $table->decimal('duration', 20)->nullable();
            $table->decimal('dosage', 20)->nullable();
            $table->longText('results')->nullable();
            $table->decimal('unitCost', 20)->nullable();
            $table->decimal('totalPrice', 20)->nullable();
            $table->decimal('totalCost', 20)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lines');
    }
};
