<?php

namespace App\Http\Controllers;

use App\Models\DrugForm;
use App\Models\DrugInventory;
use App\Models\Inventory;
use App\Models\LabInventory;
use App\Models\PriceList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class InventoryImportController extends Controller
{
    /** @var array<string, string> */
    private const COLUMN_ALIASES = [
        'sku' => 'sku',
        'item_code' => 'sku',
        'item code' => 'sku',
        'code' => 'sku',
        'product' => 'name',
        'name' => 'name',
        'description' => 'name',
        'item' => 'name',
        'product form' => 'drug_form',
        'form' => 'drug_form',
        'drug_form' => 'drug_form',
        'minimum quantity' => 'min_qty',
        'min_qty' => 'min_qty',
        'min quantity' => 'min_qty',
        'minimum' => 'min_qty',
        'quantity' => 'quantity',
        'qty' => 'quantity',
        'stock' => 'quantity',
        'price' => 'price',
        'selling price' => 'price',
        'sell price' => 'price',
        'cost' => 'cost',
        'cost price' => 'cost',
        'buy price' => 'cost',
        'unit cost' => 'cost',
        'status' => 'status',
        'expires_at' => 'expires_at',
        'expiry' => 'expires_at',
        'expiry_date' => 'expires_at',
        'expiration' => 'expires_at',
        'expiration_date' => 'expires_at',
    ];

    /** @var array<string, string> */
    private const INVENTORY_TYPES = [
        'stock' => Inventory::class,
        'lab' => LabInventory::class,
        'drug' => DrugInventory::class,
    ];

    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
            'target' => ['required', Rule::in(['stock', 'lab', 'drug'])],
            'mapping' => ['required', 'string'],
        ]);

        $targetType = $validated['target'];
        $modelClass = self::INVENTORY_TYPES[$targetType];

        $mapping = json_decode($validated['mapping'], true);

        if (! is_array($mapping)) {
            return back()->withErrors(['mapping' => 'The column mapping is invalid.']);
        }
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
        $rawHeaders = array_map(fn (mixed $header): string => strtolower(trim((string) $header)), $headers);
        $rows = [];
        $rowNumber = 1;

        while (($values = fgetcsv($stream, null, ',', '"', '\\')) !== false) {
            $rowNumber++;

            if (count(array_filter($values, fn (mixed $value): bool => trim((string) $value) !== '')) === 0) {
                continue;
            }

            if (count($values) !== count($rawHeaders)) {
                $rows[] = ['row' => $rowNumber, 'error' => 'The row has a different number of columns from the header.'];

                continue;
            }

            $data = [];
            foreach ($rawHeaders as $index => $header) {
                $mappedColumn = $mapping[$header] ?? null;
                if ($mappedColumn) {
                    $normalized = trim((string) ($values[$index] ?? ''));
                    $data[$mappedColumn] = $normalized === '' ? null : $normalized;
                }
            }
            $rows[] = ['row' => $rowNumber, 'data' => $data];
        }

        fclose($stream);

        if ($rows === []) {
            return back()->withErrors(['file' => 'The uploaded CSV has no inventory rows.']);
        }

        $teamId = $request->user()->currentTeam->getKey();
        $prepared = [];
        $errors = [];
        $seenSkus = [];

        foreach ($rows as $row) {
            if (isset($row['error'])) {
                $errors[] = "Row {$row['row']}: {$row['error']}";

                continue;
            }

            $data = $row['data'];

            $validator = Validator::make($data, [
                'name' => ['required', 'string', 'max:255'],
                'drug_form' => ['required', 'string', 'max:255'],
                'quantity' => ['required', 'numeric', 'min:0'],
                'price' => ['required', 'numeric', 'min:0'],
                'cost' => ['required', 'numeric', 'min:0'],
                'min_qty' => ['nullable', 'integer', 'min:0'],
                'sku' => ['nullable', 'string', 'max:255'],
                'status' => ['nullable', Rule::in(['low', 'stocked', 'available', 'expired', 'expiring'])],
                'expires_at' => ['nullable', 'date'],
            ]);

            if ($validator->fails()) {
                $errors[] = "Row {$row['row']}: ".$validator->errors()->first();

                continue;
            }

            $priceList = PriceList::query()->where('team_id', $teamId)->where('name', $data['name'])->where('is_inventory', true)->first();

            if (! $priceList) {
                $errors[] = "Row {$row['row']}: Product '{$data['name']}' not found in price list.";

                continue;
            }

            $drugForm = DrugForm::query()->where('team_id', $teamId)->where('name', $data['drug_form'])->first();

            if (! $drugForm) {
                $errors[] = "Row {$row['row']}: Drug form '{$data['drug_form']}' not found.";

                continue;
            }

            $sku = $data['sku'] ?? 'INV-'.str()->upper(str()->random(6));

            if (isset($seenSkus[$sku])) {
                $errors[] = "Row {$row['row']}: SKU '{$sku}' appears more than once in the file.";

                continue;
            }
            $seenSkus[$sku] = true;

            $quantity = (float) $data['quantity'];
            $minQty = (int) ($data['min_qty'] ?? 5);
            $status = $data['status'] ?? ($quantity <= $minQty ? 'low' : 'available');

            $existing = $modelClass::query()
                ->where('team_id', $teamId)
                ->where('sku', $sku)
                ->first();

            $prepared[] = [
                'existing' => $existing,
                'attributes' => [
                    'team_id' => $teamId,
                    'sku' => $sku,
                    'price_list_id' => $priceList->getKey(),
                    'drug_form_id' => $drugForm->getKey(),
                    'min_qty' => $minQty,
                    'quantity' => $quantity,
                    'price' => (float) $data['price'],
                    'cost' => (float) $data['cost'],
                    'status' => $status,
                    'expires_at' => $data['expires_at'] ?? null,
                ],
            ];
        }

        if ($errors !== []) {
            return back()->withErrors(['file' => implode(' ', array_slice($errors, 0, 5))]);
        }

        DB::transaction(function () use ($prepared, $modelClass): void {
            foreach ($prepared as $record) {
                if ($record['existing']) {
                    $record['existing']->update($record['attributes']);
                } else {
                    $modelClass::create($record['attributes']);
                }
            }
        });

        $label = match ($targetType) {
            'lab' => 'lab inventory',
            'drug' => 'drug inventory',
            default => 'stock',
        };

        Inertia::flash('toast', ['type' => 'success', 'message' => count($prepared).' rows imported to '.$label.'.']);

        return match ($targetType) {
            'lab' => to_route('lab-inventories.index', $request->user()->currentTeam->slug),
            'drug' => to_route('pharmacy.inventories.index', $request->user()->currentTeam->slug),
            default => to_route('inventory.stock.index', $request->user()->currentTeam->slug),
        };
    }
}
