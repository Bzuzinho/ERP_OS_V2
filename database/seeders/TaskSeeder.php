<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        $tasks = [
            [
                'title' => 'Revisar proposta de orçamento 2024',
                'description' => 'Análise e revisão da proposta de orçamento para o ano fiscal de 2024.',
                'status' => 'in_progress',
                'priority' => 'high',
                'due_date' => now()->addDays(3),
            ],
            [
                'title' => 'Atualizar documentação de procedimentos',
                'description' => 'Atualizar manuais e documentação de procedimentos operacionais.',
                'status' => 'pending',
                'priority' => 'medium',
                'due_date' => now()->addDays(7),
            ],
            [
                'title' => 'Realizar manutenção de sistemas',
                'description' => 'Verificar e atualizar sistemas de informação.',
                'status' => 'pending',
                'priority' => 'high',
                'due_date' => now()->addDays(2),
            ],
            [
                'title' => 'Organizar reunião com departamentos',
                'description' => 'Agendar e preparar reunião de alinhamento entre departamentos.',
                'status' => 'pending',
                'priority' => 'medium',
                'due_date' => now()->addDays(5),
            ],
            [
                'title' => 'Preparar relatório mensal',
                'description' => 'Compilar dados e preparar relatório de atividades do mês.',
                'status' => 'in_progress',
                'priority' => 'high',
                'due_date' => now()->addDays(1),
            ],
            [
                'title' => 'Treinar novo pessoal',
                'description' => 'Programação e realização de sessões de treinamento para novos funcionários.',
                'status' => 'completed',
                'priority' => 'medium',
                'due_date' => now()->subDays(5),
            ],
            [
                'title' => 'Auditar conformidade regulatória',
                'description' => 'Verificar conformidade com regulamentações e legislação aplicável.',
                'status' => 'pending',
                'priority' => 'high',
                'due_date' => now()->addDays(10),
            ],
            [
                'title' => 'Atualizar página de intranet',
                'description' => 'Adicionar novas informações e atualizar conteúdo da página da intranet.',
                'status' => 'pending',
                'priority' => 'low',
                'due_date' => now()->addDays(15),
            ],
        ];

        foreach ($tasks as $index => $taskData) {
            $taskData['assigned_to'] = $users->random()->id;
            Task::create($taskData);
        }
    }
}
