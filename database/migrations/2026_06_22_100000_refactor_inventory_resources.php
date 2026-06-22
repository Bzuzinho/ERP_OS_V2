<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Extender inventory_items com fornecedor, subcategoria, stock máx, qualidade
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->foreignId('supplier_id')->nullable()->constrained('contacts')->nullOnDelete()->after('inventory_category_id');
            $table->string('subcategory')->nullable()->after('inventory_category_id'); // género
            $table->decimal('max_stock', 10, 2)->nullable()->after('min_stock');
            $table->string('quality_grade')->nullable()->after('condition'); // A/B/C ou Bom/Razoável/Mau
            $table->text('quality_notes')->nullable()->after('quality_grade');
            $table->string('barcode')->nullable()->after('reference');
        });

        // Empréstimos de material
        Schema::create('material_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // quem registou
            $table->foreignId('borrower_contact_id')->nullable()->constrained('contacts')->nullOnDelete();
            $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete();
            $table->string('borrower_name')->nullable(); // nome livre se não for contacto
            $table->decimal('quantity', 10, 2)->default(1);
            $table->text('purpose')->nullable();
            $table->string('condition_out')->nullable(); // Bom/Razoável/Mau
            $table->string('condition_in')->nullable();  // condição na devolução
            $table->timestamp('loaned_at');
            $table->timestamp('expected_return_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->enum('status', ['activo','devolvido','atrasado','perdido'])->default('activo');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Requisições de material (por equipas, tarefas, planeamentos)
        Schema::create('material_requisitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requester_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('team_id')->nullable()->constrained()->nullOnDelete();
            // Referência polimórfica (tarefa ou plano)
            $table->string('referenceable_type')->nullable();
            $table->unsignedBigInteger('referenceable_id')->nullable();
            $table->decimal('quantity_requested', 10, 2);
            $table->decimal('quantity_delivered', 10, 2)->nullable();
            $table->text('purpose')->nullable();
            $table->enum('status', ['pendente','aprovada','rejeitada','entregue','cancelada'])->default('pendente');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['referenceable_type', 'referenceable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_requisitions');
        Schema::dropIfExists('material_loans');
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropForeign(['supplier_id']);
            $table->dropColumn(['supplier_id','subcategory','max_stock','quality_grade','quality_notes','barcode']);
        });
    }
};
