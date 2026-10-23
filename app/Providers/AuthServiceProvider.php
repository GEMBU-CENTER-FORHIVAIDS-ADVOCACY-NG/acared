<?php

namespace App\Providers;

use App\Models\Admission;
use App\Models\Appointment;
use App\Models\Billing;
use App\Models\Category;
use App\Models\Complaint;
use App\Models\Country;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Currency;
use App\Models\Diagnose;
use App\Models\DrugForm;
use App\Models\DrugInventory;
use App\Models\Examination;
use App\Models\Facility;
use App\Models\History;
use App\Models\Inventory;
use App\Models\LabInventory;
use App\Models\Laboratory;
use App\Models\Lga;
use App\Models\Line;
use App\Models\Markup;
use App\Models\Method;
use App\Models\Nursing;
use App\Models\OrderItem;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\PriceList;
use App\Models\PurchaseOrder;
use App\Models\State;
use App\Models\Stock;
use App\Models\TestResult;
use App\Models\Treatment;
use App\Models\Vendor;
use App\Models\Vital;
use App\Models\WalletHistory;
use App\Models\Ward;
use App\Policies\AdmissionPolicy;
use App\Policies\AppointmentPolicy;
use App\Policies\BillingPolicy;
use App\Policies\CategoryPolicy;
use App\Policies\ComplaintPolicy;
use App\Policies\CountryPolicy;
use App\Policies\CouponPolicy;
use App\Policies\CouponUsagePolicy;
use App\Policies\CurrencyPolicy;
use App\Policies\DiagnosePolicy;
use App\Policies\DrugFormPolicy;
use App\Policies\DrugInventoryPolicy;
use App\Policies\ExaminationPolicy;
use App\Policies\FacilityPolicy;
use App\Policies\HistoryPolicy;
use App\Policies\InventoryPolicy;
use App\Policies\LabInventoryPolicy;
use App\Policies\LaboratoryPolicy;
use App\Policies\LgaPolicy;
use App\Policies\LinePolicy;
use App\Policies\MarkupPolicy;
use App\Policies\MethodPolicy;
use App\Policies\NursingPolicy;
use App\Policies\OrderItemPolicy;
use App\Policies\PatientPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\PrescriptionPolicy;
use App\Policies\PriceListPolicy;
use App\Policies\PurchaseOrderPolicy;
use App\Policies\StatePolicy;
use App\Policies\StockPolicy;
use App\Policies\TestResultPolicy;
use App\Policies\TreatmentPolicy;
use App\Policies\VendorPolicy;
use App\Policies\VitalPolicy;
use App\Policies\WalletHistoryPolicy;
use App\Policies\WardPolicy;
use App\Support\PermissionRegistrar;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Admission::class => AdmissionPolicy::class,
        Appointment::class => AppointmentPolicy::class,
        Billing::class => BillingPolicy::class,
        Category::class => CategoryPolicy::class,
        Complaint::class => ComplaintPolicy::class,
        Country::class => CountryPolicy::class,
        Coupon::class => CouponPolicy::class,
        CouponUsage::class => CouponUsagePolicy::class,
        Currency::class => CurrencyPolicy::class,
        Diagnose::class => DiagnosePolicy::class,
        DrugForm::class => DrugFormPolicy::class,
        DrugInventory::class => DrugInventoryPolicy::class,
        Examination::class => ExaminationPolicy::class,
        Facility::class => FacilityPolicy::class,
        History::class => HistoryPolicy::class,
        Inventory::class => InventoryPolicy::class,
        LabInventory::class => LabInventoryPolicy::class,
        Laboratory::class => LaboratoryPolicy::class,
        Lga::class => LgaPolicy::class,
        Line::class => LinePolicy::class,
        Markup::class => MarkupPolicy::class,
        Method::class => MethodPolicy::class,
        Nursing::class => NursingPolicy::class,
        OrderItem::class => OrderItemPolicy::class,
        Patient::class => PatientPolicy::class,
        Payment::class => PaymentPolicy::class,
        Prescription::class => PrescriptionPolicy::class,
        PriceList::class => PriceListPolicy::class,
        PurchaseOrder::class => PurchaseOrderPolicy::class,
        State::class => StatePolicy::class,
        Stock::class => StockPolicy::class,
        TestResult::class => TestResultPolicy::class,
        Treatment::class => TreatmentPolicy::class,
        Vendor::class => VendorPolicy::class,
        Vital::class => VitalPolicy::class,
        WalletHistory::class => WalletHistoryPolicy::class,
        Ward::class => WardPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Sync policy-based permissions with Spatie's database
        $this->syncPermissions();

        Gate::guessPolicyNamesUsing(function (string $modelClass): string {
            $modelClass = is_subclass_of($modelClass, Model::class)
                ? $modelClass
                : 'App\\Models\\'.$modelClass;

            return 'App\\Policies\\'.class_basename($modelClass).'Policy';
        });
    }

    /**
     * Synchronize policy-based permissions using the registrar.
     */
    protected function syncPermissions(): void
    {
        // Only sync if the permissions table exists (e.g. skip during tests with in-memory SQLite)
        if (! \Schema::hasTable('permissions')) {
            return;
        }

        app(PermissionRegistrar::class)->syncPermissions();
    }
}
