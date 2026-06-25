<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('task_checklist_items', function (Blueprint $table) {
            if (!Schema::hasColumn('task_checklist_items', 'requires_validation')) {
                $table->boolean('requires_validation')->default(false)->after('sort_order');
            }
            if (!Schema::hasColumn('task_checklist_items', 'validation_status')) {
                // null = sem validação pendente | pendente | aprovado | rejeitado
                $table->string('validation_status', 20)->nullable()->after('requires_validation');
            }
            if (!Schema::hasColumn('task_checklist_items', 'validated_by')) {
                $table->foreignId('validated_by')->nullable()->after('validation_status')
                      ->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('task_checklist_items', 'validated_at')) {
                $table->timestamp('validated_at')->nullable()->after('validated_by');
            }
            if (!Schema::hasColumn('task_checklist_items', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('validated_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('task_checklist_items', function (Blueprint $table) {
            $table->dropColumn(['requires_validation','validation_status','validated_by','validated_at','rejection_reason']);
        });
    }
};
