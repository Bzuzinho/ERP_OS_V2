<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('service_area_team')) return;

        Schema::create('service_area_team', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_area_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['service_area_id', 'team_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_area_team');
    }
};
