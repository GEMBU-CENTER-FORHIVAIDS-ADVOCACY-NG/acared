<?php

use App\Http\Controllers\ActivityLogReportController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CategorySalesReportController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ClinicalReportController;
use App\Http\Controllers\ConnectionBadgePingController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\ConsultationRecordController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CouponUsageReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiscountReportController;
use App\Http\Controllers\ErrorController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InventoryImportController;
use App\Http\Controllers\LabIntakeController;
use App\Http\Controllers\LabInventoryController;
use App\Http\Controllers\LaboratoryController;
use App\Http\Controllers\LaboratoryTestsReportController;
use App\Http\Controllers\NursingController;
use App\Http\Controllers\NursingHistoryController;
use App\Http\Controllers\OperationalReportController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientImportExportController;
use App\Http\Controllers\PaymentMethodSalesReportController;
use App\Http\Controllers\Pharmacy\DrugCatalogImportController;
use App\Http\Controllers\Pharmacy\DrugFormController;
use App\Http\Controllers\Pharmacy\DrugInventoryController;
use App\Http\Controllers\Pharmacy\PrescriptionController;
use App\Http\Controllers\PresentPregnancyController;
use App\Http\Controllers\PreviousPregnancyController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\ReceptionController;
use App\Http\Controllers\ReportCatalogController;
use App\Http\Controllers\SalesReportController;
use App\Http\Controllers\Settings\MarkupController;
use App\Http\Controllers\Settings\MethodController;
use App\Http\Controllers\StockReportController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\WalletHistoryController;
use App\Http\Controllers\WardController;
use App\Http\Controllers\WardRoundController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/forbidden', [ErrorController::class, 'forbidden'])->name('forbidden');

Route::get('_connection-badge/ping', ConnectionBadgePingController::class)->name('connection-badge.ping');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        // Patients
        Route::middleware('permission:viewAny patient')->group(function () {
            Route::get('patients', [PatientController::class, 'index'])->name('patients.index');
            Route::get('patients/export', [PatientImportExportController::class, 'export'])->name('patients.export');
            Route::post('patients/import', [PatientImportExportController::class, 'import'])->name('patients.import');
            Route::get('patients/create', [PatientController::class, 'create'])->name('patients.create');
            Route::post('patients', [PatientController::class, 'store'])->name('patients.store');
            Route::delete('patients/bulk', [PatientController::class, 'bulkDestroy'])->name('patients.bulk.destroy');
            Route::delete('patients/bulk-force', [PatientController::class, 'bulkForceDelete'])->name('patients.bulk.forceDelete');
            Route::get('patients/{patient}', [PatientController::class, 'show'])
                ->withTrashed()
                ->name('patients.show');
            Route::get('patients/{patient}/edit', [PatientController::class, 'edit'])
                ->withTrashed()
                ->name('patients.edit');
            Route::patch('patients/{patient}', [PatientController::class, 'update'])
                ->withTrashed()
                ->name('patients.update');
            Route::delete('patients/{patient}', [PatientController::class, 'destroy'])
                ->withTrashed()
                ->name('patients.destroy');
            Route::patch('patients/{patient}/restore', [PatientController::class, 'restore'])
                ->withTrashed()
                ->name('patients.restore');
            Route::delete('patients/{patient}/force', [PatientController::class, 'forceDelete'])
                ->withTrashed()
                ->name('patients.forceDelete');
        });

        // Categories
        Route::middleware('permission:viewAny category')->group(function () {
            Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
            Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
            Route::patch('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
            Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        });

        // Reception
        Route::middleware('permission:view reception')->group(function () {
            Route::get('reception', [ReceptionController::class, 'index'])->name('reception.index');
            Route::post('reception/appointments', [ReceptionController::class, 'storeAppointment'])->name('reception.appointments.store');
            Route::patch('reception/transfer', [ReceptionController::class, 'transfer'])->name('reception.transfer');
            Route::get('reception/appointments/{appointment}/card/{type}', [ReceptionController::class, 'patientCard'])->name('reception.patient.card');
        });

        // Billings
        Route::middleware('permission:view finance')->group(function () {
            Route::get('billings', [BillingController::class, 'index'])->name('billings.index');
            Route::get('billings/patients/search', [BillingController::class, 'searchPatients'])->name('billings.patients.search');
            Route::get('billings/history', [BillingController::class, 'history'])->name('billings.history');
            Route::post('billings', [BillingController::class, 'store'])->name('billings.store');
            Route::post('billings/new', [BillingController::class, 'newBilling'])->name('billings.new');
            Route::delete('billings/bulk', [BillingController::class, 'bulkDestroy'])->name('billings.bulk.destroy');
            Route::get('billings/{billing}', [BillingController::class, 'show'])
                ->withTrashed()
                ->name('billings.show');
            Route::delete('billings/{billing}', [BillingController::class, 'destroy'])
                ->withTrashed()
                ->name('billings.destroy');
        });

        // Reports
        Route::middleware('permission:view reports')->group(function () {
            Route::get('reports', [ReportCatalogController::class, 'index'])->name('reports.index');
            Route::get('reports/financial', [FinanceController::class, 'index'])->name('reports.financial.index');
            Route::get('reports/finance', [FinanceController::class, 'index'])->name('reports.finance');
            Route::get('reports/sales/{dimension?}', [SalesReportController::class, 'index'])->name('reports.sales.index');
            Route::get('reports/sales/{dimension}/export', [SalesReportController::class, 'export'])->name('reports.sales.export');
            Route::get('reports/clinical/{report?}', [ClinicalReportController::class, 'index'])->name('reports.clinical.index');
            Route::get('reports/clinical/{report}/export', [ClinicalReportController::class, 'export'])->name('reports.clinical.export');
            Route::get('reports/coupon-usages', [CouponUsageReportController::class, 'index'])->name('reports.coupon-usages.index');
            Route::get('reports/coupon-usages/export', [CouponUsageReportController::class, 'export'])->name('reports.coupon-usages.export');
            Route::get('reports/discounts', [DiscountReportController::class, 'index'])->name('reports.discounts.index');
            Route::get('reports/discounts/export', [DiscountReportController::class, 'export'])->name('reports.discounts.export');
            Route::get('reports/category-sales-summary', [CategorySalesReportController::class, 'index'])->name('reports.category-sales-summary.index');
            Route::get('reports/category-sales-summary/export', [CategorySalesReportController::class, 'export'])->name('reports.category-sales-summary.export');
            Route::get('reports/payment-method-sales-summary', [PaymentMethodSalesReportController::class, 'index'])->name('reports.payment-method-sales-summary.index');
            Route::get('reports/payment-method-sales-summary/export', [PaymentMethodSalesReportController::class, 'export'])->name('reports.payment-method-sales-summary.export');
            Route::get('reports/wallet', [OperationalReportController::class, 'wallet'])->name('reports.wallet');
            Route::get('reports/wallet/export', [OperationalReportController::class, 'exportWallet'])->name('reports.wallet.export');
            Route::get('reports/employee-deduction', [OperationalReportController::class, 'employeeDeduction'])->name('reports.employee-deduction');
            Route::get('reports/employee-deduction/export', [OperationalReportController::class, 'exportEmployeeDeduction'])->name('reports.employee-deduction.export');
            Route::get('reports/price-list', [OperationalReportController::class, 'priceList'])->name('reports.price-list');
            Route::get('reports/price-list/export', [OperationalReportController::class, 'exportPriceList'])->name('reports.price-list.export');
            Route::get('reports/laboratory', [FinanceController::class, 'laboratory'])->name('reports.laboratory');
            Route::get('reports/laboratory/export', [FinanceController::class, 'exportLaboratory'])->name('reports.laboratory.export');
            Route::get('reports/laboratory-tests', [LaboratoryTestsReportController::class, 'index'])->name('reports.laboratory-tests.index');
            Route::get('reports/laboratory-tests/export', [LaboratoryTestsReportController::class, 'export'])->name('reports.laboratory-tests.export');
            Route::get('reports/stock/{report}/export', [StockReportController::class, 'export'])->name('reports.stock.export');
            Route::get('reports/stock/{report?}', [StockReportController::class, 'index'])->name('reports.stock.index');
            Route::get('reports/activity-logs', [ActivityLogReportController::class, 'index'])->name('reports.activity-logs.index');
        });

        // Laboratories
        Route::middleware('permission:view laboratories')->group(function () {
            Route::get('laboratories', [LaboratoryController::class, 'index'])->name('laboratories.index');
            Route::get('laboratories/patients/search', [LaboratoryController::class, 'searchPatients'])->name('laboratories.patients.search');
            Route::get('laboratories/history', [LaboratoryController::class, 'history'])->name('laboratories.history');
            Route::post('laboratories', [LaboratoryController::class, 'store'])->name('laboratories.store');
            Route::delete('laboratories/bulk', [LaboratoryController::class, 'bulkDestroy'])->name('laboratories.bulk.destroy');
            Route::get('laboratories/{laboratory}', [LaboratoryController::class, 'show'])->name('laboratories.show');
            Route::get('laboratories/{laboratory}/print', [LaboratoryController::class, 'print'])->name('laboratories.print');
            Route::post('laboratories/{laboratory}/results', [LaboratoryController::class, 'storeResults'])->name('laboratories.results.store');
            Route::patch('laboratories/{laboratory}/results', [LaboratoryController::class, 'updateResults'])->name('laboratories.results.update');
            Route::delete('laboratories/{laboratory}', [LaboratoryController::class, 'destroy'])->name('laboratories.destroy');
        });

        // Laboratory JSON endpoint for modal display (accessible without 'view laboratories' permission)
        Route::get('laboratories/{laboratory}/json', [LaboratoryController::class, 'showJson'])->name('laboratories.show.json');

        // Lab Inventories
        Route::middleware('permission:viewAny labinventory')->group(function () {
            Route::get('lab-inventories', [LabInventoryController::class, 'index'])->name('lab-inventories.index');
            Route::post('lab-inventories', [LabInventoryController::class, 'store'])->name('lab-inventories.store');
            Route::post('lab-inventories/adjust', [LabInventoryController::class, 'adjust'])->name('lab-inventories.adjust');
            Route::post('lab-inventories/drug-forms', [LabInventoryController::class, 'storeDrugForm'])->name('lab-inventories.drug-forms.store');
            Route::delete('lab-inventories/bulk', [LabInventoryController::class, 'bulkDestroy'])->name('lab-inventories.bulk.destroy');
            Route::patch('lab-inventories/{lab_inventory}', [LabInventoryController::class, 'update'])->name('lab-inventories.update');
            Route::delete('lab-inventories/{lab_inventory}', [LabInventoryController::class, 'destroy'])->name('lab-inventories.destroy');
        });

        // Lab Intake
        Route::middleware('permission:view lab-intake')->group(function () {
            Route::get('lab-intake', [LabIntakeController::class, 'index'])->name('lab-intake.index');
            Route::get('lab-intake/create', [LabIntakeController::class, 'create'])->name('lab-intake.create');
            Route::post('lab-intake', [LabIntakeController::class, 'store'])->name('lab-intake.store');
            Route::post('lab-intake/subcategories', [LabIntakeController::class, 'storeSubcategory'])->name('lab-intake.subcategories.store');
            Route::get('lab-intake/{price_list}/edit', [LabIntakeController::class, 'edit'])->name('lab-intake.edit');
            Route::patch('lab-intake/{price_list}', [LabIntakeController::class, 'update'])->name('lab-intake.update');
            Route::delete('lab-intake/{price_list}', [LabIntakeController::class, 'destroy'])->name('lab-intake.destroy');
        });

        // Price Lists
        Route::middleware('permission:view price-lists')->group(function () {
            Route::get('price-lists', [LabIntakeController::class, 'allIndex'])->name('price-lists.index');
            Route::get('price-lists/create', [LabIntakeController::class, 'createAll'])->name('price-lists.create');
            Route::post('price-lists', [LabIntakeController::class, 'storeAll'])->name('price-lists.store');
            Route::post('price-lists/subcategories', [LabIntakeController::class, 'storeSubcategory'])->name('price-lists.subcategories.store');
            Route::get('price-lists/{price_list}/edit', [LabIntakeController::class, 'editAll'])->name('price-lists.edit');
            Route::patch('price-lists/{price_list}', [LabIntakeController::class, 'updateAll'])->name('price-lists.update');
            Route::delete('price-lists/{price_list}', [LabIntakeController::class, 'destroyAll'])->name('price-lists.destroy');
        });

        // Products
        Route::middleware('permission:view price-lists')->group(function () {
            Route::get('products', [ProductController::class, 'index'])->name('products.index');
            Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
            Route::post('products', [ProductController::class, 'store'])->name('products.store');
            Route::post('products/subcategories', [ProductController::class, 'storeSubcategory'])->name('products.subcategories.store');
            Route::get('products/{price_list}/edit', [ProductController::class, 'edit'])->name('products.edit');
            Route::patch('products/{price_list}', [ProductController::class, 'update'])->name('products.update');
            Route::delete('products/{price_list}', [ProductController::class, 'destroy'])->name('products.destroy');
        });

        // Pharmacy
        Route::middleware('permission:view pharmacy')->group(function () {
            Route::get('pharmacy', [PrescriptionController::class, 'index'])->name('pharmacy.index');

            Route::get('pharmacy/prescriptions', [PrescriptionController::class, 'index'])->name('pharmacy.prescriptions.index');
            Route::delete('pharmacy/prescriptions/bulk', [PrescriptionController::class, 'bulkDestroy'])->name('pharmacy.prescriptions.bulk.destroy');
            Route::get('pharmacy/prescriptions/create', [PrescriptionController::class, 'create'])->name('pharmacy.prescriptions.create');
            Route::get('pharmacy/prescriptions/patients/search', [PrescriptionController::class, 'searchPatients'])->name('pharmacy.prescriptions.patients.search');
            Route::post('pharmacy/prescriptions', [PrescriptionController::class, 'store'])->name('pharmacy.prescriptions.store');
            Route::get('pharmacy/prescriptions/{prescription}', [PrescriptionController::class, 'show'])->name('pharmacy.prescriptions.show');
            Route::get('pharmacy/prescriptions/{prescription}/edit', [PrescriptionController::class, 'edit'])->name('pharmacy.prescriptions.edit');
            Route::patch('pharmacy/prescriptions/{prescription}', [PrescriptionController::class, 'update'])->name('pharmacy.prescriptions.update');
            Route::post('pharmacy/prescriptions/{prescription}/refund', [PrescriptionController::class, 'refund'])->name('pharmacy.prescriptions.refund');
            Route::post('pharmacy/prescriptions/{prescription}/dispense', [PrescriptionController::class, 'dispense'])->name('pharmacy.prescriptions.dispense');
            Route::delete('pharmacy/prescriptions/{prescription}', [PrescriptionController::class, 'destroy'])->name('pharmacy.prescriptions.destroy');

            Route::get('pharmacy/inventories', [DrugInventoryController::class, 'index'])->name('pharmacy.inventories.index');
            Route::get('pharmacy/inventories/export', [DrugInventoryController::class, 'export'])->name('pharmacy.inventories.export');
            Route::post('pharmacy/inventories/import', [DrugCatalogImportController::class, 'import'])->name('pharmacy.inventories.import');
            Route::post('pharmacy/inventories', [DrugInventoryController::class, 'store'])->name('pharmacy.inventories.store');
            Route::post('pharmacy/inventories/adjust', [DrugInventoryController::class, 'adjust'])->name('pharmacy.inventories.adjust');
            Route::delete('pharmacy/inventories/bulk', [DrugInventoryController::class, 'bulkDestroy'])->name('pharmacy.inventories.bulk.destroy');
            Route::get('pharmacy/inventories/{drug_inventory}', [DrugInventoryController::class, 'show'])->name('pharmacy.inventories.show');
            Route::get('pharmacy/inventories/{drug_inventory}/edit', [DrugInventoryController::class, 'edit'])->name('pharmacy.inventories.edit');
            Route::patch('pharmacy/inventories/{drug_inventory}', [DrugInventoryController::class, 'update'])->name('pharmacy.inventories.update');
            Route::delete('pharmacy/inventories/{drug_inventory}', [DrugInventoryController::class, 'destroy'])->name('pharmacy.inventories.destroy');

            Route::get('pharmacy/drug-forms', [DrugFormController::class, 'index'])->name('pharmacy.drug-forms.index');
            Route::post('pharmacy/drug-forms', [DrugFormController::class, 'store'])->name('pharmacy.drug-forms.store');
            Route::patch('pharmacy/drug-forms/{drug_form}', [DrugFormController::class, 'update'])->name('pharmacy.drug-forms.update');
            Route::delete('pharmacy/drug-forms/{drug_form}', [DrugFormController::class, 'destroy'])->name('pharmacy.drug-forms.destroy');
        });

        // Inventory (Stock, Vendors)
        Route::middleware('permission:view inventory')->group(function () {
            Route::get('vendors', [VendorController::class, 'index'])->name('vendors.index');
            Route::post('vendors', [VendorController::class, 'store'])->name('vendors.store');
            Route::delete('vendors/bulk', [VendorController::class, 'bulkDestroy'])->name('vendors.bulk.destroy');
            Route::patch('vendors/{vendor}', [VendorController::class, 'update'])->name('vendors.update');
            Route::delete('vendors/{vendor}', [VendorController::class, 'destroy'])->name('vendors.destroy');

            Route::get('inventory/stock', [InventoryController::class, 'index'])->name('inventory.stock.index');
            Route::get('inventory/stock/export', [InventoryController::class, 'export'])->name('inventory.stock.export');
            Route::get('inventory/stock/export-stock-taking', [InventoryController::class, 'exportStockTaking'])->name('inventory.stock.export-stock-taking');
            Route::get('inventory/stock/print', [InventoryController::class, 'printStockTaking'])->name('inventory.stock.print');
            Route::post('inventory/stock/import', [InventoryImportController::class, 'import'])->name('inventory.stock.import');
            Route::post('inventory/stock', [InventoryController::class, 'store'])->name('inventory.stock.store');
            Route::post('inventory/stock/adjust', [InventoryController::class, 'adjust'])->name('inventory.stock.adjust');
            Route::post('inventory/stock/transfer', [InventoryController::class, 'transfer'])->name('inventory.stock.transfer');
            Route::delete('inventory/stock/bulk', [InventoryController::class, 'bulkDestroy'])->name('inventory.stock.bulk.destroy');
            Route::get('inventory/stock/{inventory}', [InventoryController::class, 'show'])->name('inventory.stock.show');
            Route::patch('inventory/stock/{inventory}', [InventoryController::class, 'update'])->name('inventory.stock.update');
            Route::delete('inventory/stock/{inventory}', [InventoryController::class, 'destroy'])->name('inventory.stock.destroy');

            Route::get('purchase-orders', [PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
            Route::post('purchase-orders', [PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
            Route::delete('purchase-orders/bulk', [PurchaseOrderController::class, 'bulkDestroy'])->name('purchase-orders.bulk.destroy');
            Route::patch('purchase-orders/{purchaseOrder}/approve', [PurchaseOrderController::class, 'approve'])->name('purchase-orders.approve');
            Route::post('purchase-orders/{purchaseOrder}/post-inventory', [PurchaseOrderController::class, 'postInventory'])->name('purchase-orders.post-inventory');
            Route::patch('purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update'])->name('purchase-orders.update');
            Route::delete('purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'destroy'])->name('purchase-orders.destroy');
        });

        // Nursing
        Route::middleware('permission:view nursing')->group(function () {
            Route::get('nursing/admissions', [WardRoundController::class, 'admissionsIndex'])->name('nursing.admissions.index');
            Route::get('nursing/wards', [WardController::class, 'index'])->name('nursing.wards.index');
            Route::get('nursing/ward-rounds', [WardRoundController::class, 'index'])->name('nursing.ward-rounds.index');
            Route::get('nursing/ward-rounds/{ward}', [WardRoundController::class, 'show'])->name('nursing.ward-rounds.show');
            Route::get('nursing/ward-rounds/admissions/{admission}/{section?}', [WardRoundController::class, 'view'])->name('nursing.ward-rounds.view');
            Route::post('nursing/ward-rounds/admissions/{admission}/records/{type}', [ConsultationRecordController::class, 'storeForAdmission'])->name('nursing.ward-rounds.records.store');
            Route::patch('nursing/ward-rounds/admissions/{admission}/records/{type}/{record}', [ConsultationRecordController::class, 'updateForAdmission'])->name('nursing.ward-rounds.records.update');
            Route::delete('nursing/ward-rounds/admissions/{admission}/records/{type}/{record}', [ConsultationRecordController::class, 'destroyForAdmission'])->name('nursing.ward-rounds.records.destroy');
            Route::post('nursing/ward-rounds/{ward}/admit', [WardRoundController::class, 'admit'])->name('nursing.ward-rounds.admit');
            Route::patch('nursing/ward-rounds/admissions/{admission}/discharge', [WardRoundController::class, 'discharge'])->name('nursing.ward-rounds.discharge');
            Route::get('nursing/records', [NursingController::class, 'index'])->name('nursing.records.index');
            Route::get('nursing/records/history', [NursingController::class, 'history'])->name('nursing.records.history');
            Route::get('nursing/records/{nursing}/{section?}', [NursingController::class, 'view'])->name('nursing.records.view');
            Route::patch('nursing/records/{nursing}/start', [NursingController::class, 'start'])
                ->name('nursing.records.start');
            Route::patch('nursing/records/{nursing}/end', [NursingController::class, 'end'])
                ->name('nursing.records.end');
            Route::patch('nursing/records/{nursing}/transfer', [NursingController::class, 'transfer'])
                ->name('nursing.records.transfer');
            Route::post('nursing/records/{nursing}/records/{type}', [ConsultationRecordController::class, 'storeForNursing'])->name('nursing.records.records.store');
            Route::patch('nursing/records/{nursing}/records/{type}/{record}', [ConsultationRecordController::class, 'updateForNursing'])->name('nursing.records.records.update');
            Route::delete('nursing/records/{nursing}/records/{type}/{record}', [ConsultationRecordController::class, 'destroyForNursing'])->name('nursing.records.records.destroy');

            // Nursing Histories
            Route::get('nursing/records/{nursing}/histories', [NursingHistoryController::class, 'index'])->name('nursing.records.histories.index');
            Route::post('nursing/records/{nursing}/histories', [NursingHistoryController::class, 'store'])->name('nursing.records.histories.store');
            Route::patch('nursing/records/{nursing}/histories/{history}', [NursingHistoryController::class, 'update'])->name('nursing.records.histories.update');
            Route::delete('nursing/records/{nursing}/histories/{history}', [NursingHistoryController::class, 'destroy'])->name('nursing.records.histories.destroy');

            // Present Pregnancy
            Route::get('nursing/records/{nursing}/present-pregnancy', [PresentPregnancyController::class, 'index'])->name('nursing.records.present-pregnancy.index');
            Route::post('nursing/records/{nursing}/present-pregnancy', [PresentPregnancyController::class, 'store'])->name('nursing.records.present-pregnancy.store');
            Route::patch('nursing/records/{nursing}/present-pregnancy/{presentPregnancy}', [PresentPregnancyController::class, 'update'])->name('nursing.records.present-pregnancy.update');
            Route::delete('nursing/records/{nursing}/present-pregnancy/{presentPregnancy}', [PresentPregnancyController::class, 'destroy'])->name('nursing.records.present-pregnancy.destroy');

            // Previous Pregnancy
            Route::get('nursing/records/{nursing}/previous-pregnancy', [PreviousPregnancyController::class, 'index'])->name('nursing.records.previous-pregnancy.index');
            Route::post('nursing/records/{nursing}/previous-pregnancy', [PreviousPregnancyController::class, 'store'])->name('nursing.records.previous-pregnancy.store');
            Route::patch('nursing/records/{nursing}/previous-pregnancy/{previousPregnancy}', [PreviousPregnancyController::class, 'update'])->name('nursing.records.previous-pregnancy.update');
            Route::delete('nursing/records/{nursing}/previous-pregnancy/{previousPregnancy}', [PreviousPregnancyController::class, 'destroy'])->name('nursing.records.previous-pregnancy.destroy');

            Route::post('nursing/records', [NursingController::class, 'store'])->name('nursing.records.store');
            Route::delete('nursing/records/bulk', [NursingController::class, 'bulkDestroy'])->name('nursing.records.bulk.destroy');
            Route::patch('nursing/records/{nursing}', [NursingController::class, 'update'])->name('nursing.records.update');
            Route::delete('nursing/records/{nursing}', [NursingController::class, 'destroy'])->name('nursing.records.destroy');
            Route::post('nursing/wards', [WardController::class, 'store'])->name('nursing.wards.store');
            Route::delete('nursing/wards/bulk', [WardController::class, 'bulkDestroy'])->name('nursing.wards.bulk.destroy');
            Route::patch('nursing/wards/{ward}/restore', [WardController::class, 'restore'])->name('nursing.wards.restore');
            Route::delete('nursing/wards/{ward}/force', [WardController::class, 'forceDestroy'])->name('nursing.wards.forceDestroy');
            Route::patch('nursing/wards/{ward}', [WardController::class, 'update'])->name('nursing.wards.update');
            Route::delete('nursing/wards/{ward}', [WardController::class, 'destroy'])->name('nursing.wards.destroy');
        });

        // Finance (Wallet History)
        Route::middleware('permission:view finance')->group(function () {
            Route::get('finance/wallet-history', [WalletHistoryController::class, 'index'])->name('finance.wallet-history.index');
            Route::get('finance/wallet-history/{wallet_history}', [WalletHistoryController::class, 'show'])->name('finance.wallet-history.show');
            Route::get('finance/wallet-history/patients/search', [WalletHistoryController::class, 'searchPatients'])->name('finance.wallet-history.patients.search');
            Route::post('finance/wallet-history', [WalletHistoryController::class, 'store'])->name('finance.wallet-history.store');
            Route::delete('finance/wallet-history/bulk', [WalletHistoryController::class, 'bulkDestroy'])->name('finance.wallet-history.bulk.destroy');
            Route::patch('finance/wallet-history/{wallet_history}', [WalletHistoryController::class, 'update'])->name('finance.wallet-history.update');
            Route::delete('finance/wallet-history/{wallet_history}', [WalletHistoryController::class, 'destroy'])->name('finance.wallet-history.destroy');
        });

        // Consultations
        Route::middleware('permission:view consultations')->group(function () {
            Route::get('consultations', [ConsultationController::class, 'index'])->name('consultations.index');
            Route::get('consultations/history', [ConsultationController::class, 'history'])->name('consultations.history');
            Route::patch('consultations/{consultation}/start', [ConsultationController::class, 'start'])
                ->name('consultations.start');
            Route::patch('consultations/{consultation}/end', [ConsultationController::class, 'end'])
                ->name('consultations.end');
            Route::patch('consultations/{consultation}/transfer', [ConsultationController::class, 'transfer'])
                ->name('consultations.transfer');

            Route::post('consultations/{consultation}/records/{type}', [ConsultationRecordController::class, 'store'])
                ->name('consultations.records.store');
            Route::patch('consultations/{consultation}/records/{type}/{record}', [ConsultationRecordController::class, 'update'])
                ->name('consultations.records.update');
            Route::delete('consultations/{consultation}/records/{type}/{record}', [ConsultationRecordController::class, 'destroy'])
                ->name('consultations.records.destroy');

            Route::get('consultations/{consultation}/all', [ConsultationController::class, 'viewAll'])
                ->name('consultations.viewAll');

            Route::get('consultations/{consultation}/{section?}', [ConsultationController::class, 'view'])
                ->name('consultations.view');
        });

        // Markups
        Route::middleware('permission:view markups')->group(function () {
            Route::get('markups', [MarkupController::class, 'index'])->name('markups.index');
            Route::post('markups', [MarkupController::class, 'store'])->name('markups.store');
            Route::delete('markups/bulk', [MarkupController::class, 'bulkDestroy'])->name('markups.bulk.destroy');
            Route::patch('markups/{markup}', [MarkupController::class, 'update'])->name('markups.update');
            Route::delete('markups/{markup}', [MarkupController::class, 'destroy'])->name('markups.destroy');
        });

        // Methods
        Route::middleware('permission:view methods')->group(function () {
            Route::get('methods', [MethodController::class, 'index'])->name('methods.index');
            Route::post('methods', [MethodController::class, 'store'])->name('methods.store');
            Route::delete('methods/bulk', [MethodController::class, 'bulkDestroy'])->name('methods.bulk.destroy');
            Route::patch('methods/{method}', [MethodController::class, 'update'])->name('methods.update');
            Route::delete('methods/{method}', [MethodController::class, 'destroy'])->name('methods.destroy');
        });

        // Coupons
        Route::middleware('permission:view coupons')->group(function () {
            Route::get('coupons', [CouponController::class, 'index'])->name('coupons.index');
            Route::get('coupons/patients/search', [CouponController::class, 'searchPatients'])->name('coupons.patients.search');
            Route::post('coupons', [CouponController::class, 'store'])->name('coupons.store');
            Route::patch('coupons/{coupon}/approve', [CouponController::class, 'approve'])->name('coupons.approve');
            Route::patch('coupons/{coupon}/reject', [CouponController::class, 'reject'])->name('coupons.reject');
            Route::delete('coupons/bulk', [CouponController::class, 'bulkDestroy'])->name('coupons.bulk.destroy');
            Route::patch('coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
            Route::delete('coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');
        });

        // Chat
        Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
        Route::post('chat/conversations', [ChatController::class, 'store'])->name('chat.conversations.store');
        Route::get('chat/conversations/{conversation}', [ChatController::class, 'show'])->name('chat.conversations.show');
        Route::post('chat/conversations/{conversation}/messages', [ChatController::class, 'message'])->name('chat.conversations.messages.store');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
