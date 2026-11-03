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
        Schema::create('present_pregnancies', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Team::class)->constrained()->cascadeOnDelete();
            $table->string('patient_id');
            $table->foreign('patient_id')->references('slug')->on('patients')->restrictOnDelete();
            $table->foreignId('nurse_id')->nullable()->constrained('users')->nullOnDelete();

            $table->date('date');
            $table->string('bp', 20)->nullable();
            $table->string('g_a', 10)->nullable()->comment('Gestational age in weeks');
            $table->decimal('weight', 5, 2)->nullable();
            $table->date('lmp')->nullable()->comment('Last menstrual period');
            $table->date('edd')->nullable()->comment('Estimated date of delivery');
            $table->decimal('sfh', 4, 1)->nullable()->comment('Symphysio-fundal height in cm');
            $table->enum('lie', ['longitudinal', 'transverse', 'oblique'])->nullable();
            $table->enum('position', ['left anterior', 'left posterior', 'right anterior', 'right posterior'])->nullable();
            $table->integer('fhr')->nullable()->comment('Fetal heart rate in bpm');
            $table->decimal('hb', 4, 1)->nullable()->comment('Hemoglobin in g/dl');
            $table->boolean('oedema')->nullable()->comment('Oedema present or absent');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('present_pregnancies');
    }
};
