<?php

use App\Models\Billing;
use App\Models\Category;
use App\Models\Line;
use App\Models\Method;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\PriceList;
use App\Models\User;
use App\Models\WalletHistory;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

function employeeDeductionImportUrl(User $user): string
{
    return '/'.$user->currentTeam->slug.'/reports/employee-deduction/import';
}

function employeeDeductionCsv(array $rows): string
{
    $stream = fopen('php://temp', 'r+');

    foreach ($rows as $row) {
        fputcsv($stream, $row, ',', '"', '\\');
    }

    rewind($stream);
    $contents = stream_get_contents($stream);
    fclose($stream);

    return $contents === false ? '' : $contents;
}

function employeeDeductionFile(array $rows): UploadedFile
{
    return UploadedFile::fake()->createWithContent(
        'employee-deductions.csv',
        employeeDeductionCsv($rows),
    );
}

function employeeDeductionPatient(User $user, string $slug, float $wallet = -100): Patient
{
    $category = Category::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Employee',
    ]);

    return Patient::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'category_id' => $category->getKey(),
        'slug' => $slug,
        'wallet' => $wallet,
    ]);
}

function employeeDeductionReferenceData(User $user): void
{
    Method::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Cheque',
    ]);

    PriceList::factory()->create([
        'team_id' => $user->currentTeam->getKey(),
        'name' => 'Deposit',
        'is_category' => true,
        'price' => 0,
    ]);
}

test('guests are redirected to the login page', function () {
    $team = User::factory()->create()->currentTeam;

    $response = $this->post('/'.$team->slug.'/reports/employee-deduction/import', [
        'file' => employeeDeductionFile([
            ['Hospital No.', 'Name', 'Amount'],
            ['EMP-1001', 'Jane Doe', '50'],
        ]),
    ]);

    $response->assertRedirect(route('login'));
});

test('users without finance access cannot import deductions', function () {
    $user = User::factory()->create();
    $patient = employeeDeductionPatient($user, 'EMP-1001');
    employeeDeductionReferenceData($user);

    $permission = Permission::firstOrCreate(['name' => 'view reports']);
    $role = Role::firstOrCreate(['name' => 'Report Viewer']);
    $role->givePermissionTo($permission);
    $user->assignRole($role);

    $response = $this->actingAs($user)->post(employeeDeductionImportUrl($user), [
        'file' => employeeDeductionFile([
            ['Hospital No.', 'Name', 'Amount'],
            [$patient->slug, 'Jane Doe', '50'],
        ]),
    ]);

    $response->assertRedirect(route('forbidden'));
    expect((float) $patient->fresh()->wallet)->toBe(-100.0);
});

test('rejects requests without a file', function () {
    $user = User::factory()->create();
    $patient = employeeDeductionPatient($user, 'EMP-1001');

    $response = $this->actingAs($user)->post(employeeDeductionImportUrl($user), []);

    $response->assertRedirect()->assertSessionHasErrors('file');
    expect((float) $patient->fresh()->wallet)->toBe(-100.0);
});

test('imports valid deductions and creates wallet, billing, and cheque payment records', function () {
    $user = User::factory()->create();
    $patient = employeeDeductionPatient($user, 'EMP-1001');
    employeeDeductionReferenceData($user);

    $response = $this->actingAs($user)->post(employeeDeductionImportUrl($user), [
        'file' => employeeDeductionFile([
            ['Hospital No.', 'Name', 'Amount'],
            [$patient->slug, 'Wrong Name', '50'],
        ]),
    ]);

    $response->assertRedirect()->assertSessionHasNoErrors();

    $patient->refresh();
    $method = Method::query()->where('name', 'Cheque')->firstOrFail();
    $deposit = PriceList::query()->where('name', 'Deposit')->firstOrFail();
    $walletHistory = WalletHistory::query()->where('patient_id', $patient->slug)->firstOrFail();
    $billing = Billing::query()->where('patient_id', $patient->slug)->firstOrFail();
    $line = Line::query()->where('patient_id', $patient->slug)->firstOrFail();

    expect((float) $patient->wallet)->toBe(-150.0)
        ->and($patient->fullName)->not->toBe('Wrong Name');

    expect((float) $walletHistory->credit)->toBe(50.0)
        ->and((float) $walletHistory->debit)->toBe(0.0)
        ->and($walletHistory->method_id)->toBe($method->getKey());

    $this->assertDatabaseHas('payments', [
        'patient_id' => $patient->slug,
        'method_id' => $method->getKey(),
        'amount' => 50,
        'wallet' => -50,
    ]);

    expect($billing->billable_type)->toBe(WalletHistory::class)
        ->and($billing->billable_id)->toBe($walletHistory->getKey())
        ->and((float) $billing->total)->toBe(50.0)
        ->and($billing->status)->toBe('paid');

    expect($line->price_list_id)->toBe($deposit->getKey())
        ->and($line->quantity)->toBe(1)
        ->and((float) $line->unitPrice)->toBe(50.0)
        ->and($line->paid)->toBeTrue()
        ->and($line->lineable_type)->toBe(WalletHistory::class)
        ->and($line->lineable_id)->toBe($walletHistory->getKey());
});

test('imports valid rows and skips invalid hospital numbers', function () {
    $user = User::factory()->create();
    $validPatient = employeeDeductionPatient($user, 'EMP-1001');
    $unknownPatient = employeeDeductionPatient($user, 'EMP-1002');
    employeeDeductionReferenceData($user);

    $response = $this->actingAs($user)->post(employeeDeductionImportUrl($user), [
        'file' => employeeDeductionFile([
            ['Hospital No.', 'Name', 'Amount'],
            [$validPatient->slug, 'Jane Doe', '25'],
            ['UNKNOWN-1', 'Missing Patient', '25'],
        ]),
    ]);

    $response->assertRedirect()->assertSessionHasErrors('file');

    expect(session('errors')->first('file'))->toContain('UNKNOWN-1')
        ->and((float) $validPatient->fresh()->wallet)->toBe(-125.0)
        ->and((float) $unknownPatient->fresh()->wallet)->toBe(-100.0)
        ->and(WalletHistory::query()->where('patient_id', $unknownPatient->slug)->count())->toBe(0)
        ->and(Billing::query()->where('patient_id', $unknownPatient->slug)->count())->toBe(0);
});

test('rejects duplicate hospital numbers within one file', function () {
    $user = User::factory()->create();
    $patient = employeeDeductionPatient($user, 'EMP-1001');
    employeeDeductionReferenceData($user);

    $response = $this->actingAs($user)->post(employeeDeductionImportUrl($user), [
        'file' => employeeDeductionFile([
            ['Hospital No.', 'Name', 'Amount'],
            [$patient->slug, 'Jane Doe', '25'],
            [strtolower($patient->slug), 'Jane Doe', '30'],
        ]),
    ]);

    $response->assertRedirect()->assertSessionHasErrors('file');

    expect(session('errors')->first('file'))->toContain('appears more than once')
        ->and((float) $patient->fresh()->wallet)->toBe(-100.0)
        ->and(WalletHistory::query()->count())->toBe(0)
        ->and(Billing::query()->count())->toBe(0)
        ->and(Payment::query()->count())->toBe(0);
});

test('accepts common hospital number header variants', function (string $header) {
    $user = User::factory()->create();
    $patient = employeeDeductionPatient($user, 'EMP-1001');
    employeeDeductionReferenceData($user);

    $response = $this->actingAs($user)->post(employeeDeductionImportUrl($user), [
        'file' => employeeDeductionFile([
            [$header, 'Patient Name', 'Deduction Amount'],
            [$patient->slug, 'Jane Doe', '₦1,200'],
        ]),
    ]);

    $response->assertRedirect()->assertSessionHasNoErrors();

    expect((float) $patient->fresh()->wallet)->toBe(-1300.0);
})->with([
    'Hospital No.',
    'Hospital No',
    'Hospital Number',
    'patient_hospital_no',
    'Patient ID',
]);

test('does not match a patient from another team', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $otherPatient = employeeDeductionPatient($otherUser, 'OTHER-1001');
    employeeDeductionReferenceData($user);

    $response = $this->actingAs($user)->post(employeeDeductionImportUrl($user), [
        'file' => employeeDeductionFile([
            ['Hospital No.', 'Name', 'Amount'],
            [$otherPatient->slug, 'Other Patient', '50'],
        ]),
    ]);

    $response->assertRedirect()->assertSessionHasErrors('file');

    expect(session('errors')->first('file'))->toContain('does not match a patient in this team')
        ->and((float) $otherPatient->fresh()->wallet)->toBe(-100.0)
        ->and(WalletHistory::query()->count())->toBe(0);
});

test('preview returns headers for column mapping', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/'.$user->currentTeam->slug.'/reports/employee-deduction/import/preview', [
        'file' => employeeDeductionFile([
            ['Hospital No.', 'Name', 'Amount'],
            ['EMP-1', 'Jane Doe', '50'],
        ]),
    ]);

    $response->assertOk()
        ->assertJsonPath('headers.0', 'Hospital No.')
        ->assertJsonPath('headers.1', 'Name')
        ->assertJsonPath('headers.2', 'Amount');
});

test('imports an exported report style CSV with quoted fields and a BOM', function () {
    $user = User::factory()->create();
    $patient = employeeDeductionPatient($user, 'PSN0000159');
    employeeDeductionReferenceData($user);

    $file = UploadedFile::fake()->createWithContent(
        'employee-deduction-report.csv',
        "\xEF\xBB\xBF".employeeDeductionCsv([
            ['Hospital No.', 'Patient', 'Category', 'Wallet Balance'],
            [$patient->slug, 'Doe, Jane', 'Employee', '50'],
        ]),
    );

    $response = $this->actingAs($user)->post(employeeDeductionImportUrl($user), [
        'file' => $file,
        'mapping' => [
            'hospital_no' => 'Hospital No.',
            'name' => 'Patient',
            'amount' => 'Wallet Balance',
        ],
    ]);

    $response->assertRedirect()->assertSessionHasNoErrors();
    expect((float) $patient->fresh()->wallet)->toBe(-150.0);
});

test('imports a UTF-8 BOM CSV with quoted headers', function () {
    $user = User::factory()->create();
    $patient = employeeDeductionPatient($user, 'PSN0000211');
    employeeDeductionReferenceData($user);

    $contents = "\xEF\xBB\xBF".implode("\n", [
        '"Staff ID","First Name","Last Name","Amount"',
        $patient->slug.',BERRY,BANG,5370.00',
    ]);

    $file = UploadedFile::fake()->createWithContent('schedule.csv', $contents);

    $response = $this->actingAs($user)->post(employeeDeductionImportUrl($user), [
        'file' => $file,
        'mapping' => [
            'hospital_no' => 'Staff ID',
            'name' => 'First Name',
            'amount' => 'Amount',
        ],
    ]);

    $response->assertRedirect()->assertSessionHasNoErrors();
    expect((float) $patient->fresh()->wallet)->toBe(-5470.0);
});

test('imports a CSV upload with a txt extension', function () {
    $user = User::factory()->create();
    $patient = employeeDeductionPatient($user, 'EMP-1001');
    employeeDeductionReferenceData($user);

    $file = UploadedFile::fake()->createWithContent(
        'employee-deductions.txt',
        employeeDeductionCsv([
            ['Hospital No.', 'Name', 'Amount'],
            [$patient->slug, 'Jane Doe', '50'],
        ]),
    );

    $response = $this->actingAs($user)->post(employeeDeductionImportUrl($user), [
        'file' => $file,
    ]);

    $response->assertRedirect()->assertSessionHasNoErrors();
    expect((float) $patient->fresh()->wallet)->toBe(-150.0);
});

test('imports deductions using explicit column mapping', function () {
    $user = User::factory()->create();
    $patient = employeeDeductionPatient($user, 'EMP-1001');
    employeeDeductionReferenceData($user);

    $response = $this->actingAs($user)->post(employeeDeductionImportUrl($user), [
        'file' => employeeDeductionFile([
            ['Employee', 'Emp Code', 'Deduction'],
            ['Jane Doe', $patient->slug, '75'],
        ]),
        'mapping' => [
            'hospital_no' => 'Emp Code',
            'name' => 'Employee',
            'amount' => 'Deduction',
        ],
    ]);

    $response->assertRedirect()->assertSessionHasNoErrors();
    expect((float) $patient->fresh()->wallet)->toBe(-175.0);
    $this->assertDatabaseHas('payments', [
        'patient_id' => $patient->slug,
        'amount' => 75,
        'wallet' => -75,
    ]);
});
