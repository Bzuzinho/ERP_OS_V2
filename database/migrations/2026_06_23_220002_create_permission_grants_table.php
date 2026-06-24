<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('permission_grants')) return;

        Schema::create('permission_grants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('organization_id')->default(1);
            $table->unsignedBigInteger('user_id');       // quem recebe a permissão
            $table->unsignedBigInteger('granted_by');    // quem concedeu
            $table->string('action_key');                // 'hr.ausencia.aprovar'
            // Âmbito: global | department | contact | self
            $table->string('scope_type')->default('global');
            $table->unsignedBigInteger('scope_id')->nullable(); // id do dept/contact (null = global/self)
            $table->timestamp('expires_at')->nullable();  // null = permanente
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'action_key', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permission_grants');
    }
};
