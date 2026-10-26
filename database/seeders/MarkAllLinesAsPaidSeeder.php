<?php

namespace Database\Seeders;

use App\Models\Line;
use Illuminate\Database\Seeder;

class MarkAllLinesAsPaidSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Line::query()->update(['paid' => true]);
    }
}
