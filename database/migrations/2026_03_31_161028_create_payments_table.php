<?php

use App\Models\Billing;
use App\Models\Method;
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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Team::class)->constrained()->cascadeOnDelete();
            $table->string('patient_id');
            $table->foreign('patient_id')->references('slug')->on('patients')->cascadeOnDelete();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Billing::class)->nullable()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Method::class)->constrained()->cascadeOnDelete();
            $table->decimal('amount', 20)->default(0);
            $table->unsignedTinyInteger('discount_percentage')->default(0);
            $table->decimal('discount_amount', 20)->default(0);
            $table->decimal('wallet', 20)->default(0);
            $table->decimal('mercy_fund', 20)->default(0);
            $table->decimal('infant_formula', 20)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
