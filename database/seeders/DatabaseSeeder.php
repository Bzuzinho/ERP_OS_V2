<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\Department;
use App\Models\Document;
use App\Models\Employee;
use App\Models\Event;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\Organization;
use App\Models\ServiceArea;
use App\Models\Space;
use App\Models\SpaceReservation;
use App\Models\Task;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Organization
        $org = Organization::create([
            'name'        => 'Junta de Freguesia de Exemplo',
            'slug'        => 'junta-exemplo',
            'email'       => 'geral@junta-exemplo.pt',
            'phone'       => '+351 210 000 000',
            'address'     => 'Rua Principal, 1',
            'city'        => 'Lisboa',
            'postal_code' => '1000-001',
            'is_active'   => true,
        ]);

        // Users
        $admin = User::create([
            'organization_id' => $org->id,
            'name'            => 'Administrador',
            'email'           => 'admin@junta.pt',
            'password'        => Hash::make('password'),
            'role'            => 'admin',
            'is_active'       => true,
        ]);

        $exec = User::create([
            'organization_id' => $org->id,
            'name'            => 'Maria Silva',
            'email'           => 'maria@junta.pt',
            'password'        => Hash::make('password'),
            'role'            => 'executivo',
            'is_active'       => true,
        ]);

        $op = User::create([
            'organization_id' => $org->id,
            'name'            => 'João Santos',
            'email'           => 'joao@junta.pt',
            'password'        => Hash::make('password'),
            'role'            => 'operacional',
            'is_active'       => true,
        ]);

        // Service Areas
        $areas = [];
        foreach ([
            ['Atendimento',    '#0284c7'],
            ['Manutenção',     '#dc2626'],
            ['Higiene Urbana', '#16a34a'],
            ['Espaços',        '#7c3aed'],
            ['Secretaria',     '#b45309'],
        ] as [$name, $color]) {
            $areas[] = ServiceArea::create([
                'organization_id' => $org->id,
                'name'  => $name,
                'color' => $color,
                'is_active' => true,
            ]);
        }

        // Contacts
        $contacts = [];
        foreach ([
            ['António Ferreira', 'antonio@email.pt', 'munícipe'],
            ['Associação Cultural', 'associacao@email.pt', 'associação'],
            ['Empresa XYZ', 'empresa@xyz.pt', 'empresa'],
        ] as [$name, $email, $type]) {
            $contacts[] = Contact::create([
                'organization_id' => $org->id,
                'name'  => $name,
                'email' => $email,
                'type'  => $type,
            ]);
        }

        // Tickets
        $statuses   = ['aberto','em_analise','em_progresso','resolvido'];
        $priorities = ['baixa','normal','alta','urgente'];
        $ticketTitles = [
            'Buraco na calçada da Rua das Flores',
            'Iluminação avariada no Largo Central',
            'Pedido de licença de ruído para evento',
            'Reclamação sobre recolha de lixo',
            'Pedido de certidão de residência',
            'Árvore caída junto ao jardim público',
        ];

        foreach ($ticketTitles as $i => $title) {
            $ticket = Ticket::create([
                'organization_id' => $org->id,
                'title'           => $title,
                'description'     => "Descrição detalhada do pedido: $title",
                'status'          => $statuses[$i % count($statuses)],
                'public_status'   => 'em_tratamento',
                'priority'        => $priorities[$i % count($priorities)],
                'origin'          => ['presencial','telefone','portal','email'][$i % 4],
                'contact_id'      => $contacts[$i % count($contacts)]->id,
                'created_by'      => $admin->id,
                'assigned_to'     => [$op->id, $exec->id][$i % 2],
                'service_area_id' => $areas[$i % count($areas)]->id,
            ]);

            $ticket->comments()->create([
                'user_id' => $admin->id,
                'body'    => 'Pedido recebido e encaminhado para análise.',
                'type'    => 'internal',
            ]);

            if ($i % 2 === 0) {
                $ticket->comments()->create([
                    'user_id' => $exec->id,
                    'body'    => 'Obrigado pelo seu contacto. Estamos a tratar do assunto.',
                    'type'    => 'public',
                ]);
            }
        }

        // Spaces
        $spaces = [];
        foreach ([
            ['Salão Nobre', 'salão', 200],
            ['Sala de Reuniões A', 'sala_reuniões', 20],
            ['Auditório Municipal', 'auditório', 150],
            ['Campo Desportivo', 'campo', 100],
        ] as [$name, $type, $cap]) {
            $spaces[] = Space::create([
                'organization_id' => $org->id,
                'name'      => $name,
                'type'      => $type,
                'capacity'  => $cap,
                'is_active' => true,
                'is_public' => true,
            ]);
        }

        // Reservations
        SpaceReservation::create([
            'organization_id'    => $org->id,
            'space_id'           => $spaces[0]->id,
            'contact_id'         => $contacts[1]->id,
            'title'              => 'Festa Anual da Associação Cultural',
            'purpose'            => 'Evento cultural anual com espetáculo e jantar.',
            'starts_at'          => now()->addDays(10)->setHour(19),
            'ends_at'            => now()->addDays(10)->setHour(23),
            'expected_attendees' => 150,
            'status'             => 'pendente',
        ]);

        SpaceReservation::create([
            'organization_id'    => $org->id,
            'space_id'           => $spaces[1]->id,
            'title'              => 'Reunião de Trabalho',
            'starts_at'          => now()->addDays(3)->setHour(10),
            'ends_at'            => now()->addDays(3)->setHour(12),
            'status'             => 'aprovada',
            'reviewed_by'        => $admin->id,
            'reviewed_at'        => now(),
        ]);

        // Events
        foreach ([
            ['Reunião de Executivo', 'reunião', now()->addDays(2)->setHour(10), now()->addDays(2)->setHour(12), '#7c3aed'],
            ['Dia da Freguesia', 'público', now()->addDays(15)->setHour(10), now()->addDays(15)->setHour(18), '#16a34a'],
            ['Manutenção Preventiva', 'interno', now()->addDays(5)->setHour(9), now()->addDays(5)->setHour(17), '#dc2626'],
        ] as [$title, $type, $start, $end, $color]) {
            Event::create([
                'organization_id' => $org->id,
                'title'      => $title,
                'type'       => $type,
                'visibility' => $type === 'público' ? 'público' : 'interno',
                'starts_at'  => $start,
                'ends_at'    => $end,
                'color'      => $color,
                'created_by' => $admin->id,
            ]);
        }

        // Tasks
        foreach ([
            ['Reparar iluminação na Rua da Paz', 'high', $op->id],
            ['Limpar espaço verde junto ao parque', 'medium', $op->id],
            ['Preparar relatório mensal', 'low', $exec->id],
            ['Verificar instalações do salão', 'medium', $op->id],
        ] as [$title, $priority, $user]) {
            Task::create([
                'organization_id' => $org->id,
                'title'           => $title,
                'status'          => 'pending',
                'priority'        => $priority,
                'assigned_to'     => $user,
                'created_by'      => $admin->id,
                'due_date'        => now()->addDays(rand(3, 14)),
                'origin'          => 'manual',
            ]);
        }

        // Departments
        $depts = [];
        foreach (['Serviços Gerais','Administrativo','Técnico'] as $name) {
            $depts[] = Department::create(['organization_id' => $org->id, 'name' => $name]);
        }

        // Employees
        foreach ([
            ['António Costa',   'Encarregado',   $depts[0]->id],
            ['Filipa Rodrigues', 'Administrativa',$depts[1]->id],
            ['Paulo Marques',   'Técnico',        $depts[2]->id],
        ] as [$name, $pos, $dept]) {
            Employee::create([
                'organization_id' => $org->id,
                'department_id'   => $dept,
                'name'            => $name,
                'position'        => $pos,
                'status'          => 'ativo',
                'hire_date'       => now()->subYears(rand(1, 10)),
            ]);
        }

        // Inventory
        $cat = InventoryCategory::create(['organization_id' => $org->id, 'name' => 'Material de Limpeza']);
        $cat2 = InventoryCategory::create(['organization_id' => $org->id, 'name' => 'Ferramentas']);

        foreach ([
            ['Detergente', $cat->id, 'lt', 5.0, 10.0],
            ['Sacos de Lixo (cx)', $cat->id, 'cx', 3.0, 20.0],
            ['Martelo', $cat2->id, 'un', 0.0, 5.0],
            ['Chave de Fendas', $cat2->id, 'un', 2.0, 8.0],
        ] as [$name, $catId, $unit, $min, $stock]) {
            InventoryItem::create([
                'organization_id'      => $org->id,
                'inventory_category_id'=> $catId,
                'name'                 => $name,
                'unit'                 => $unit,
                'min_stock'            => $min,
                'current_stock'        => $stock,
                'is_active'            => true,
            ]);
        }

        // Documents
        Document::create([
            'organization_id' => $org->id,
            'created_by'      => $admin->id,
            'title'           => 'Ata da Reunião de Executivo — Janeiro 2024',
            'type'            => 'ata',
            'visibility'      => 'público',
            'is_approved'     => true,
            'approved_by'     => $admin->id,
            'approved_at'     => now(),
            'meeting_date'    => '2024-01-15',
        ]);
        Document::create([
            'organization_id' => $org->id,
            'created_by'      => $admin->id,
            'title'           => 'Regulamento de Utilização de Espaços',
            'type'            => 'regulamento',
            'visibility'      => 'público',
            'is_approved'     => true,
            'approved_by'     => $admin->id,
            'approved_at'     => now(),
        ]);

        $this->command->info('✅ Dados de demonstração criados com sucesso!');
        $this->command->info('   Login: admin@junta.pt / password');
    }
}
