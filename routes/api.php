<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Resources\Billings\BillingApiService;
use App\Http\Controllers\Api\Resources\Categories\CategoryApiService;
use App\Http\Controllers\Api\Resources\Consultations\ConsultationApiService;
use App\Http\Controllers\Api\Resources\Coupons\CouponApiService;
use App\Http\Controllers\Api\Resources\DrugForms\DrugFormApiService;
use App\Http\Controllers\Api\Resources\DrugInventories\DrugInventoryApiService;
use App\Http\Controllers\Api\Resources\Inventories\InventoryApiService;
use App\Http\Controllers\Api\Resources\LabInventories\LabInventoryApiService;
use App\Http\Controllers\Api\Resources\Laboratories\LaboratoryApiService;
use App\Http\Controllers\Api\Resources\Markups\MarkupApiService;
use App\Http\Controllers\Api\Resources\Methods\MethodApiService;
use App\Http\Controllers\Api\Resources\Nursings\NursingApiService;
use App\Http\Controllers\Api\Resources\Patients\PatientApiService;
use App\Http\Controllers\Api\Resources\Prescriptions\PrescriptionApiService;
use App\Http\Controllers\Api\Resources\PriceLists\PriceListApiService;
use App\Http\Controllers\Api\Resources\PurchaseOrders\PurchaseOrderApiService;
use App\Http\Controllers\Api\Resources\Users\UserApiService;
use App\Http\Controllers\Api\Resources\Vendors\VendorApiService;
use App\Http\Controllers\Api\Resources\WalletHistories\WalletHistoryApiService;
use App\Http\Controllers\Api\Resources\WardRounds\WardRoundApiService;
use App\Http\Controllers\Api\Resources\Wards\WardApiService;
use Illuminate\Support\Facades\Route;

Route::name('api.')->group(function (): void {
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->name('auth.login')
        ->middleware(config('api-service.login-middleware', []));

    Route::post('/auth/logout', [AuthController::class, 'logout'])
        ->name('auth.logout')
        ->middleware(config('api-service.logout-middleware', []));

    Route::get('/user', [AuthController::class, 'user'])
        ->name('user')
        ->middleware('auth:api');

    BillingApiService::registerRoutes();
    CategoryApiService::registerRoutes();
    ConsultationApiService::registerRoutes();
    CouponApiService::registerRoutes();
    DrugFormApiService::registerRoutes();
    DrugInventoryApiService::registerRoutes();
    InventoryApiService::registerRoutes();
    LabInventoryApiService::registerRoutes();
    LaboratoryApiService::registerRoutes();
    MarkupApiService::registerRoutes();
    MethodApiService::registerRoutes();
    NursingApiService::registerRoutes();
    PatientApiService::registerRoutes();
    PrescriptionApiService::registerRoutes();
    PriceListApiService::registerRoutes();
    PurchaseOrderApiService::registerRoutes();
    UserApiService::registerRoutes();
    VendorApiService::registerRoutes();
    WalletHistoryApiService::registerRoutes();
    WardRoundApiService::registerRoutes();
    WardApiService::registerRoutes();
});
