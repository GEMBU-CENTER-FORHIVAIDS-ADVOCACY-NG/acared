<?php

namespace Database\Seeders\Concerns;

use Illuminate\Support\Facades\DB;

trait SeedsConsultantNotes
{
    protected const TEAM_ID = 4;

    /**
     * Seed $table from database/seeders/data/{$file}.json.
     *
     * Each JSON record: patient (legacy p_id), doctor_id (28 or 19),
     * notes (already plain text), created_at.
     * team_id is always 4 and appointment_id is always null.
     */
    protected function seedNotesFromJson(string $table, string $file, bool $fillNotesEn = false): void
    {
        $path = database_path("seeders/data/{$file}.json");
        $records = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);

        if (! DB::table('teams')->where('id', self::TEAM_ID)->exists()) {
            $this->command?->error('Team '.self::TEAM_ID.' does not exist.');

            return;
        }

        $patients = DB::table('patients')->pluck('slug')->flip()->all();
        $doctors = DB::table('users')->whereIn('id', [28, 19])->pluck('id')->flip()->all();

        $rows = [];
        $missingPatients = [];
        $missingDoctors = 0;

        foreach ($records as $r) {
            $slug = $this->resolvePatientSlug((string) $r['patient'], $patients);

            if ($slug === null) {
                $missingPatients[$r['patient']] = true;

                continue;
            }
            if (! isset($doctors[$r['doctor_id']])) {
                $missingDoctors++;

                continue;
            }

            $row = [
                'team_id' => self::TEAM_ID,
                'patient_id' => $slug,
                'doctor_id' => $r['doctor_id'],
                'appointment_id' => null,
                'notes' => $r['notes'],
                'created_at' => $r['created_at'],
                'updated_at' => $r['created_at'],
            ];

            if ($fillNotesEn) {
                $row['notes_en'] = $r['notes']; // notes_ha / notes_ff stay null
            }

            $rows[] = $row;
        }

        DB::transaction(function () use ($table, $rows) {
            foreach (array_chunk($rows, 500) as $chunk) {
                DB::table($table)->insert($chunk);
            }
        });

        $this->command?->info(sprintf(
            '%s: inserted %d of %d (unmatched patients: %d, rows with missing doctor: %d)',
            $table, count($rows), count($records), count($missingPatients), $missingDoctors
        ));

        if ($missingPatients) {
            $this->command?->warn('Sample unmatched legacy patient IDs: '.implode(', ', array_slice(array_keys($missingPatients), 0, 10)));
        }
    }

    /**
     * Map the legacy p_id to patients.slug. By default the legacy ID must equal
     * the slug; change this method if your patients table maps it differently.
     */
    protected function resolvePatientSlug(string $legacyId, array $patients): ?string
    {
        return isset($patients[$legacyId]) ? $legacyId : null;
    }
}
