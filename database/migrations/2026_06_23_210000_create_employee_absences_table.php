<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('employee_absences')) return;

        Schema::create('employee_absences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('contact_id');
            $table->unsignedBigInteger('approved_by')->nullable();  // user_id
            $table->string('type');   // férias | falta_justificada | falta_injustificada | doença | licença_parental | licença_paternidade | outro
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('days')->nullable();             // dias úteis (preenchido manualmente ou calculado)
            $table->string('status')->default('pendente');           // pendente | aprovado | rejeitado
            $table->text('notes')->nullable();
            $table->timestamps();

            try {
                $table->foreign('contact_id')->references('id')->on('contacts')->cascadeOnDelete();
            } catch (\Exception $e) {}
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_absences');
    }
};
