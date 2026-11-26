<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\PatientApiController;
use App\Http\Controllers\Api\UserApiController;
use App\Http\Controllers\Api\V1\AdmissionController;
use App\Http\Controllers\Api\V1\AppointmentController;
use App\Http\Controllers\Api\V1\BillingController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ClinicalRecordController;
use App\Http\Controllers\Api\V1\ConsultationController;
use App\Http\Controllers\Api\V1\LaboratoryController;
use App\Http\Controllers\Api\V1\NursingController;
use App\Http\Controllers\Api\V1\PatientController;
use App\Http\Controllers\Api\V1\PrescriptionController;
use App\Http\Controllers\Api\V1\TeamController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\WardController;
use App\Http\Controllers\Api\V1\WardRoundController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/users', [UserApiController::class, 'index'])->name('api.users.index');
    Route::post('/users', [UserApiController::class, 'store'])->name('api.users.store');
    Route::get('/users/{user}', [UserApiController::class, 'show'])->name('api.users.show');

    Route::get('/categories', [CategoryApiController::class, 'index'])->name('api.categories.index');
    Route::post('/categories', [CategoryApiController::class, 'store'])->name('api.categories.store');
    Route::get('/categories/{category}', [CategoryApiController::class, 'show'])->name('api.categories.show');
    Route::put('/categories/{category}', [CategoryApiController::class, 'update'])->name('api.categories.update');
    Route::patch('/categories/{category}', [CategoryApiController::class, 'update'])->name('api.categories.patch');
    Route::delete('/categories/{category}', [CategoryApiController::class, 'destroy'])->name('api.categories.destroy');

    Route::get('/patients', [PatientApiController::class, 'index'])->name('api.patients.index');
    Route::get('/patients/{patient}', [PatientApiController::class, 'show'])->name('api.patients.show');
    Route::post('/patients', [PatientApiController::class, 'store'])->name('api.patients.store');
});

Route::prefix('v1')->name('api.v1.')->middleware('api.v1.json')->group(function () {
    Route::post('/auth/login', [App\Http\Controllers\Api\V1\AuthController::class, 'login'])->name('auth.login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [App\Http\Controllers\Api\V1\AuthController::class, 'logout'])->name('auth.logout');
        Route::get('/auth/me', [App\Http\Controllers\Api\V1\AuthController::class, 'me'])->name('auth.me');

        Route::get('/teams', [TeamController::class, 'index'])->name('teams.index');
        Route::get('/teams/{team:slug}', [TeamController::class, 'show'])->name('teams.show');

        Route::middleware('team.api')->group(function () {
            Route::middleware('permission.api:viewAny category|view category|view patient categories|viewAny patient categories')->group(function () {
                Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
                Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');
                Route::middleware('permission.api:create category')->post('/categories', [CategoryController::class, 'store'])->name('categories.store');
                Route::middleware('permission.api:update category')->match(['put', 'patch'], '/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
                Route::middleware('permission.api:delete category')->delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
            });

            Route::middleware('permission.api:view finance|viewAny patient|view patient|view patients')->group(function () {
                Route::get('/patients/form-options', [PatientController::class, 'formOptions'])->name('patients.form-options');
                Route::get('/patients', [PatientController::class, 'index'])->name('patients.index');
                Route::get('/patients/{patient:slug}', [PatientController::class, 'show'])->name('patients.show');
                Route::middleware('permission.api:create patient|view finance')->post('/patients', [PatientController::class, 'store'])->name('patients.store');
                Route::middleware('permission.api:update patient|view finance')->match(['put', 'patch'], '/patients/{patient:slug}', [PatientController::class, 'update'])->name('patients.update');
            });

            Route::middleware('permission.api:view users')->group(function () {
                Route::get('/users', [UserController::class, 'index'])->name('users.index');
                Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
            });

            Route::middleware('permission.api:view reception')->group(function () {
                Route::get('/appointments/slots', [AppointmentController::class, 'slots'])->name('appointments.slots');
                Route::get('/appointments', [AppointmentController::class, 'index'])->name('appointments.index');
                Route::middleware('permission.api:create appointment')->post('/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
                Route::get('/appointments/{appointment}', [AppointmentController::class, 'show'])->name('appointments.show');
                Route::middleware('permission.api:update appointment')->post('/appointments/{appointment}/transfer', [AppointmentController::class, 'transfer'])->name('appointments.transfer');
                Route::middleware('permission.api:update appointment')->post('/appointments/{appointment}/cancel', [AppointmentController::class, 'cancel'])->name('appointments.cancel');
            });

            Route::middleware('permission.api:view nursing')->group(function () {
                Route::get('/wards', [WardController::class, 'index'])->name('wards.index');
                Route::middleware('permission.api:create ward|update nursing')->post('/wards', [WardController::class, 'store'])->name('wards.store');
                Route::middleware('permission.api:delete ward|update nursing')->post('/wards/bulk-delete', [WardController::class, 'bulkDestroy'])->name('wards.bulk-destroy');
                Route::middleware('permission.api:update ward|update nursing')->post('/wards/{ward}/restore', [WardController::class, 'restore'])->name('wards.restore');
                Route::middleware('permission.api:delete ward|update nursing')->delete('/wards/{ward}/force', [WardController::class, 'forceDestroy'])->name('wards.force-destroy');
                Route::get('/wards/{ward}', [WardController::class, 'show'])->name('wards.show');
                Route::middleware('permission.api:update ward|update nursing')->match(['put', 'patch'], '/wards/{ward}', [WardController::class, 'update'])->name('wards.update');
                Route::middleware('permission.api:delete ward|update nursing')->delete('/wards/{ward}', [WardController::class, 'destroy'])->name('wards.destroy');
                Route::middleware('permission.api:update nursing')->post('/wards/{ward}/admit', [AdmissionController::class, 'admit'])->name('wards.admit');
                Route::get('/ward-round/patients/search', [WardRoundController::class, 'patientSearch'])->name('ward-round.patients.search');
                Route::get('/ward-round/options', [WardRoundController::class, 'billingOptions'])->name('ward-round.options');

                Route::get('/admissions/search', [AdmissionController::class, 'search'])->name('admissions.search');
                Route::get('/admissions/history', [AdmissionController::class, 'history'])->name('admissions.history');
                Route::get('/admissions/dashboard-counts', [AdmissionController::class, 'dashboardCounts'])->name('admissions.dashboard-counts');
                Route::get('/admissions', [AdmissionController::class, 'index'])->name('admissions.index');
                Route::middleware('permission.api:create admission|update nursing')->post('/admissions', [AdmissionController::class, 'store'])->name('admissions.store');
                Route::get('/admissions/{admission}', [AdmissionController::class, 'show'])->name('admissions.show');
                Route::middleware('permission.api:update nursing')->post('/admissions/{admission}/discharge', [AdmissionController::class, 'discharge'])->name('admissions.discharge');
                Route::middleware('permission.api:update nursing')->post('/admissions/{admission}/cancel', [AdmissionController::class, 'cancel'])->name('admissions.cancel');
                Route::middleware('permission.api:update nursing')->post('/admissions/{admission}/transfer', [AdmissionController::class, 'transfer'])->name('admissions.transfer');
                Route::get('/admissions/{admission}/records', [ClinicalRecordController::class, 'admissionIndex'])->name('admissions.records.index');
                Route::get('/admissions/{admission}/records/options', [ClinicalRecordController::class, 'admissionOptions'])->name('admissions.records.options');
                Route::middleware('permission.api:update nursing')->post('/admissions/{admission}/records/{type}', [ClinicalRecordController::class, 'storeForAdmission'])->name('admissions.records.store');
                Route::middleware('permission.api:update nursing')->match(['put', 'patch'], '/admissions/{admission}/records/{type}/{record}', [ClinicalRecordController::class, 'updateForAdmission'])->name('admissions.records.update');
                Route::middleware('permission.api:update nursing')->delete('/admissions/{admission}/records/{type}/{record}', [ClinicalRecordController::class, 'destroyForAdmission'])->name('admissions.records.destroy');

                Route::get('/nursing', [NursingController::class, 'index'])->name('nursing.index');
                Route::middleware('permission.api:create nursing')->post('/nursing', [NursingController::class, 'store'])->name('nursing.store');
                Route::get('/nursing/{nursing}', [NursingController::class, 'show'])->name('nursing.show');
                Route::get('/nursing/{nursing}/records', [ClinicalRecordController::class, 'nursingIndex'])->name('nursing.records.index');
                Route::get('/nursing/{nursing}/records/options', [ClinicalRecordController::class, 'nursingOptions'])->name('nursing.records.options');
                Route::middleware('permission.api:update nursing')->post('/nursing/{nursing}/start', [NursingController::class, 'start'])->name('nursing.start');
                Route::middleware('permission.api:update nursing')->post('/nursing/{nursing}/vitals', [NursingController::class, 'storeVitals'])->name('nursing.vitals.store');
                Route::middleware('permission.api:update nursing')->post('/nursing/{nursing}/complete', [NursingController::class, 'complete'])->name('nursing.complete');
                Route::middleware('permission.api:update nursing')->post('/nursing/{nursing}/transfer', [NursingController::class, 'transfer'])->name('nursing.transfer');
                Route::middleware('permission.api:update nursing')->post('/nursing/{nursing}/records/{type}', [ClinicalRecordController::class, 'storeForNursing'])->name('nursing.records.store');
                Route::middleware('permission.api:update nursing')->match(['put', 'patch'], '/nursing/{nursing}/records/{type}/{record}', [ClinicalRecordController::class, 'updateForNursing'])->name('nursing.records.update');
                Route::middleware('permission.api:update nursing')->delete('/nursing/{nursing}/records/{type}/{record}', [ClinicalRecordController::class, 'destroyForNursing'])->name('nursing.records.destroy');
            });

            Route::middleware('permission.api:view consultations')->group(function () {
                Route::get('/consultations', [ConsultationController::class, 'index'])->name('consultations.index');
                Route::middleware('permission.api:create consultation')->post('/consultations', [ConsultationController::class, 'store'])->name('consultations.store');
                Route::get('/consultations/{consultation}', [ConsultationController::class, 'show'])->name('consultations.show');
                Route::get('/consultations/{consultation}/records', [ClinicalRecordController::class, 'consultationIndex'])->name('consultations.records.index');
                Route::get('/consultations/{consultation}/records/options', [ClinicalRecordController::class, 'consultationOptions'])->name('consultations.records.options');
                Route::middleware('permission.api:update consultation')->post('/consultations/{consultation}/start', [ConsultationController::class, 'start'])->name('consultations.start');
                Route::middleware('permission.api:update consultation')->post('/consultations/{consultation}/end', [ConsultationController::class, 'end'])->name('consultations.end');
                Route::middleware('permission.api:update consultation')->post('/consultations/{consultation}/transfer', [ConsultationController::class, 'transfer'])->name('consultations.transfer');
                Route::middleware('permission.api:update consultation')->post('/consultations/{consultation}/records/{type}', [ClinicalRecordController::class, 'storeForConsultation'])->name('consultations.records.store');
                Route::middleware('permission.api:update consultation')->match(['put', 'patch'], '/consultations/{consultation}/records/{type}/{record}', [ClinicalRecordController::class, 'updateForConsultation'])->name('consultations.records.update');
                Route::middleware('permission.api:update consultation')->delete('/consultations/{consultation}/records/{type}/{record}', [ClinicalRecordController::class, 'destroyForConsultation'])->name('consultations.records.destroy');
            });

            Route::middleware('permission.api:view laboratory|view laboratories|viewAny laboratory')->group(function () {
                Route::get('/laboratories', [LaboratoryController::class, 'index'])->name('laboratories.index');
                Route::middleware('permission.api:create laboratory')->post('/laboratories', [LaboratoryController::class, 'store'])->name('laboratories.store');
                Route::get('/laboratories/{laboratory}', [LaboratoryController::class, 'show'])->name('laboratories.show');
                Route::middleware('permission.api:update laboratory')->post('/laboratories/{laboratory}/results', [LaboratoryController::class, 'storeResults'])->name('laboratories.results.store');
                Route::middleware('permission.api:update laboratory')->post('/laboratories/{laboratory}/cancel', [LaboratoryController::class, 'cancel'])->name('laboratories.cancel');
            });

            Route::middleware('permission.api:view pharmacy|viewAny prescription|view prescription')->group(function () {
                Route::get('/prescriptions', [PrescriptionController::class, 'index'])->name('prescriptions.index');
                Route::middleware('permission.api:create prescription')->post('/prescriptions', [PrescriptionController::class, 'store'])->name('prescriptions.store');
                Route::get('/prescriptions/{prescription}', [PrescriptionController::class, 'show'])->name('prescriptions.show');
                Route::middleware('permission.api:update prescription')->post('/prescriptions/{prescription}/dispense', [PrescriptionController::class, 'dispense'])->name('prescriptions.dispense');
                Route::middleware('permission.api:update prescription')->post('/prescriptions/{prescription}/refund', [PrescriptionController::class, 'refund'])->name('prescriptions.refund');
            });

            Route::middleware('permission.api:view billing|view finance|viewAny billing')->group(function () {
                Route::get('/billings', [BillingController::class, 'index'])->name('billings.index');
                Route::get('/billings/history', [BillingController::class, 'history'])->name('billings.history');
                Route::get('/billings/options', [BillingController::class, 'paymentOptions'])->name('billings.options');
                Route::middleware('permission.api:create billing|update billing')->post('/billings', [BillingController::class, 'store'])->name('billings.store');
                Route::get('/billings/{billing}', [BillingController::class, 'show'])->name('billings.show');
                Route::middleware('permission.api:create billing|update billing')->post('/billings/pay', [BillingController::class, 'pay'])->name('billings.pay');
            });
        });
    });
});
