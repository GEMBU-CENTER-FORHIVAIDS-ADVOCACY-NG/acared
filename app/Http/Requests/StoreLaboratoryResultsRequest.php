<?php

namespace App\Http\Requests;

use App\Models\LabInventory;
use App\Models\Laboratory;
use App\Models\PriceList;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Collection;

class StoreLaboratoryResultsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $teamId = $this->user()?->currentTeam?->getKey();
        $laboratory = $this->route('laboratory');

        return [
            'lines' => ['nullable', 'array'],
            'lines.*' => ['nullable'],
            'testResults' => ['nullable', 'array'],
            'testResults.*' => ['nullable', 'array'],
            'testResults.*.*.price_list_id' => ['required_with:testResults', 'integer'],
            'testResults.*.*.result' => ['nullable', 'string'],
        ];
    }

    /**
     * Validate that each submitted test has a corresponding lab inventory record
     * with sufficient stock before the results are persisted.
     *
     * @return array<string, string>
     */
    public function validateInventoryAvailability(): array
    {
        $laboratory = $this->route('laboratory');
        if (! $laboratory instanceof Laboratory) {
            return [];
        }

        $teamId = $this->user()?->currentTeam?->getKey();
        $errors = [];

        $lines = $laboratory->lines()
            ->where('lineable_type', Laboratory::class)
            ->where('lineable_id', $laboratory->getKey())
            ->get();

        // Gather all price_list_ids being submitted with results
        $submittedPriceListIds = $this->getSubmittedPriceListIds($lines);

        if ($submittedPriceListIds->isEmpty()) {
            return [];
        }

        // Load lab inventories for all submitted tests
        $labInventories = LabInventory::query()
            ->whereIn('price_list_id', $submittedPriceListIds->all())
            ->get()
            ->keyBy('price_list_id');

        // Load price lists for naming
        $priceLists = PriceList::query()
            ->whereIn('id', $submittedPriceListIds->all())
            ->get()
            ->keyBy('id');

        foreach ($submittedPriceListIds as $priceListId) {
            $labInventory = $labInventories->get($priceListId);
            $priceList = $priceLists->get($priceListId);
            $testName = $priceList?->name ?? "Test #{$priceListId}";

            if (! $labInventory) {
                $errors["inventory.{$priceListId}"] = "Lab inventory not found for {$testName}. Cannot submit result without inventory record.";

                continue;
            }

            if ($labInventory->quantity <= 0) {
                $errors["inventory.{$priceListId}"] = "No stock available for {$testName}. Current quantity: 0.";

                continue;
            }

            if ($labInventory->quantity <= $labInventory->min_qty) {
                $errors["inventory.{$priceListId}"] = "Low stock for {$testName}. Current quantity: {$labInventory->quantity} (minimum: {$labInventory->min_qty}).";
            }
        }

        return $errors;
    }

    /**
     * Extract all price list IDs that have non-empty results being submitted.
     *
     * @return Collection<int, int>
     */
    private function getSubmittedPriceListIds(\Illuminate\Database\Eloquent\Collection $lines): Collection
    {
        $submittedIds = collect();

        // From simple lines: lines.* with non-null results
        foreach (($this->input('lines') ?? []) as $priceListId => $result) {
            if ($result !== null && $result !== '') {
                $submittedIds->push((int) $priceListId);
            }
        }

        // From parameterized test results
        foreach (($this->input('testResults') ?? []) as $parentPriceListId => $rows) {
            if (! is_array($rows)) {
                continue;
            }

            $hasResult = false;
            foreach ($rows as $row) {
                if (! empty($row['result'])) {
                    $hasResult = true;
                    break;
                }
            }

            if ($hasResult) {
                $submittedIds->push((int) $parentPriceListId);
            }
        }

        return $submittedIds->unique();
    }
}
