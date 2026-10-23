<?php

use App\Models\Category;
use App\Models\Country;
use App\Models\Lga;
use App\Models\State;
use App\Models\Team;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Team::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Category::class)->constrained()->cascadeOnDelete();
            $table->string('slug')->unique()->index();
            $table->string('art')->unique()->index()->nullable();
            $table->string('slugOther')->unique()->index()->nullable();
            $table->string('firstName');
            $table->string('middleName')->nullable();
            $table->string('lastName');
            $table->string('fullName')->virtualAs("CONCAT_WS(' ', \"firstName\", \"middleName\", \"lastName\")");
            $table->string('gender')->nullable();
            $table->date('birthDate')->nullable();
            $table->string('email')->unique()->nullable();
            $table->string('phone')->nullable();
            $table->string('mobile')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('occupation')->nullable();
            $table->foreignIdFor(Country::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(State::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Lga::class)->constrained()->cascadeOnDelete();
            $table->text('address')->nullable();
            $table->string('kinFullName')->nullable();
            $table->string('kinPhone')->nullable();
            $table->string('kinEmail')->nullable();
            $table->string('relation')->nullable();
            $table->decimal('wallet', 20)->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
