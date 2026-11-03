<?php

use App\Models\Team;
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
        Schema::create('previous_pregnancies', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Team::class)->constrained()->cascadeOnDelete();
            $table->string('patient_id');
            $table->foreign('patient_id')->references('slug')->on('patients')->restrictOnDelete();
            $table->foreignId('nurse_id')->nullable()->constrained('users')->nullOnDelete();

            $table->year('year')->nullable();
            $table->string('ga', 10)->nullable()->comment('Gestational age');
            $table->string('duration_of_pregnancy', 20)->nullable();
            $table->string('duration_of_labour', 20)->nullable();
            $table->boolean('abortion')->nullable()->comment('Abortion yes or no');
            $table->boolean('iufd')->nullable()->comment('Intrauterine fetal death yes or no');
            $table->boolean('aph')->nullable()->comment('Antepartum hemorrhage yes or no');
            $table->boolean('pph')->nullable()->comment('Postpartum hemorrhage yes or no');
            $table->enum('sex', ['male', 'female'])->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->string('mode_of_delivery')->nullable();
            $table->string('age_life', 10)->nullable()->comment('Age at life (survival duration)');
            $table->string('age_death', 10)->nullable()->comment('Age at death');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('previous_pregnancies');
    }
};
