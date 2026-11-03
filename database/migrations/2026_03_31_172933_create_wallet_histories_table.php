<?php

use App\Models\Method;
use App\Models\Payment;
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
        Schema::create('wallet_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Team::class)->constrained()->cascadeOnDelete();
            $table->string('patient_id');
            $table->foreign('patient_id')->references('slug')->on('patients')->cascadeOnDelete();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Payment::class)->nullable()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Method::class)->constrained()->cascadeOnDelete();
            $table->decimal('credit', 20)->default(0);
            $table->decimal('debit', 20)->default(0);
            $table->decimal('balance', 20)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_histories');
    }
};
