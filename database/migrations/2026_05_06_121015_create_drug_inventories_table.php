<?php

use App\Models\DrugForm;
use App\Models\PriceList;
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
        Schema::create('drug_inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Team::class)->constrained()->cascadeOnDelete();
            $table->string('sku');
            $table->foreignIdFor(PriceList::class)->constrained()->restrictOnDelete();
            $table->foreignIdFor(DrugForm::class)->constrained()->restrictOnDelete();
            $table->integer('min_qty');
            $table->decimal('quantity', 20)->default(0);
            $table->decimal('price', 20)->default(0);
            $table->decimal('cost', 20)->default(0);
            $table->decimal('value', 20)->virtualAs('quantity * cost');
            $table->decimal('profit', 20)->virtualAs('(quantity * price) - cost');
            $table->string('status')->default('low');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drug_inventories');
    }
};
