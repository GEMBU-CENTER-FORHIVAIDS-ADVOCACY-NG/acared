<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DiscountReportController extends Controller
{
    public function index(Request $request, string $current_team): Response
    {
        $filters = $this->filters($request);
        $query = $this->query($filters);
        $summary = [
            'count' => (clone $query)->count(),
            'discounts' => (float) (clone $query)->sum('discount_amount'),
            'discount100' => (float) (clone $query)->whereHas('patient.category', fn (Builder $q) => $q->where('discount_percentage', 100))->sum('discount_amount'),
            'discount50' => (float) (clone $query)->whereHas('patient.category', fn (Builder $q) => $q->where('discount_percentage', 50))->sum('discount_amount'),
        ];
        $payments = $query->latest()->paginate($filters['perPage'])->withQueryString()
            ->through(fn (Payment $payment) => [
                'id' => $payment->getKey(),
                'discountPercent' => (int) ($payment->patient?->category?->discount_percentage ?? 0),
                'patientHospitalNo' => $payment->patient?->slug,
                'patient' => $payment->patient?->fullName,
                'patientCategory' => $payment->patient?->category?->name,
                'user' => $payment->user?->name,
                'discountAmount' => (float) $payment->discount_amount,
                'createdAt' => $payment->created_at?->toIso8601String(),
            ]);

        return Inertia::render('reports/discounts', [
            'payments' => $payments,
            'summary' => $summary,
            'filters' => $filters,
        ]);
    }

    public function export(Request $request, string $current_team): StreamedResponse
    {
        $filters = $this->filters($request);
        $payments = $this->query($filters)->latest()->cursor();

        return response()->streamDownload(function () use ($payments): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Hospital No.', 'Patient', 'Category', 'Discount', 'User', 'Discount Amount', 'Date'], ',', '"', '\\');
            foreach ($payments as $payment) {
                fputcsv($output, [
                    $payment->patient?->slug,
                    $payment->patient?->fullName,
                    $payment->patient?->category?->name,
                    $payment->patient?->category?->discount_percentage ? $payment->patient->category->discount_percentage.'%' : '',
                    $payment->user?->name,
                    $payment->discount_amount,
                    $payment->created_at,
                ], ',', '"', '\\');
            }
            fclose($output);
        }, 'discount-report.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * @param  array{from: string, to: string, perPage: int, discountType: string}  $filters
     * @return Builder<Payment>
     */
    private function query(array $filters): Builder
    {
        $query = Payment::query()
            ->with(['patient.category', 'method', 'user'])
            ->whereHas('method', fn (Builder $q) => $q->where('name', 'Discount'))
            ->whereBetween('created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59']);

        if ($filters['discountType'] === '100') {
            $query->whereHas('patient.category', fn (Builder $q) => $q->where('discount_percentage', 100));
        } elseif ($filters['discountType'] === '50') {
            $query->whereHas('patient.category', fn (Builder $q) => $q->where('discount_percentage', 50));
        }

        return $query;
    }

    /** @return array{from: string, to: string, perPage: int, discountType: string} */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'perPage' => ['nullable', 'integer', Rule::in([10, 25, 50, 100])],
            'discountType' => ['nullable', Rule::in(['all', '100', '50'])],
        ]);

        return [
            'from' => $validated['from'] ?? today()->toDateString(),
            'to' => $validated['to'] ?? today()->toDateString(),
            'perPage' => (int) ($validated['perPage'] ?? 25),
            'discountType' => $validated['discountType'] ?? 'all',
        ];
    }
}
