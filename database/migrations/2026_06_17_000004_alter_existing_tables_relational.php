<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── tasks ──
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'team_id'))
                $table->unsignedBigInteger('team_id')->nullable()->after('assigned_to');
            if (!Schema::hasColumn('tasks', 'plan_id'))
                $table->unsignedBigInteger('plan_id')->nullable()->after('team_id');
            if (!Schema::hasColumn('tasks', 'maintenance_id'))
                $table->unsignedBigInteger('maintenance_id')->nullable()->after('plan_id');
            if (!Schema::hasColumn('tasks', 'validation_status'))
                $table->string('validation_status')->default('nao_aplicavel')->after('status');
            if (!Schema::hasColumn('tasks', 'validated_by'))
                $table->unsignedBigInteger('validated_by')->nullable();
            if (!Schema::hasColumn('tasks', 'validated_at'))
                $table->dateTime('validated_at')->nullable();
            if (!Schema::hasColumn('tasks', 'rejection_reason'))
                $table->text('rejection_reason')->nullable();
        });

        // ── tickets ──
        Schema::table('tickets', function (Blueprint $table) {
            if (!Schema::hasColumn('tickets', 'source_type'))
                $table->string('source_type')->default('interno')->after('origin');
            if (!Schema::hasColumn('tickets', 'project_id'))
                $table->unsignedBigInteger('project_id')->nullable();
            if (!Schema::hasColumn('tickets', 'team_id'))
                $table->unsignedBigInteger('team_id')->nullable();
        });

        // ── inventory_items ──
        Schema::table('inventory_items', function (Blueprint $table) {
            if (!Schema::hasColumn('inventory_items', 'item_type'))
                $table->string('item_type')->default('consumivel')->after('description');
            if (!Schema::hasColumn('inventory_items', 'serial_number'))
                $table->string('serial_number')->nullable();
            if (!Schema::hasColumn('inventory_items', 'purchase_date'))
                $table->date('purchase_date')->nullable();
            if (!Schema::hasColumn('inventory_items', 'purchase_price'))
                $table->decimal('purchase_price', 10, 2)->nullable();
            if (!Schema::hasColumn('inventory_items', 'condition'))
                $table->string('condition')->default('bom');
        });

        // ── operational_plans ──
        Schema::table('operational_plans', function (Blueprint $table) {
            if (!Schema::hasColumn('operational_plans', 'progress'))
                $table->integer('progress')->default(0)->after('status');
            if (!Schema::hasColumn('operational_plans', 'budget'))
                $table->decimal('budget', 12, 2)->nullable();
            if (!Schema::hasColumn('operational_plans', 'manager_id'))
                $table->unsignedBigInteger('manager_id')->nullable();
            if (!Schema::hasColumn('operational_plans', 'year'))
                $table->integer('year')->nullable();
        });

        // ── documents (content for atas) ──
        Schema::table('documents', function (Blueprint $table) {
            if (!Schema::hasColumn('documents', 'content'))
                $table->longText('content')->nullable();
        });
    }

    public function down(): void
    {
        // SQLite doesn't support DROP COLUMN well; left intentionally empty
    }
};
