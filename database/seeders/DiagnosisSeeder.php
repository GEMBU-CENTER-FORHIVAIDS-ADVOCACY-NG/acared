<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\SeedsConsultantNotes;
use Illuminate\Database\Seeder;

class DiagnosisSeeder extends Seeder
{
    use SeedsConsultantNotes;

    public function run(): void
    {
        $this->seedNotesFromJson('diagnoses', 'diagnoses');
    }
}
