<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ticket_teams')) return;

        Schema::create('ticket_teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
            $table->unique(['ticket_id', 'team_id']);
        });

        // Migrar dados existentes de tickets.team_id → ticket_teams
        if (Schema::hasColumn('tickets', 'team_id')) {
            $now = now()->toDateTimeString();
            DB::statement("
                INSERT INTO ticket_teams (ticket_id, team_id, assigned_at, created_at, updated_at)
                SELECT id, team_id, created_at, '$now', '$now'
                FROM tickets
                WHERE team_id IS NOT NULL
            ");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_teams');
    }
};
