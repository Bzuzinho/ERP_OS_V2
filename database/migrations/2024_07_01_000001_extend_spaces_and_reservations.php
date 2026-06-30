<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spaces', function (Blueprint $table) {
            $table->foreignId('responsible_user_id')->nullable()->after('is_public')->constrained('users')->nullOnDelete();
            $table->foreignId('responsible_team_id')->nullable()->after('responsible_user_id')->constrained('teams')->nullOnDelete();
            $table->json('schedule')->nullable()->after('responsible_team_id');       // {"monday":{"open":"09:00","close":"18:00"},...}
            $table->json('availability_exceptions')->nullable()->after('schedule');   // [{date,reason,closed}]
            $table->text('requirements')->nullable()->after('availability_exceptions'); // texto livre com requisitos
            $table->text('notes')->nullable()->after('requirements');
            $table->string('color', 20)->nullable()->after('notes');
        });

        Schema::table('space_reservations', function (Blueprint $table) {
            $table->foreignId('plan_id')->nullable()->after('organization_id')->constrained('operational_plans')->nullOnDelete();
            $table->foreignId('escalated_to_id')->nullable()->after('reviewed_at')->constrained('users')->nullOnDelete();
            $table->timestamp('escalated_at')->nullable()->after('escalated_to_id');
            $table->text('escalation_notes')->nullable()->after('escalated_at');
        });
    }

    public function down(): void
    {
        Schema::table('space_reservations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('escalated_to_id');
            $table->dropConstrainedForeignId('plan_id');
            $table->dropColumn(['escalated_at', 'escalation_notes']);
        });

        Schema::table('spaces', function (Blueprint $table) {
            $table->dropConstrainedForeignId('responsible_user_id');
            $table->dropConstrainedForeignId('responsible_team_id');
            $table->dropColumn(['schedule', 'availability_exceptions', 'requirements', 'notes', 'color']);
        });
    }
};
