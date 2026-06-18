<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('organization_id')->default(1);
            $table->unsignedBigInteger('space_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('type')->default('corretiva');    // preventiva|corretiva|urgente|periodica
            $table->string('status')->default('pendente');   // pendente|em_progresso|concluida|cancelada
            $table->string('priority')->default('normal');   // baixa|normal|alta|urgente
            $table->unsignedBigInteger('assigned_team_id')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->dateTime('scheduled_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->decimal('actual_cost', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('maintenance_tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('maintenance_id');
            $table->unsignedBigInteger('task_id');
            $table->primary(['maintenance_id', 'task_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_tasks');
        Schema::dropIfExists('maintenances');
    }
};
