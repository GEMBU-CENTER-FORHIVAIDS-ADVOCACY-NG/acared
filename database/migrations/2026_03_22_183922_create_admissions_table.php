<?php

use App\Models\Appointment;
use App\Models\Team;
use App\Models\Ward;
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
        Schema::create('admissions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Team::class)->constrained()->cascadeOnDelete();
            $table->string('patient_id');
            $table->foreign('patient_id')->references('slug')->on('patients')->restrictOnDelete();
            $table->foreignId('doctor_id')->nullable()->constrained()->references('id')->on('users')->restrictOnDelete();
            $table->foreignIdFor(Ward::class)->constrained()->restrictOnDelete();
            $table->foreignId('bed_id')->nullable()->constrained()->references('id')->on('wards')->restrictOnDelete();
            $table->foreignIdFor(Appointment::class)->nullable()->constrained()->cascadeOnDelete();
            $table->longText('notes')->nullable();
            $table->integer('duration')->default(0);
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admissions');
    }
};
