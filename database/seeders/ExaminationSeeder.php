<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\SeedsConsultantNotes;
use Illuminate\Database\Seeder;

class ExaminationSeeder extends Seeder
{
    use SeedsConsultantNotes;

    public function run(): void
    {
        $this->seedNotesFromJson('examinations', 'examinations');
    }
}
