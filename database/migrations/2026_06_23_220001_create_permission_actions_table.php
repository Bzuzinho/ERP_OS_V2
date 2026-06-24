<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('permission_actions')) return;

        Schema::create('permission_actions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('organization_id')->default(1);
            $table->string('key')->unique();   // 'hr.ausencia.aprovar'
            $table->string('label');           // 'Aprovar ausência de RH'
            $table->string('module');          // 'RH', 'Recursos', 'Pedidos', ...
            $table->unsignedInteger('min_level')->default(80); // nível mínimo de perfil
            $table->timestamps();
        });

        // Acções por defeito
        DB::table('permission_actions')->insert([
            // RH
            ['organization_id' => 1, 'key' => 'hr.ausencia.aprovar',         'label' => 'Aprovar ausência / férias',       'module' => 'RH',       'min_level' => 80,  'created_at' => now(), 'updated_at' => now()],
            ['organization_id' => 1, 'key' => 'hr.ausencia.rejeitar',        'label' => 'Rejeitar ausência / férias',      'module' => 'RH',       'min_level' => 80,  'created_at' => now(), 'updated_at' => now()],
            ['organization_id' => 1, 'key' => 'hr.dados.editar',             'label' => 'Editar dados de funcionário',     'module' => 'RH',       'min_level' => 60,  'created_at' => now(), 'updated_at' => now()],
            // Pedidos
            ['organization_id' => 1, 'key' => 'pedidos.fechar',              'label' => 'Fechar / resolver pedido',        'module' => 'Pedidos',  'min_level' => 60,  'created_at' => now(), 'updated_at' => now()],
            ['organization_id' => 1, 'key' => 'pedidos.atribuir',            'label' => 'Atribuir pedido a utilizador',   'module' => 'Pedidos',  'min_level' => 60,  'created_at' => now(), 'updated_at' => now()],
            ['organization_id' => 1, 'key' => 'pedidos.cancelar',            'label' => 'Cancelar pedido',                'module' => 'Pedidos',  'min_level' => 60,  'created_at' => now(), 'updated_at' => now()],
            // Tarefas
            ['organization_id' => 1, 'key' => 'tarefas.atribuir',            'label' => 'Atribuir tarefa a pessoa',       'module' => 'Tarefas',  'min_level' => 40,  'created_at' => now(), 'updated_at' => now()],
            ['organization_id' => 1, 'key' => 'tarefas.eliminar',            'label' => 'Eliminar tarefa',                'module' => 'Tarefas',  'min_level' => 60,  'created_at' => now(), 'updated_at' => now()],
            // Recursos / Inventário
            ['organization_id' => 1, 'key' => 'inventario.requisicao.aprovar','label' => 'Aprovar requisição de material', 'module' => 'Recursos', 'min_level' => 60,  'created_at' => now(), 'updated_at' => now()],
            ['organization_id' => 1, 'key' => 'inventario.emprestimo.aprovar','label' => 'Aprovar empréstimo de material', 'module' => 'Recursos', 'min_level' => 60,  'created_at' => now(), 'updated_at' => now()],
            // Pessoas / Diretório
            ['organization_id' => 1, 'key' => 'pessoas.eliminar',            'label' => 'Eliminar pessoa / entidade',     'module' => 'Diretório','min_level' => 80,  'created_at' => now(), 'updated_at' => now()],
            ['organization_id' => 1, 'key' => 'pessoas.conta.criar',         'label' => 'Criar conta de acesso',          'module' => 'Diretório','min_level' => 80,  'created_at' => now(), 'updated_at' => now()],
            // Configurações
            ['organization_id' => 1, 'key' => 'configuracoes.editar',        'label' => 'Editar configurações gerais',    'module' => 'Sistema',  'min_level' => 100, 'created_at' => now(), 'updated_at' => now()],
            ['organization_id' => 1, 'key' => 'configuracoes.perfis',        'label' => 'Gerir perfis e permissões',      'module' => 'Sistema',  'min_level' => 100, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('permission_actions');
    }
};
