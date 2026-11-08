<?php

namespace Database\Seeders;

use Database\Seeders\Concerns\SeedsConsultantNotes;
use Illuminate\Database\Seeder;

class ComplaintSeeder extends Seeder
{
    use SeedsConsultantNotes;

    public function run(): void
    {
        $this->seedNotesFromJson('complaints', 'complaints', fillNotesEn: true);
    }
}
