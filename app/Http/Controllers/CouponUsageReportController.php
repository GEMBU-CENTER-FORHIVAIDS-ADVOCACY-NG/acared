<?php

namespace App\Http\Controllers;

use App\Models\CouponUsage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CouponUsageReportController extends Controller
{
    public function index(Request $request, string $current_team): Response
    {
        $filters = $this->filters($request);
        $query = $this->query($filters);
        $summary = [
            'usages' => (clone $query)->count(),
            'discounts' => (float) (clone $query)->sum('discount_amount'),
        ];
        $usages = $query->latest()->paginate($filters['perPage'])->withQueryString()
            ->through(fn (CouponUsage $usage) => [
                'id' => $usage->getKey(),
                'code' => $usage->coupon?->code,
                'patientHospitalNo' => $usage->payment?->patient?->slug,
                'patient' => $usage->payment?->patient?->fullName,
                'paymentMethod' => $usage->payment?->method?->name,
                'user' => $usage->user?->name,
                'discountAmount' => (float) $usage->discount_amount,
                'createdAt' => $usage->created_at?->toIso8601String(),
            ]);

        return Inertia::render('reports/coupon-usages', [
            'usages' => $usages,
            'summary' => $summary,
            'filters' => $filters,
        ]);
    }

    public function export(Request $request, string $current_team): StreamedResponse
    {
        $filters = $this->filters($request);
        $usages = $this->query($filters)->latest()->cursor();

        return response()->streamDownload(function () use ($usages): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Coupon', 'Hospital No.', 'Patient', 'Payment Method', 'User', 'Discount', 'Date'], ',', '"', '\\');
            foreach ($usages as $usage) {
                fputcsv($output, [
                    $usage->coupon?->code,
                    $usage->payment?->patient?->slug,
                    $usage->payment?->patient?->fullName,
                    $usage->payment?->method?->name,
                    $usage->user?->name,
                    $usage->discount_amount,
                    $usage->created_at,
                ], ',', '"', '\\');
            }
            fclose($output);
        }, 'coupon-usage-report.csv', ['Content-Type' => 'text/csv']);
    }

    /**
     * @param  array{from: string, to: string, perPage: int}  $filters
     * @return Builder<CouponUsage>
     */
    private function query(array $filters): Builder
    {
        return CouponUsage::query()
            ->with(['coupon', 'payment.patient', 'payment.method', 'user'])
            ->whereHas('coupon')
            ->whereBetween('created_at', [$filters['from'].' 00:00:00', $filters['to'].' 23:59:59']);
    }

    /** @return array{from: string, to: string, perPage: int} */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'perPage' => ['nullable', 'integer', Rule::in([10, 25, 50, 100])],
        ]);

        return [
            'from' => $validated['from'] ?? today()->startOfMonth()->toDateString(),
            'to' => $validated['to'] ?? today()->toDateString(),
            'perPage' => (int) ($validated['perPage'] ?? 25),
        ];
    }
}
