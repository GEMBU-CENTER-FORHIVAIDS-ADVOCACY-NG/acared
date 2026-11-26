<?php

use App\Models\Patient;
use App\Models\PriceList;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

test('v1 can create billing', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $role = Role::create(['name' => 'bill_'.uniqid(), 'guard_name' => 'web']);
    foreach (['view billing', 'create billing'] as $perm) {
        Permission::findOrCreate($perm, 'web');
        $role->givePermissionTo($perm);
    }
    $user->assignRole($role);
    $patient = Patient::factory()->create(['team_id' => $team->id]);
    $price = PriceList::factory()->create(['team_id' => $team->id, 'price' => 100]);

    $this->actingAs($user, 'sanctum');
    $this->withHeader('X-Team-Slug', $team->slug)
        ->postJson('/api/v1/billings', [
            'patient_id' => $patient->slug,
            'billings' => [[
                'lines' => [[
                    'price_list_id' => $price->id,
                    'quantity' => 1,
                    'unitPrice' => 100,
                ]],
            ]],
        ])->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('message', 'Billing created.');
});
