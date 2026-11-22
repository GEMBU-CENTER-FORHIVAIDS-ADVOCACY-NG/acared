<?php

namespace App\Service;

use App\Models\Billing;
use App\Models\Line;
use App\Models\Method;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PriceList;
use App\Models\Team;
use App\Models\User;
use App\Models\WalletHistory;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class EmployeeDeductionImporter
{
    /** @var array<string, string> */
    private const HEADER_ALIASES = [
        'hospitalno' => 'hospital_no',
        'hospitalnumber' => 'hospital_no',
        'hospitalid' => 'hospital_no',
        'patienthospitalno' => 'hospital_no',
        'patienthospitalnumber' => 'hospital_no',
        'patientid' => 'hospital_no',
        'patientno' => 'hospital_no',
        'slug' => 'hospital_no',
        'name' => 'name',
        'patient' => 'name',
        'patientname' => 'name',
        'employeename' => 'name',
        'amount' => 'amount',
        'deduction' => 'amount',
        'deductionamount' => 'amount',
    ];

    /**
     * Import employee deductions from a CSV or Excel upload.
     *
     * @return array{imported: int, skipped: int, errors: list<string>}
     */
    public function handle(UploadedFile $file, Team $team, User $user): array
    {
        $rows = $this->readRows($file);
        $header = array_shift($rows) ?? [];
        $columns = $this->mapHeaders($header);
        $missing = array_diff(['hospital_no', 'name', 'amount'], array_values($columns));

        if ($missing !== []) {
            throw new InvalidArgumentException(
                'The uploaded file must include hospital number, name, and amount columns.',
            );
        }

        $preparedRows = [];
        $errors = [];

        foreach ($rows as $index => $values) {
            $rowNumber = $index + 2;
            $row = $this->rowValues($values, $columns);

            if ($this->isEmptyRow($row)) {
                continue;
            }

            $preparedRows[] = ['row' => $rowNumber, 'values' => $row];
        }

        if ($preparedRows === []) {
            throw new InvalidArgumentException('The uploaded file has no deduction rows.');
        }

        $hospitalNumberCounts = array_count_values(array_map(
            fn (array $prepared): string => Str::lower($this->stringValue($prepared['values']['hospital_no'] ?? null)),
            $preparedRows,
        ));

        $validRows = [];

        foreach ($preparedRows as $prepared) {
            $rowNumber = $prepared['row'];
            $values = $prepared['values'];
            $hospitalNumber = $this->stringValue($values['hospital_no'] ?? null);

            if (($hospitalNumberCounts[Str::lower($hospitalNumber)] ?? 0) > 1) {
                $errors[] = "Row {$rowNumber}: hospital number {$hospitalNumber} appears more than once in the file.";

                continue;
            }

            $validator = Validator::make([
                'hospital_no' => $hospitalNumber,
                'name' => $this->stringValue($values['name'] ?? null),
                'amount' => $this->numericValue($values['amount'] ?? null),
            ], [
                'hospital_no' => ['required', 'string', 'max:255'],
                'name' => ['nullable', 'string', 'max:255'],
                'amount' => ['required', 'numeric', 'min:0.01'],
            ], [
                'hospital_no.required' => 'The hospital number is required.',
                'amount.required' => 'The amount is required.',
                'amount.numeric' => 'The amount must be a number.',
                'amount.min' => 'The amount must be greater than zero.',
            ]);

            if ($validator->fails()) {
                $errors[] = "Row {$rowNumber}: ".$validator->errors()->first();

                continue;
            }

            $patient = Patient::query()
                ->where('team_id', $team->getKey())
                ->whereRaw('LOWER(slug) = ?', [Str::lower($hospitalNumber)])
                ->first();

            if (! $patient) {
                $errors[] = "Row {$rowNumber}: hospital number {$hospitalNumber} does not match a patient in this team.";

                continue;
            }

            $validRows[] = [
                'patient' => $patient,
                'amount' => round((float) $validator->validated()['amount'], 2),
            ];
        }

        if ($validRows !== []) {
            $this->persist($validRows, $team, $user);
        }

        return [
            'imported' => count($validRows),
            'skipped' => count($errors),
            'errors' => $errors,
        ];
    }

    /**
     * @return list<array<int, mixed>>
     */
    private function readRows(UploadedFile $file): array
    {
        try {
            $sheets = Excel::toCollection(null, $file);
        } catch (Throwable $exception) {
            throw new InvalidArgumentException(
                'The uploaded file could not be read as a CSV or Excel file.',
                0,
                $exception,
            );
        }

        $sheet = $sheets->first();
        $normalized = [];

        foreach ($sheet ?? [] as $row) {
            if ($row instanceof Collection) {
                $normalized[] = array_values($row->all());
            } elseif (is_array($row)) {
                $normalized[] = array_values($row);
            } else {
                $normalized[] = [];
            }
        }

        return $normalized;
    }

    /**
     * @param  array<int, mixed>  $header
     * @return array<int, string>
     */
    private function mapHeaders(array $header): array
    {
        $columns = [];

        foreach ($header as $index => $value) {
            $key = $this->normalizeHeader($value);
            $field = self::HEADER_ALIASES[$key] ?? $this->inferHeaderField($key);

            if ($field !== null && ! in_array($field, $columns, true)) {
                $columns[$index] = $field;
            }
        }

        return $columns;
    }

    /**
     * @param  array<int, mixed>  $values
     * @param  array<int, string>  $columns
     * @return array<string, mixed>
     */
    private function rowValues(array $values, array $columns): array
    {
        $row = [];

        foreach ($columns as $index => $field) {
            $row[$field] = $values[$index] ?? null;
        }

        return $row;
    }

    /**
     * @param  array<string, mixed>  $row
     */
    private function isEmptyRow(array $row): bool
    {
        foreach ($row as $value) {
            if ($this->stringValue($value) !== '') {
                return false;
            }
        }

        return true;
    }

    private function inferHeaderField(string $key): ?string
    {
        if ($key === '') {
            return null;
        }

        if (str_contains($key, 'hospital') && (str_contains($key, 'no') || str_contains($key, 'number') || str_contains($key, 'id'))) {
            return 'hospital_no';
        }

        if (str_contains($key, 'patient') && (str_contains($key, 'no') || str_contains($key, 'number') || str_contains($key, 'id'))) {
            return 'hospital_no';
        }

        if (str_contains($key, 'amount') || str_contains($key, 'deduction')) {
            return 'amount';
        }

        return str_contains($key, 'name') ? 'name' : null;
    }

    private function normalizeHeader(mixed $value): string
    {
        $header = Str::lower(Str::replaceFirst("\u{FEFF}", '', $this->stringValue($value)));

        return (string) preg_replace('/[^a-z0-9]/', '', $header);
    }

    private function numericValue(mixed $value): ?string
    {
        $text = $this->stringValue($value);

        if ($text === '') {
            return null;
        }

        $normalized = preg_replace('/[^0-9.\-]/', '', $text);

        if ($normalized === null || $normalized === '' || $normalized === '-' || $normalized === '.') {
            return $text;
        }

        return $normalized;
    }

    private function stringValue(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if (is_float($value) && floor($value) === $value) {
            return (string) (int) $value;
        }

        if (is_scalar($value) || $value instanceof \Stringable) {
            return trim((string) $value);
        }

        return '';
    }

    /**
     * @param  list<array{patient: Patient, amount: float}>  $validRows
     */
    private function persist(array $validRows, Team $team, User $user): void
    {
        DB::transaction(function () use ($validRows, $team, $user): void {
            $chequeMethod = Method::withoutGlobalScope('team')->firstOrCreate(
                ['name' => 'Cheque'],
                [
                    'team_id' => $team->getKey(),
                    'description' => 'Cheque payment method',
                ],
            );

            $depositPriceList = PriceList::withoutGlobalScope('team')->withTrashed()->firstOrCreate(
                ['name' => 'Deposit'],
                [
                    'team_id' => $team->getKey(),
                    'description' => 'Wallet deposit category',
                    'price' => 0,
                    'is_category' => true,
                    'is_inventory' => false,
                ],
            );

            if ($depositPriceList->trashed()) {
                $depositPriceList->restore();
            }

            foreach ($validRows as $row) {
                $patient = $row['patient'];
                $amount = $row['amount'];

                $patient->decrement('wallet', $amount);

                $payment = Payment::create([
                    'team_id' => $team->getKey(),
                    'patient_id' => $patient->slug,
                    'user_id' => $user->getKey(),
                    'method_id' => $chequeMethod->getKey(),
                    'amount' => $amount,
                    'wallet' => -$amount,
                ]);

                $walletHistory = WalletHistory::withoutEvents(
                    fn () => WalletHistory::create([
                        'team_id' => $team->getKey(),
                        'patient_id' => $patient->slug,
                        'user_id' => $user->getKey(),
                        'payment_id' => $payment->getKey(),
                        'method_id' => $chequeMethod->getKey(),
                        'credit' => $amount,
                    ]),
                );

                Billing::create([
                    'team_id' => $team->getKey(),
                    'patient_id' => $patient->slug,
                    'user_id' => $user->getKey(),
                    'billable_type' => WalletHistory::class,
                    'billable_id' => $walletHistory->getKey(),
                    'total' => $amount,
                    'status' => 'paid',
                ]);

                Line::create([
                    'team_id' => $team->getKey(),
                    'patient_id' => $patient->slug,
                    'user_id' => $user->getKey(),
                    'price_list_id' => $depositPriceList->getKey(),
                    'quantity' => 1,
                    'unitPrice' => $amount,
                    'paid' => true,
                    'lineable_type' => WalletHistory::class,
                    'lineable_id' => $walletHistory->getKey(),
                ]);
            }
        });
    }
}
