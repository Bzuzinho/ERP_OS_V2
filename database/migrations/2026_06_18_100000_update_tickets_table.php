<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            if (!Schema::hasColumn('tickets', 'ticket_type'))
                $table->string('ticket_type')->default('externo')->after('origin');
            if (!Schema::hasColumn('tickets', 'tema'))
                $table->string('tema')->nullable()->after('title');
            if (!Schema::hasColumn('tickets', 'department'))
                $table->string('department')->nullable()->after('tema');
            if (!Schema::hasColumn('tickets', 'validation_status'))
                $table->string('validation_status')->default('nao_aplicavel')->after('priority');
            if (!Schema::hasColumn('tickets', 'cancellation_reason'))
                $table->text('cancellation_reason')->nullable()->after('closed_at');
            if (!Schema::hasColumn('tickets', 'team_id'))
                $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete()->after('service_area_id');
            if (!Schema::hasColumn('tickets', 'project_id'))
                $table->foreignId('project_id')->nullable()->constrained('operational_plans')->nullOnDelete()->after('team_id');
        });
    }

    public function down(): void
    {
        $cols = ['ticket_type','tema','department','validation_status','cancellation_reason','team_id','project_id'];
        $existing = array_filter($cols, fn($c) => Schema::hasColumn('tickets', $c));
        if ($existing) {
            Schema::table('tickets', fn(Blueprint $t) => $t->dropColumn(array_values($existing)));
        }
    }
};
