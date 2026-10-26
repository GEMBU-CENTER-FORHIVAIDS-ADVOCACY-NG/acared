<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AssignAdminRole extends Command
{
    protected $signature = 'admin:assign {email=test@example.com}';

    protected $description = 'Assign administrator role to a user';

    public function handle(): int
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("User not found: {$email}");

            return Command::FAILURE;
        }

        $this->info("Found user: {$user->name} (ID: {$user->id})");

        $role = Role::firstOrCreate(['name' => 'Administrator']);
        $this->info("Role: {$role->name} (ID: {$role->id})");

        $allPermissions = Permission::pluck('id')->toArray();
        $this->info('Total permissions: '.count($allPermissions));

        $role->syncPermissions($allPermissions);
        $this->info('Assigned all permissions to Administrator role.');

        $user->assignRole($role);
        $this->info('Assigned Administrator role to user.');

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->info('Permission cache flushed.');

        $this->info("\nVerification:");
        $this->info('User roles: '.$user->getRoleNames()->join(', '));
        $this->info('User permissions count: '.$user->getAllPermissions()->count());

        return Command::SUCCESS;
    }
}
