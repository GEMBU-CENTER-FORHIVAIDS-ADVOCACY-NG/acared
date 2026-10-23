<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\Diagnose;
use App\Models\Examination;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ClinicalReportController extends Controller
{
    /** @var list<string> */
    private const EXAMINATION_FIELDS = ['Hair', 'Ear', 'Eye', 'Nose', 'Mouth', 'Neck', 'Breast', 'Abdomen', 'Leg'];

    /** @var array<string, array{title: string, model: class-string<Complaint|Diagnose|Examination>, label: string}> */
    private const REPORTS = [
        'complaints' => ['title' => 'Complaints report', 'model' => Complaint::class, 'label' => 'Complaint'],
        'diagnoses' => ['title' => 'Diagnoses report', 'model' => Diagnose::class, 'label' => 'Diagnosis'],
        'examinations' => ['title' => 'Examinations report', 'model' => Examination::class, 'label' => 'Examination'],
    ];

    public function index(Request $request, string $current_team, ?string $report = null): Response
    {
        if ($report === null) {
            return Inertia::render('reports/clinical/catalog', [
                'reports' => collect(self::REPORTS)->map(fn (array $item) => $item['title'])->all(),
            ]);
        }

        abort_unless(array_key_exists($report, self::REPORTS), 404);

        $filters = $this->filters($request);
        $model = self::REPORTS[$report]['model'];
        $records = $model::query()
            ->with(['patient', 'doctor'])
            ->when($filters['q'] !== '', fn (Builder $query) => $query->whereHas('patient', fn (Builder $patient) => $patient
                ->where('fullName', 'like', '%'.$filters['q'].'%')
                ->orWhere('slug', 'like', '%'.$filters['q'].'%')))
            ->whereBetween('created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59'])
            ->latest()
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (Complaint|Diagnose|Examination $record) => [
                'id' => $record->getKey(),
                'patientId' => $record->patient_id,
                'patientName' => $record->patient?->fullName,
                'doctor' => $record->doctor?->name,
                'notes' => $this->notes($record->notes),
                'createdAt' => $record->created_at?->toIso8601String(),
            ]);

        return Inertia::render('reports/clinical/index', [
            'report' => ['key' => $report, 'title' => self::REPORTS[$report]['title'], 'label' => self::REPORTS[$report]['label']],
            'records' => $records,
            'filters' => $filters,
            'reports' => collect(self::REPORTS)->map(fn (array $item) => $item['title']),
        ]);
    }

    public function export(Request $request, string $current_team, string $report): StreamedResponse
    {
        abort_unless(array_key_exists($report, self::REPORTS), 404);

        $filters = $this->filters($request);
        $model = self::REPORTS[$report]['model'];
        $label = self::REPORTS[$report]['label'];
        $records = $model::query()
            ->with(['patient', 'doctor'])
            ->when($filters['q'] !== '', fn (Builder $query) => $query->whereHas('patient', fn (Builder $patient) => $patient
                ->where('fullName', 'like', '%'.$filters['q'].'%')
                ->orWhere('slug', 'like', '%'.$filters['q'].'%')))
            ->whereBetween('created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59'])
            ->latest()
            ->cursor();

        return response()->streamDownload(function () use ($records, $label): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Patient', 'Doctor', $label, 'Recorded'], ',', '"', '\\');
            foreach ($records as $record) {
                fputcsv($output, [
                    $record->patient?->fullName,
                    $record->doctor?->name,
                    $this->notes($record->notes),
                    $record->created_at,
                ], ',', '"', '\\');
            }
            fclose($output);
        }, strtolower(str_replace(' ', '-', $label)).'-report.csv', ['Content-Type' => 'text/csv']);
    }

    /** @return array{q: string, from: string, to: string, perPage: int} */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'perPage' => ['nullable', 'integer', Rule::in([10, 25, 50, 100])],
        ]);

        return [
            'q' => trim((string) ($validated['q'] ?? '')),
            'from' => $validated['from'] ?? today()->startOfMonth()->toDateString(),
            'to' => $validated['to'] ?? today()->toDateString(),
            'perPage' => (int) ($validated['perPage'] ?? 25),
        ];
    }

    private function notes(mixed $notes): string
    {
        if (is_string($notes)) {
            return $notes;
        }

        if (! is_array($notes)) {
            return '';
        }

        $data = $notes['data'] ?? null;

        if (! is_array($data) && isset($notes[0]) && is_array($notes[0])) {
            $data = $notes[0]['data'] ?? null;
        }

        if (! is_array($data) && array_key_exists(self::EXAMINATION_FIELDS[0], $notes)) {
            $data = $notes;
        }

        if (is_array($data) && array_key_exists(self::EXAMINATION_FIELDS[0], $data)) {
            return collect(self::EXAMINATION_FIELDS)
                ->map(function (string $field) use ($data): string {
                    $value = $data[$field] ?? null;
                    $formatted = match (true) {
                        $value === null => 'Not recorded',
                        is_bool($value) => $value ? 'Yes' : 'No',
                        is_scalar($value) => trim((string) $value),
                        default => (string) json_encode($value),
                    };

                    return '**'.$field.':** '.($formatted !== '' ? $formatted : 'Not recorded');
                })
                ->implode("\n");
        }

        /** @var array<int|string, mixed> $items */
        $items = $data ?? $notes;

        return collect($items)
            ->map(fn (mixed $value): string => is_array($value)
                ? trim(implode(': ', array_filter([$value['name'] ?? null, $value['value'] ?? null])))
                : (string) $value)
            ->filter()
            ->implode('; ');
    }
}
