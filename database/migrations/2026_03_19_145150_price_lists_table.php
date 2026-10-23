<?php

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
        Schema::create('price_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Team::class)->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('price_lists')->restrictOnDelete();
            $table->foreignId('subcategory_id')->nullable()->constrained('price_lists')->restrictOnDelete();
            $table->foreignId('parameter_id')->nullable()->constrained('price_lists')->restrictOnDelete();
            $table->enum('result_type', ['radio', 'number', 'text', 'select'])->nullable()->default('text');
            $table->json('options')->nullable();
            $table->string('name')->unique()->index();
            $table->longText('description')->nullable();
            $table->longText('ranges')->nullable();
            $table->longText('uom')->nullable();
            $table->boolean('is_category')->default(true);
            $table->boolean('is_inventory')->default(false);
            $table->decimal('price', 20, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_lists');
    }
};
