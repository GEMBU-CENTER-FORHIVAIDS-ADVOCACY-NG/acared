<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogReportController extends Controller
{
    public function index(Request $request, string $current_team): Response
    {
        $user = auth()->user();
        $isAdmin = $user !== null && $user->hasRole('administrator');

        $filters = $this->filters($request);
        $query = $this->query($filters, causerId: $isAdmin ? null : $user?->id);

        $totalActivities = (clone $query)->count();

        $perEventQuery = $this->baseStatsQuery($filters, causerId: $isAdmin ? null : $user?->id);
        $perEventStats = (clone $perEventQuery)
            ->selectRaw('event, count(*) as cnt')
            ->groupBy('event')
            ->orderBy('event')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->event => (int) $row->cnt])
            ->toArray();

        $perSubjectQuery = $this->baseStatsQuery($filters, causerId: $isAdmin ? null : $user?->id);
        $perSubjectStats = (clone $perSubjectQuery)
            ->selectRaw('subject_type, count(*) as cnt')
            ->whereNotNull('subject_type')
            ->groupBy('subject_type')
            ->orderByDesc('cnt')
            ->get()
            ->mapWithKeys(fn ($row) => [$this->subjectLabel($row->subject_type) => (int) $row->cnt])
            ->toArray();

        $causerId = $isAdmin ? null : $user?->id;
        $perUserStats = Activity::query()
            ->when($filters['q'] !== '', function (Builder $builder, string $q): void {
                $builder->where(function (Builder $inner) use ($q): void {
                    $inner->where('description', 'like', '%'.$q.'%')
                        ->orWhere('event', 'like', '%'.$q.'%');
                });
            })
            ->when($filters['event'] !== '', fn (Builder $builder) => $builder->where('event', $filters['event']))
            ->when($filters['from'], fn (Builder $builder, string $from) => $builder->whereDate('activity_log.created_at', '>=', $from))
            ->when($filters['to'], fn (Builder $builder, string $to) => $builder->whereDate('activity_log.created_at', '<=', $to))
            ->when($causerId !== null, fn (Builder $builder) => $builder->where('causer_id', $causerId))
            ->where('causer_type', User::class)
            ->join('users', 'causer_id', '=', 'users.id')
            ->selectRaw('users.name, count(*) as cnt')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('cnt')
            ->limit(10)
            ->get()
            ->mapWithKeys(fn ($row) => [$row->name => (int) $row->cnt])
            ->toArray();

        $activities = (clone $query)
            ->with(['causer'])
            ->latest()
            ->paginate($filters['perPage'])
            ->withQueryString()
            ->through(fn (Activity $activity) => $this->serialize($activity));

        return Inertia::render('reports/activity-logs/index', [
            'filters' => $filters,
            'summary' => [
                'total' => $totalActivities,
                'perEvent' => $perEventStats,
                'perSubject' => $perSubjectStats,
                'perUser' => $perUserStats,
            ],
            'activities' => $activities,
            'availableEvents' => ['created', 'updated', 'deleted', 'logged_in', 'logged_out', 'registered', 'password_reset'],
            'isAdmin' => $isAdmin,
        ]);
    }

    /** @return array{q: string, event: string, from: string, to: string, perPage: int} */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'event' => ['nullable', 'string', Rule::in(['created', 'updated', 'deleted', 'logged_in', 'logged_out', 'registered', 'password_reset', ''])],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'perPage' => ['nullable', 'integer', Rule::in([10, 25, 50, 100])],
        ]);

        $perPage = (int) ($validated['perPage'] ?? 25);

        return [
            'q' => trim((string) ($validated['q'] ?? '')),
            'event' => trim((string) ($validated['event'] ?? '')),
            'from' => $validated['from'] ?? today()->subDays(7)->toDateString(),
            'to' => $validated['to'] ?? today()->toDateString(),
            'perPage' => in_array($perPage, [10, 25, 50, 100], true) ? $perPage : 25,
        ];
    }

    /**
     * Build the main activity query with user scoping.
     *
     * @param  array{q: string, event: string, from: string, to: string, perPage: int}  $filters
     * @return Builder<Activity>
     */
    private function query(array $filters, ?int $causerId = null): Builder
    {
        return $this->baseStatsQuery($filters, causerId: $causerId);
    }

    /**
     * Build a base activity query with filters and optional user scoping.
     *
     * @param  array{q: string, event: string, from: string, to: string, perPage: int}  $filters
     * @return Builder<Activity>
     */
    private function baseStatsQuery(array $filters, ?int $causerId = null): Builder
    {
        return Activity::query()
            ->when($filters['q'] !== '', function (Builder $builder, string $q): void {
                $builder->where(function (Builder $inner) use ($q): void {
                    $inner->where('description', 'like', '%'.$q.'%')
                        ->orWhere('event', 'like', '%'.$q.'%');
                });
            })
            ->when($filters['event'] !== '', fn (Builder $builder) => $builder->where('event', $filters['event']))
            ->when($filters['from'], fn (Builder $builder, string $from) => $builder->whereDate('created_at', '>=', $from))
            ->when($filters['to'], fn (Builder $builder, string $to) => $builder->whereDate('created_at', '<=', $to))
            ->when($causerId !== null, fn (Builder $builder) => $builder->where('causer_id', $causerId));
    }

    /** @return array<string, mixed> */
    private function serialize(Activity $activity): array
    {
        return [
            'id' => $activity->id,
            'description' => $activity->description,
            'event' => $activity->event ?? 'created',
            'subjectType' => $this->subjectLabel($activity->subject_type),
            'subjectId' => $activity->subject_id,
            'causerName' => $activity->causer instanceof Authenticatable
                ? $activity->causer->name
                : null,
            'causerId' => $activity->causer_id,
            'properties' => $activity->properties?->toArray(),
            'createdAt' => $activity->created_at?->toIso8601String(),
        ];
    }

    private function subjectLabel(?string $type): string
    {
        if ($type === null) {
            return '—';
        }

        $map = [
            'App\\Models\\User' => 'User',
            'App\\Models\\Patient' => 'Patient',
            'App\\Models\\Billing' => 'Billing',
            'App\\Models\\Payment' => 'Payment',
            'App\\Models\\Admission' => 'Admission',
            'App\\Models\\PurchaseOrder' => 'Purchase Order',
            'App\\Models\\Inventory' => 'Inventory',
            'App\\Models\\Prescription' => 'Prescription',
            'App\\Models\\Appointment' => 'Appointment',
            'App\\Models\\PriceList' => 'Price List',
            'App\\Models\\Coupon' => 'Coupon',
            'App\\Models\\CouponUsage' => 'Coupon Usage',
            'App\\Models\\DrugForm' => 'Drug Form',
            'App\\Models\\DrugInventory' => 'Drug Inventory',
            'App\\Models\\Laboratory' => 'Laboratory',
            'App\\Models\\LabInventory' => 'Lab Inventory',
            'App\\Models\\Nursing' => 'Nursing',
            'App\\Models\\Vital' => 'Vital',
            'App\\Models\\WalletHistory' => 'Wallet History',
            'App\\Models\\Vendor' => 'Vendor',
            'App\\Models\\Stock' => 'Stock',
            'App\\Models\\Complaint' => 'Complaint',
            'App\\Models\\Examination' => 'Examination',
            'App\\Models\\Diagnose' => 'Diagnose',
            'App\\Models\\Treatment' => 'Treatment',
            'App\\Models\\OrderItem' => 'Order Item',
            'App\\Models\\Line' => 'Line',
            'App\\Models\\History' => 'History',
            'App\\Models\\Consultation' => 'Consultation',
            'App\\Models\\Method' => 'Method',
            'App\\Models\\Markup' => 'Markup',
            'App\\Models\\TestResult' => 'Test Result',
            'App\\Models\\Ward' => 'Ward',
            'App\\Models\\Team' => 'Team',
            'App\\Models\\Category' => 'Category',
            'App\\Models\\Currency' => 'Currency',
        ];

        return $map[$type] ?? class_basename($type);
    }
}
