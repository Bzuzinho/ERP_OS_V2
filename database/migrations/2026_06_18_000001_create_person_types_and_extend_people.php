<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tipos de pessoa configuráveis
        Schema::create('person_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('category')->default('externo'); // externo | interno
            $table->string('color')->default('#6b7280');
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_system')->default(false); // não pode ser apagado
            $table->timestamps();
        });

        // Estender contacts com person_type e avatar
        Schema::table('contacts', function (Blueprint $table) {
            $table->foreignId('person_type_id')->nullable()->after('type')
                  ->constrained('person_types')->nullOnDelete();
            $table->string('avatar')->nullable()->after('notes');
            $table->string('mobile')->nullable()->after('phone');
            $table->string('postal_code')->nullable()->after('address');
            $table->string('locality')->nullable()->after('postal_code');
            $table->date('birthdate')->nullable()->after('locality');
        });

        // Estender employees com mais campos RH
        Schema::table('employees', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('status');
            $table->string('mobile')->nullable()->after('phone');
            $table->string('address')->nullable()->after('mobile');
            $table->string('postal_code')->nullable()->after('address');
            $table->string('locality')->nullable()->after('postal_code');
            $table->date('birthdate')->nullable()->after('locality');
            $table->string('nif')->nullable()->change();
            $table->string('emergency_contact')->nullable()->after('birthdate');
            $table->string('emergency_phone')->nullable()->after('emergency_contact');
            $table->text('notes')->nullable()->after('emergency_phone');
            $table->string('contract_type')->nullable()->after('notes'); // efetivo|termo|prestacao|outro
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['avatar','mobile','address','postal_code','locality','birthdate','emergency_contact','emergency_phone','notes','contract_type']);
        });
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropForeign(['person_type_id']);
            $table->dropColumn(['person_type_id','avatar','mobile','postal_code','locality','birthdate']);
        });
        Schema::dropIfExists('person_types');
    }
};
