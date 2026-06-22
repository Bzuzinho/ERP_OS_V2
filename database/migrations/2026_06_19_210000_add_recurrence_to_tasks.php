<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Padrão de recorrência: nenhuma (padrão), diária, semanal, quinzenal, mensal, anual
            if (!Schema::hasColumn('tasks', 'recurrence'))
                $table->string('recurrence')->default('nenhuma')->after('status');

            // Data de término da recorrência (null = sem fim)
            if (!Schema::hasColumn('tasks', 'recurrence_ends_at'))
                $table->date('recurrence_ends_at')->nullable()->after('recurrence');

            // Liga cada ocorrência à tarefa original da série (null = é a original)
            if (!Schema::hasColumn('tasks', 'parent_task_id'))
                $table->foreignId('parent_task_id')->nullable()->after('recurrence_ends_at')
                      ->constrained('tasks')->nullOnDelete();

            // Número da ocorrência na série (1 = original, 2 = primeira repetição, etc.)
            if (!Schema::hasColumn('tasks', 'occurrence_number'))
                $table->unsignedInteger('occurrence_number')->default(1)->after('parent_task_id');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $cols = ['recurrence', 'recurrence_ends_at', 'parent_task_id', 'occurrence_number'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('tasks', $col)) $table->dropColumn($col);
            }
        });
    }
};
