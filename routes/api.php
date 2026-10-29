<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\PatientApiController;
use App\Http\Controllers\Api\UserApiController;
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
