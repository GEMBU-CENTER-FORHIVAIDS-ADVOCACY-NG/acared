<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\PriceList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DrugCatalogImportController extends Controller
{
    /** @var array<string, string> */
    private const COLUMN_ALIASES = [
        'name' => 'name',
        'category' => 'category',
        'category.name' => 'category',
        'subcategory' => 'subcategory',
        'subcategory.name' => 'subcategory',
        'parameter' => 'parameter',
        'parameter.name' => 'parameter',
        'result_type' => 'result_type',
        'result type' => 'result_type',
        'options' => 'options',
        'description' => 'description',
        'ranges' => 'ranges',
        'uom' => 'uom',
        'unit' => 'uom',
        'is_category' => 'is_category',
        'category row' => 'is_category',
        'is_inventory' => 'is_inventory',
        'inventory' => 'is_inventory',
        'price' => 'price',
    ];

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
        $headers = array_map(fn (mixed $header): string => self::COLUMN_ALIASES[strtolower(trim((string) $header))] ?? strtolower(trim((string) $header)), $headers);
        $rows = [];
        $rowNumber = 1;

        while (($values = fgetcsv($stream, null, ',', '"', '\\')) !== false) {
            $rowNumber++;

            if (count(array_filter($values, fn (mixed $value): bool => trim((string) $value) !== '')) === 0) {
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
            return back()->withErrors(['file' => 'The uploaded CSV has no drug rows.']);
        }

        $teamId = $request->user()->currentTeam->getKey();
        $prepared = [];
        $errors = [];
        $seenNames = [];

        foreach ($rows as $row) {
            if (isset($row['error'])) {
                $errors[] = "Row {$row['row']}: {$row['error']}";

                continue;
            }

            $data = $row['data'];
            $existing = isset($data['name']) ? PriceList::query()->where('name', $data['name'])->first() : null;
            $data['is_category'] = $this->booleanValue($data['is_category'] ?? null);
            $data['is_inventory'] = $this->booleanValue($data['is_inventory'] ?? null);
            $options = $this->options($data['options'] ?? null);

            $validator = Validator::make($data, [
                'name' => ['required', 'string', 'max:255'],
                'is_category' => ['required', 'boolean'],
                'is_inventory' => ['required', 'boolean'],
                'price' => ['nullable', 'integer', 'min:0'],
                'result_type' => ['nullable', Rule::in(['radio', 'number', 'text', 'select'])],
            ]);

            if ($validator->fails()) {
                $errors[] = "Row {$row['row']}: ".$validator->errors()->first();

                continue;
            }

            $duplicateName = PriceList::query()->where('name', $data['name']);

            if ($existing !== null) {
                $duplicateName->where('id', '<>', $existing->getKey());
            }

            if ($duplicateName->exists()) {
                $errors[] = "Row {$row['row']}: item name {$data['name']} is already in use.";

                continue;
            }

            if (isset($seenNames[$data['name']])) {
                $errors[] = "Row {$row['row']}: item name {$data['name']} appears more than once in the file.";

                continue;
            }
            $seenNames[$data['name']] = true;

            if (($data['options'] ?? null) !== null && $options === null && ($data['result_type'] ?? null) === 'select') {
                $errors[] = "Row {$row['row']}: select options must be a JSON array or a newline-separated list.";

                continue;
            }

            $category = isset($data['category'])
                ? PriceList::query()->whereNull('category_id')->where('name', $data['category'])->first()
                : null;
            $subcategory = isset($data['subcategory'])
                ? PriceList::query()->whereNull('subcategory_id')->where('name', $data['subcategory'])
                    ->when($category, fn ($query) => $query->where('category_id', $category->getKey()))
                    ->first()
                : null;
            $parameter = isset($data['parameter'])
                ? PriceList::query()->where('name', $data['parameter'])->first()
                : null;

            if ((isset($data['category']) && ! $category)
                || (isset($data['subcategory']) && ! $subcategory)
                || (isset($data['parameter']) && ! $parameter)) {
                $errors[] = "Row {$row['row']}: a category, subcategory, or parameter name could not be matched.";

                continue;
            }

            $prepared[] = [
                'existing' => $existing,
                'attributes' => [
                    'team_id' => $teamId,
                    'name' => $data['name'],
                    'category_id' => $category?->getKey(),
                    'subcategory_id' => $subcategory?->getKey(),
                    'parameter_id' => $parameter?->getKey(),
                    'result_type' => $data['is_category'] ? null : ($data['result_type'] ?? 'text'),
                    'options' => $data['is_category'] ? null : $options,
                    'description' => $data['description'] ?? null,
                    'ranges' => $data['ranges'] ?? null,
                    'uom' => $data['uom'] ?? null,
                    'is_category' => $data['is_category'],
                    'is_inventory' => $data['is_category'] ? false : $data['is_inventory'],
                    'price' => $data['is_category'] ? null : ($data['price'] ?? 0),
                ],
            ];
        }

        if ($errors !== []) {
            return back()->withErrors(['file' => implode(' ', array_slice($errors, 0, 5))]);
        }

        DB::transaction(function () use ($prepared): void {
            foreach ($prepared as $record) {
                $priceList = $record['existing'] ?? new PriceList;
                $priceList->forceFill($record['attributes'])->save();
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => count($prepared).' drug catalog rows imported.']);

        return to_route('pharmacy.inventories.index', $request->user()->currentTeam->slug);
    }

    private function booleanValue(?string $value): ?bool
    {
        if ($value === null) {
            return null;
        }

        return match (strtolower($value)) {
            '1', 'true', 'yes', 'y' => true,
            '0', 'false', 'no', 'n' => false,
            default => null,
        };
    }

    /** @return list<array{label: string}>|null */
    private function options(?string $value): ?array
    {
        if ($value === null) {
            return null;
        }

        $decoded = json_decode($value, true);
        $values = is_array($decoded) ? $decoded : preg_split('/\r\n|\r|\n/', $value);

        if (! is_array($values)) {
            return null;
        }

        $options = [];

        foreach ($values as $option) {
            $label = is_array($option) ? ($option['label'] ?? null) : $option;

            if (is_string($label) && trim($label) !== '') {
                $options[] = ['label' => trim($label)];
            }
        }

        return $options;
    }
}
