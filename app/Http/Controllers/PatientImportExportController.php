<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Country;
use App\Models\Lga;
use App\Models\Patient;
use App\Models\State;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PatientImportExportController extends Controller
{
    /** @var list<string> */
    private const EXPORT_COLUMNS = [
        'id', 'category.name', 'slug', 'art', 'slugOther', 'firstName', 'middleName', 'lastName',
        'fullName', 'gender', 'birthDate', 'email', 'phone', 'mobile', 'country.name', 'state.name',
        'lga.name', 'address', 'kinFullName', 'kinPhone', 'kinEmail', 'relation', 'wallet', 'created_at', 'updated_at', 'deleted_at',
    ];

    public function export(Request $request, string $current_team): StreamedResponse
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'tab' => ['nullable', 'string', 'max:32'],
            'trashed' => ['nullable', 'in:without,with,only'],
        ]);
        $query = Patient::query()->with(['category', 'country', 'state', 'lga']);

        if (($filters['trashed'] ?? 'without') === 'with') {
            $query->withTrashed();
        } elseif (($filters['trashed'] ?? 'without') === 'only') {
            $query->onlyTrashed();
        }

        if (($filters['tab'] ?? 'all') === 'children') {
            $query->where('birthDate', '>=', now()->subYears(18)->toDateString());
        } elseif (ctype_digit((string) ($filters['tab'] ?? ''))) {
            $query->where('category_id', (int) $filters['tab']);
        }

        if (($filters['q'] ?? '') !== '') {
            $like = '%'.$filters['q'].'%';
            $query->where(fn (Builder $query) => $query
                ->where('slug', 'like', $like)
                ->orWhere('art', 'like', $like)
                ->orWhere('slugOther', 'like', $like)
                ->orWhere('fullName', 'like', $like)
                ->orWhere('gender', 'like', $like)
                ->orWhere('email', 'like', $like)
                ->orWhere('phone', 'like', $like));
        }

        $patients = $query
            ->orderBy('slug')->lazy(500);

        return response()->streamDownload(function () use ($patients): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, self::EXPORT_COLUMNS, ',', '"', '\\');

            foreach ($patients as $patient) {
                fputcsv($output, [
                    $patient->getKey(), $patient->category?->name, $patient->slug, $patient->art, $patient->slugOther,
                    $patient->firstName, $patient->middleName, $patient->lastName, $patient->fullName, $patient->gender,
                    $patient->birthDate?->toDateString(), $patient->email, $patient->phone, $patient->mobile,
                    $patient->country?->name, $patient->state?->name, $patient->lga?->name, $patient->address,
                    $patient->kinFullName, $patient->kinPhone, $patient->kinEmail, $patient->relation,
                    $patient->wallet, $patient->created_at?->toDateTimeString(), $patient->updated_at?->toDateTimeString(), $patient->deleted_at?->toDateTimeString(),
                ], ',', '"', '\\');
            }

            fclose($output);
        }, 'patients.csv', ['Content-Type' => 'text/csv']);
    }

    public function import(Request $request, string $current_team): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ]);
        $path = $validated['file']->getRealPath();
        $stream = $path === false ? false : fopen($path, 'r');

        if ($stream === false) {
            return back()->withErrors(['file' => 'The uploaded CSV could not be read.']);
        }

        $headers = fgetcsv($stream, null, ',', '"', '\\');

        if (! is_array($headers)) {
            fclose($stream);

            return back()->withErrors(['file' => 'The uploaded CSV is empty.']);
        }

        $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $headers[0]);
        $headers = array_map(fn (mixed $header): string => strtolower(trim((string) $header)), $headers);
        $rows = [];
        $rowNumber = 1;

        while (($values = fgetcsv($stream, null, ',', '"', '\\')) !== false) {
            $rowNumber++;

            if ($values === [null] || count(array_filter($values, fn (mixed $value): bool => trim((string) $value) !== '')) === 0) {
                continue;
            }

            if (count($values) !== count($headers)) {
                $rows[] = ['row' => $rowNumber, 'error' => 'The row has a different number of columns from the header.'];

                continue;
            }

            $data = array_combine($headers, array_map(function (mixed $value): ?string {
                $normalized = trim((string) ($value ?? ''));

                return $normalized === '' ? null : $normalized;
            }, $values));
            $rows[] = ['row' => $rowNumber, 'data' => $data];
        }

        fclose($stream);

        if ($rows === []) {
            return back()->withErrors(['file' => 'The uploaded CSV has no patient rows.']);
        }

        $teamId = $request->user()->currentTeam->getKey();
        $prepared = [];
        $errors = [];
        $seenPatientNumbers = [];

        foreach ($rows as $row) {
            if (isset($row['error'])) {
                $errors[] = "Row {$row['row']}: {$row['error']}";

                continue;
            }

            $data = $row['data'];
            $validator = Validator::make($data, [
                'slug' => ['required', 'string', 'max:255'],
                'firstName' => ['required', 'string', 'max:255'],
                'lastName' => ['required', 'string', 'max:255'],
                'gender' => ['required', Rule::in(['Male', 'Female'])],
                'birthDate' => ['required', 'date'],
                'phone' => ['required', 'string', 'max:255'],
                'address' => ['required', 'string'],
                'wallet' => ['required', 'numeric'],
                'email' => ['nullable', 'email', 'max:255'],
            ]);

            if ($validator->fails()) {
                $errors[] = "Row {$row['row']}: ".$validator->errors()->first();

                continue;
            }

            $slug = $data['slug'];

            if (isset($seenPatientNumbers[$slug])) {
                $errors[] = "Row {$row['row']}: hospital number {$slug} appears more than once in the file.";

                continue;
            }

            $seenPatientNumbers[$slug] = true;
            $existing = Patient::withTrashed()->where('slug', $slug)->first();
            $existingTeamId = DB::table('patients')->where('slug', $slug)->value('team_id');

            if ($existingTeamId !== null && (int) $existingTeamId !== (int) $teamId) {
                $errors[] = "Row {$row['row']}: hospital number {$slug} is already in use.";

                continue;
            }

            $uniqueColumns = ['email' => 'email', 'art' => 'art', 'slugother' => 'slugOther', 'mobile' => 'mobile'];
            $duplicateValue = null;

            foreach ($uniqueColumns as $field => $column) {
                if (empty($data[$field])) {
                    continue;
                }

                $duplicate = DB::table('patients')->where($column, $data[$field]);

                if ($existing !== null) {
                    $duplicate->where('id', '!=', $existing->getKey());
                }

                if ($duplicate->exists()) {
                    $duplicateValue = $field;
                    break;
                }
            }

            if ($duplicateValue !== null) {
                $errors[] = "Row {$row['row']}: {$duplicateValue} is already in use.";

                continue;
            }

            $category = Category::query()->where('name', $data['category.name'] ?? '')->first();
            $country = Country::query()->where('name', $data['country.name'] ?? '')->first();
            $state = $country ? State::query()->where('country_id', $country->getKey())->where('name', $data['state.name'] ?? '')->first() : null;
            $lga = $state ? Lga::query()->where('state_id', $state->getKey())->where('name', $data['lga.name'] ?? '')->first() : null;

            if (! $category || ! $country || ! $state || ! $lga) {
                $errors[] = "Row {$row['row']}: category, country, state, or local government does not match an available option.";

                continue;
            }

            $prepared[] = [
                'model' => $existing,
                'attributes' => [
                    'team_id' => $teamId,
                    'category_id' => $category->getKey(),
                    'slug' => $slug,
                    'art' => $data['art'] ?? null,
                    'slugOther' => $data['slugother'] ?? null,
                    'firstName' => $data['firstname'],
                    'middleName' => $data['middlename'] ?? null,
                    'lastName' => $data['lastname'],
                    'gender' => $data['gender'],
                    'birthDate' => $data['birthdate'],
                    'email' => $data['email'] ?? null,
                    'phone' => $data['phone'],
                    'mobile' => $data['mobile'] ?? null,
                    'country_id' => $country->getKey(),
                    'state_id' => $state->getKey(),
                    'lga_id' => $lga->getKey(),
                    'address' => $data['address'],
                    'kinFullName' => $data['kinfullname'] ?? null,
                    'kinPhone' => $data['kinphone'] ?? null,
                    'kinEmail' => $data['kinemail'] ?? null,
                    'relation' => $data['relation'] ?? null,
                    'wallet' => $data['wallet'],
                ],
            ];
        }

        if ($errors !== []) {
            return back()->withErrors(['file' => implode(' ', array_slice($errors, 0, 5))]);
        }

        DB::transaction(function () use ($prepared): void {
            foreach ($prepared as $patient) {
                $record = $patient['model'] ?? new Patient;
                $record->forceFill($patient['attributes']);
                $record->save();
                $record->restore();
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => count($prepared).' patient rows imported.']);

        return to_route('patients.index', $request->user()->currentTeam->slug);
    }
}
