<?php

use App\Http\Controllers\Settings\PermissionController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\RoleController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Teams\TeamController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Controllers\Teams\TeamMemberController;
use App\Http\Controllers\Teams\TeamUserController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Roles
    Route::middleware('permission:view roles')->group(function () {
        Route::get('settings/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('settings/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::patch('settings/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('settings/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
        Route::delete('settings/roles/bulk', [RoleController::class, 'bulkDestroy'])->name('roles.bulk.destroy');
    });

    // Permissions
    Route::middleware('permission:view permissions')->group(function () {
        Route::get('settings/permissions', [PermissionController::class, 'index'])->name('permissions.index');
        Route::post('settings/permissions', [PermissionController::class, 'store'])->name('permissions.store');
        Route::patch('settings/permissions/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
        Route::delete('settings/permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');
        Route::delete('settings/permissions/bulk', [PermissionController::class, 'bulkDestroy'])->name('permissions.bulk.destroy');
    });

    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');

    Route::get('settings/teams', [TeamController::class, 'index'])->name('teams.index');
    Route::post('settings/teams', [TeamController::class, 'store'])->name('teams.store');
    Route::delete('settings/teams/bulk', [TeamController::class, 'bulkDestroy'])->name('teams.bulk.destroy');

    Route::middleware(EnsureTeamMembership::class)->group(function () {
        Route::get('settings/teams/{team}', [TeamController::class, 'edit'])->name('teams.edit');
        Route::patch('settings/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
        Route::delete('settings/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');
        Route::post('settings/teams/{team}/switch', [TeamController::class, 'switch'])->name('teams.switch');
        Route::delete('settings/teams/{team}/leave', [TeamController::class, 'leave'])->name('teams.leave');

        Route::patch('settings/teams/{team}/members/{user}', [TeamMemberController::class, 'update'])->name('teams.members.update');
        Route::delete('settings/teams/{team}/members/{user}', [TeamMemberController::class, 'destroy'])->name('teams.members.destroy');

        Route::post('settings/teams/{team}/invitations', [TeamInvitationController::class, 'store'])->name('teams.invitations.store');
        Route::delete('settings/teams/{team}/invitations/{invitation}', [TeamInvitationController::class, 'destroy'])->name('teams.invitations.destroy');

        Route::middleware('permission:view users')->group(function () {
            Route::get('settings/teams/{team}/users', [TeamUserController::class, 'index'])->name('teams.users.index');
            Route::post('settings/teams/{team}/users', [TeamUserController::class, 'store'])->name('teams.users.store');
            Route::patch('settings/teams/{team}/users/{user}', [TeamUserController::class, 'update'])->name('teams.users.update');
            Route::delete('settings/teams/{team}/users/{user}', [TeamUserController::class, 'destroy'])->name('teams.users.destroy');
        });
    });
});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
