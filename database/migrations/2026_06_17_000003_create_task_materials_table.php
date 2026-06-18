<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_materials', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('inventory_item_id');
            $table->decimal('quantity', 10, 3)->default(1);
            // consumido = baixa stock | utilizado = sem baixa | alocado = regista alocação
            $table->string('usage_type')->default('consumido');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('material_allocations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inventory_item_id');
            $table->string('allocated_to_type');   // user | team | department
            $table->unsignedBigInteger('allocated_to_id')->nullable();
            $table->string('allocated_to_name')->nullable();  // nome livre p/ equipas externas
            $table->decimal('quantity', 10, 3)->default(1);
            $table->string('status')->default('em_uso');  // em_uso | devolvido | perdido
            $table->unsignedBigInteger('task_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('allocated_at')->useCurrent();
            $table->dateTime('returned_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_allocations');
        Schema::dropIfExists('task_materials');
    }
};
