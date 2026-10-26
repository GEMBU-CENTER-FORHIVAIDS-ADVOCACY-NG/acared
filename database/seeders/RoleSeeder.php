<?php

namespace Database\Seeders;

use App\Support\PermissionRegistrar;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $registrar = app(PermissionRegistrar::class);
        $groupedPermissions = $registrar->getGroupedPermissions();

        // Flatten all available permissions
        $allPermissions = collect($groupedPermissions)
            ->pluck('permissions')
            ->flatten()
            ->mapWithKeys(fn ($name) => [$name => $name])
            ->toArray();

        $roles = [
            'Consultant' => $this->getConsultantPermissions($allPermissions),
            'Nurse' => $this->getNursePermissions($allPermissions),
            'Laboratorist' => $this->getLaboratoristPermissions($allPermissions),
            'Pharmacist' => $this->getPharmacistPermissions($allPermissions),
            'Cashier' => $this->getCashierPermissions($allPermissions),
            'Receptionist' => $this->getReceptionistPermissions($allPermissions),
        ];

        foreach ($roles as $roleName => $permissionNames) {
            $role = Role::firstOrCreate([
                'name' => $roleName,
            ]);

            // Resolve permission IDs from names
            $permissions = Permission::query()
                ->whereIn('name', $permissionNames)
                ->pluck('id')
                ->toArray();

            $role->syncPermissions($permissions);
        }

        // Flush the permission cache
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Consultants have full clinical access: patients, consultations, prescriptions,
     * laboratory orders, nursing records, and reports.
     *
     * @param  array<string, string>  $all
     * @return array<int, string>
     */
    protected function getConsultantPermissions(array $all): array
    {
        $permissions = [];

        // Patients - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('patient', ['viewAny', 'view', 'create', 'update']));

        // Appointments - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('appointment', ['viewAny', 'view', 'create', 'update']));

        // Consultations - full clinical records
        $permissions = array_merge($permissions, $this->getAbilitiesFor('diagnose', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('treatment', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('history', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('examination', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('vital', ['viewAny', 'view', 'create', 'update']));

        // Prescriptions - view and create
        $permissions = array_merge($permissions, $this->getAbilitiesFor('prescription', ['viewAny', 'view', 'create', 'update']));

        // Laboratory - view and create orders
        $permissions = array_merge($permissions, $this->getAbilitiesFor('laboratory', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('testresult', ['viewAny', 'view']));

        // Nursing records - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('nursing', ['viewAny', 'view']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('admission', ['viewAny', 'view']));

        // Billing - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('billing', ['viewAny', 'view']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('payment', ['viewAny', 'view']));

        // Reports - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('report', ['viewAny', 'view']));

        // Categories - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('category', ['viewAny', 'view']));

        // Wards - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('ward', ['viewAny', 'view']));

        // Page-level permissions
        $permissions[] = 'view consultations';
        $permissions[] = 'view laboratories';
        $permissions[] = 'view pharmacy';
        $permissions[] = 'view nursing';
        $permissions[] = 'view reports';
        $permissions[] = 'view markups';
        $permissions[] = 'view methods';

        return $permissions;
    }

    /**
     * Nurses manage nursing records, ward rounds, admissions, vitals, examinations,
     * and can view patients and consultations.
     *
     * @param  array<string, string>  $all
     * @return array<int, string>
     */
    protected function getNursePermissions(array $all): array
    {
        $permissions = [];

        // Patients - view and create
        $permissions = array_merge($permissions, $this->getAbilitiesFor('patient', ['viewAny', 'view', 'create', 'update']));

        // Nursing records - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('nursing', ['viewAny', 'view', 'create', 'update']));

        // Ward rounds and admissions - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('admission', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('ward', ['viewAny', 'view', 'create', 'update']));

        // Clinical records - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('vital', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('examination', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('history', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('treatment', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('diagnose', ['viewAny', 'view', 'create', 'update']));

        // Complaints
        $permissions = array_merge($permissions, $this->getAbilitiesFor('complaint', ['viewAny', 'view', 'create', 'update']));

        // Appointments - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('appointment', ['viewAny', 'view']));

        // Laboratory - view results
        $permissions = array_merge($permissions, $this->getAbilitiesFor('laboratory', ['viewAny', 'view']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('testresult', ['viewAny', 'view']));

        // Prescriptions - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('prescription', ['viewAny', 'view']));

        // Billing - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('billing', ['viewAny', 'view']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('payment', ['viewAny', 'view']));

        // Categories - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('category', ['viewAny', 'view']));

        // Page-level permissions
        $permissions[] = 'view reception';
        $permissions[] = 'view consultations';
        $permissions[] = 'view nursing';
        $permissions[] = 'view laboratories';

        return $permissions;
    }

    /**
     * Laboratorists manage laboratory orders, test results, lab inventory,
     * and lab intake/pricing.
     *
     * @param  array<string, string>  $all
     * @return array<int, string>
     */
    protected function getLaboratoristPermissions(array $all): array
    {
        $permissions = [];

        // Laboratory - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('laboratory', ['viewAny', 'view', 'create', 'update']));

        // Test results - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('testresult', ['viewAny', 'view', 'create', 'update']));

        // Lab inventory - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('labinventory', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('drugform', ['viewAny', 'view', 'create', 'update']));

        // Lab intake and pricing - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('pricelist', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('method', ['viewAny', 'view', 'create', 'update']));

        // Patients - view only
        $permissions = array_merge($permissions, $this->getAbilitiesFor('patient', ['viewAny', 'view']));

        // Appointments - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('appointment', ['viewAny', 'view']));

        // Billing - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('billing', ['viewAny', 'view']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('payment', ['viewAny', 'view']));

        // Reports - view laboratory reports
        $permissions = array_merge($permissions, $this->getAbilitiesFor('report', ['viewAny', 'view']));

        // Categories - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('category', ['viewAny', 'view']));

        // Page-level permissions
        $permissions[] = 'view laboratories';
        $permissions[] = 'view lab-intake';
        $permissions[] = 'view price-lists';
        $permissions[] = 'view reports';
        $permissions[] = 'view methods';

        return $permissions;
    }

    /**
     * Pharmacists manage prescriptions, drug inventory, drug forms,
     * and can view patients and consultations.
     *
     * @param  array<string, string>  $all
     * @return array<int, string>
     */
    protected function getPharmacistPermissions(array $all): array
    {
        $permissions = [];

        // Prescriptions - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('prescription', ['viewAny', 'view', 'create', 'update']));

        // Drug inventory - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('druginventory', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('stock', ['viewAny', 'view', 'create', 'update']));

        // Drug forms - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('drugform', ['viewAny', 'view', 'create', 'update']));

        // Patients - view only
        $permissions = array_merge($permissions, $this->getAbilitiesFor('patient', ['viewAny', 'view']));

        // Appointments - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('appointment', ['viewAny', 'view']));

        // Billing - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('billing', ['viewAny', 'view']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('payment', ['viewAny', 'view']));

        // Categories - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('category', ['viewAny', 'view']));

        // Reports - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('report', ['viewAny', 'view']));

        // Inventory items - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('inventory', ['viewAny', 'view']));

        // Lines (order items) - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('line', ['viewAny', 'view']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('orderitem', ['viewAny', 'view']));

        // Page-level permissions
        $permissions[] = 'view pharmacy';
        $permissions[] = 'view reports';
        $permissions[] = 'view methods';

        return $permissions;
    }

    /**
     * Cashiers manage billing, payments, wallet history, coupons,
     * and can view patients and their records.
     *
     * @param  array<string, string>  $all
     * @return array<int, string>
     */
    protected function getCashierPermissions(array $all): array
    {
        $permissions = [];

        // Billing - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('billing', ['viewAny', 'view', 'create', 'update']));

        // Payments - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('payment', ['viewAny', 'view', 'create', 'update']));

        // Wallet history - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('wallethistory', ['viewAny', 'view', 'create', 'update']));

        // Coupons - full access
        $permissions = array_merge($permissions, $this->getAbilitiesFor('coupon', ['viewAny', 'view', 'create', 'update']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('couponusage', ['viewAny', 'view']));

        // Patients - view only
        $permissions = array_merge($permissions, $this->getAbilitiesFor('patient', ['viewAny', 'view']));

        // Appointments - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('appointment', ['viewAny', 'view']));

        // Prescriptions - view (for billing)
        $permissions = array_merge($permissions, $this->getAbilitiesFor('prescription', ['viewAny', 'view']));

        // Laboratory - view (for billing)
        $permissions = array_merge($permissions, $this->getAbilitiesFor('laboratory', ['viewAny', 'view']));

        // Categories - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('category', ['viewAny', 'view']));

        // Reports - view financial reports
        $permissions = array_merge($permissions, $this->getAbilitiesFor('report', ['viewAny', 'view']));

        // Markups - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('markup', ['viewAny', 'view']));

        // Currency - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('currency', ['viewAny', 'view']));

        // Page-level permissions
        $permissions[] = 'view finance';
        $permissions[] = 'view reports';
        $permissions[] = 'view inventory';
        $permissions[] = 'view coupons';
        $permissions[] = 'view markups';
        $permissions[] = 'view methods';

        return $permissions;
    }

    /**
     * Receptionists manage appointments (reception), patients, and categories.
     * They do not have access to consultations, which are handled by consultants.
     *
     * @param  array<string, string>  $all
     * @return array<int, string>
     */
    protected function getReceptionistPermissions(array $all): array
    {
        $permissions = [];

        // Patients - view and create
        $permissions = array_merge($permissions, $this->getAbilitiesFor('patient', ['viewAny', 'view', 'create', 'update']));

        // Appointments - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('appointment', ['viewAny', 'view', 'create', 'update']));

        // Categories - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('category', ['viewAny', 'view']));

        // Billing - view
        $permissions = array_merge($permissions, $this->getAbilitiesFor('billing', ['viewAny', 'view']));
        $permissions = array_merge($permissions, $this->getAbilitiesFor('payment', ['viewAny', 'view']));

        // Page-level permissions
        $permissions[] = 'view reception';
        $permissions[] = 'view consultations';

        return $permissions;
    }

    /**
     * Get permission names for a given resource and list of abilities.
     *
     * @param  string  $resource  The resource name (e.g., "patient")
     * @param  array<int, string>  $abilities  The abilities to grant (e.g., ["viewAny", "view"])
     * @return array<int, string>
     */
    protected function getAbilitiesFor(string $resource, array $abilities): array
    {
        $registrar = app(PermissionRegistrar::class);

        return array_map(
            fn (string $ability) => $registrar->getPermissionName($resource, $ability),
            $abilities
        );
    }
}
