<?php

use Carbon\CarbonImmutable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            $table->timestamp('starts_at')->nullable()->after('purpose');
            $table->timestamp('ends_at')->nullable()->after('starts_at');

            $table->index(['team_id', 'starts_at'], 'appointments_team_starts_at_index');
            $table->index(['doctor_id', 'starts_at'], 'appointments_doctor_starts_at_index');
        });

        DB::table('appointments')
            ->select(['id', 'created_at'])
            ->whereNull('starts_at')
            ->whereNotNull('created_at')
            ->orderBy('id')
            ->chunkById(500, function ($appointments): void {
                foreach ($appointments as $appointment) {
                    $startsAt = CarbonImmutable::parse($appointment->created_at);

                    DB::table('appointments')
                        ->where('id', $appointment->id)
                        ->update([
                            'starts_at' => $startsAt,
                            'ends_at' => $startsAt->addMinutes(30),
                        ]);
                }
            });

        DB::table('appointments')
            ->select(['id', 'starts_at'])
            ->whereNull('ends_at')
            ->whereNotNull('starts_at')
            ->orderBy('id')
            ->chunkById(500, function ($appointments): void {
                foreach ($appointments as $appointment) {
                    DB::table('appointments')
                        ->where('id', $appointment->id)
                        ->update([
                            'ends_at' => CarbonImmutable::parse($appointment->starts_at)->addMinutes(30),
                        ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            $table->dropIndex('appointments_team_starts_at_index');
            $table->dropIndex('appointments_doctor_starts_at_index');
            $table->dropColumn(['starts_at', 'ends_at']);
        });
    }
};
