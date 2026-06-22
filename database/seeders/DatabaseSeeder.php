<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\{
    Organization, User, PersonType, Contact, Department,
    ServiceArea, Team, Space, SpaceReservation,
    Event, EventParticipant, Task, TaskChecklistItem,
    Ticket, TicketComment, OperationalPlan,
    InventoryCategory, InventoryItem, InventoryMovement,
    MaterialLoan, MaterialRequisition,
    Document, Conversation, Message
};

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Organização ──────────────────────────────────────────────────────
        $org = Organization::first();
        if (!$org) {
            $org = Organization::create([
                'name'        => 'Junta de Freguesia de Santa Maria',
                'slug'        => 'jf-santa-maria',
                'email'       => 'geral@jf-santamaria.pt',
                'phone'       => '+351 210 100 200',
                'address'     => 'Praça da República, 12',
                'city'        => 'Lisboa',
                'postal_code' => '1100-048',
                'nif'         => '500123456',
                'is_active'   => true,
            ]);
        } else {
            $org->update([
                'name'        => 'Junta de Freguesia de Santa Maria',
                'email'       => 'geral@jf-santamaria.pt',
                'phone'       => '+351 210 100 200',
                'address'     => 'Praça da República, 12',
                'city'        => 'Lisboa',
                'postal_code' => '1100-048',
            ]);
        }

        $oid = $org->id;
        $now = Carbon::now();

        // ── Utilizadores ─────────────────────────────────────────────────────
        $admin = User::firstOrCreate(['email' => 'admin@jf-santamaria.pt'], [
            'organization_id' => $oid,
            'name'     => 'Ricardo Ferreira',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'is_active'=> true,
        ]);
        $exec = User::firstOrCreate(['email' => 'presidente@jf-santamaria.pt'], [
            'organization_id' => $oid,
            'name'     => 'Ana Sousa',
            'password' => Hash::make('password'),
            'role'     => 'executivo',
            'is_active'=> true,
        ]);
        $op1 = User::firstOrCreate(['email' => 'joao.santos@jf-santamaria.pt'], [
            'organization_id' => $oid,
            'name'     => 'João Santos',
            'password' => Hash::make('password'),
            'role'     => 'operacional',
            'is_active'=> true,
        ]);
        $op2 = User::firstOrCreate(['email' => 'filipa.costa@jf-santamaria.pt'], [
            'organization_id' => $oid,
            'name'     => 'Filipa Costa',
            'password' => Hash::make('password'),
            'role'     => 'operacional',
            'is_active'=> true,
        ]);
        $viewer = User::firstOrCreate(['email' => 'paulo.marques@jf-santamaria.pt'], [
            'organization_id' => $oid,
            'name'     => 'Paulo Marques',
            'password' => Hash::make('password'),
            'role'     => 'manutencao',
            'is_active'=> true,
        ]);

        $this->command->info('✔ Utilizadores criados');

        // ── Person Types ──────────────────────────────────────────────────────
        $ptMunicipe   = PersonType::firstOrCreate(['organization_id'=>$oid,'name'=>'Munícipe'],   ['category'=>'pessoa',   'color'=>'#2563eb','sort_order'=>1,'is_system'=>true,'is_active'=>true]);
        $ptFuncionario= PersonType::firstOrCreate(['organization_id'=>$oid,'name'=>'Funcionário'],['category'=>'pessoa',   'color'=>'#059669','sort_order'=>2,'is_system'=>true,'is_active'=>true]);
        $ptPresidente = PersonType::firstOrCreate(['organization_id'=>$oid,'name'=>'Presidente'], ['category'=>'pessoa',   'color'=>'#7c3aed','sort_order'=>3,'is_system'=>true,'is_active'=>true]);
        $ptFornecedor = PersonType::firstOrCreate(['organization_id'=>$oid,'name'=>'Fornecedor'], ['category'=>'entidade', 'color'=>'#dc2626','sort_order'=>10,'is_system'=>true,'is_active'=>true]);
        $ptAssociacao = PersonType::firstOrCreate(['organization_id'=>$oid,'name'=>'Associação'], ['category'=>'entidade', 'color'=>'#059669','sort_order'=>13,'is_system'=>true,'is_active'=>true]);
        $ptEmpresa    = PersonType::firstOrCreate(['organization_id'=>$oid,'name'=>'Empresa'],    ['category'=>'entidade', 'color'=>'#6b7280','sort_order'=>14,'is_system'=>false,'is_active'=>true]);

        // ── Departamentos ─────────────────────────────────────────────────────
        $deptAdmin = Department::firstOrCreate(['organization_id'=>$oid,'name'=>'Administrativo']);
        $deptTec   = Department::firstOrCreate(['organization_id'=>$oid,'name'=>'Técnico']);
        $deptOp    = Department::firstOrCreate(['organization_id'=>$oid,'name'=>'Operações']);

        // ── Pessoas (Contactos) ───────────────────────────────────────────────
        $pessoas = [];
        $dadosPessoas = [
            ['António Ferreira',  'antonio.ferreira@email.pt', '912 000 001', $ptMunicipe->id,  null,          'Lisboa',   null,        null        ],
            ['Maria do Carmo',    'maria.carmo@email.pt',      '912 000 002', $ptMunicipe->id,  null,          'Lisboa',   null,        null        ],
            ['Carlos Rodrigues',  'carlos.rodrigues@email.pt', '912 000 003', $ptMunicipe->id,  null,          'Amadora',  null,        null        ],
            ['Teresa Lopes',      'teresa.lopes@email.pt',     '912 000 004', $ptMunicipe->id,  null,          'Lisboa',   null,        null        ],
            ['Luís Pereira',      'luis.pereira@email.pt',     '912 000 005', $ptMunicipe->id,  null,          'Odivelas', null,        null        ],
            ['Ana Sousa',         'ana.sousa@jf-santamaria.pt','912 000 010', $ptPresidente->id,$deptAdmin->id,'Lisboa',   'Presidente','P001'      ],
            ['João Santos',       'joao.santos@jf-santamaria.pt','912 000 011',$ptFuncionario->id,$deptOp->id, 'Lisboa',   'Encarregado','F001'     ],
            ['Filipa Costa',      'filipa.costa@jf-santamaria.pt','912 000 012',$ptFuncionario->id,$deptAdmin->id,'Lisboa','Administrativa','F002'  ],
            ['Paulo Marques',     'paulo.marques@jf-santamaria.pt','912 000 013',$ptFuncionario->id,$deptTec->id,'Lisboa',  'Técnico',   'F003'      ],
        ];

        foreach ($dadosPessoas as [$name,$email,$phone,$ptId,$deptId,$city,$position,$empNum]) {
            $pessoas[] = Contact::firstOrCreate(['organization_id'=>$oid,'email'=>$email],[
                'name'            => $name,
                'phone'           => $phone,
                'person_type_id'  => $ptId,
                'department_id'   => $deptId,
                'locality'        => $city,
                'position'        => $position,
                'employee_number' => $empNum,
                'hire_date'       => $empNum ? $now->copy()->subYears(rand(1,8)) : null,
                'employee_status' => $empNum ? 'ativo' : null,
                'is_active'       => true,
                'type'            => 'pessoa',
            ]);
        }

        // Entidades
        $entidades = [];
        $dadosEntidades = [
            ['Associação Cultural do Bairro', 'geral@acbairro.pt',    '213 000 001', $ptAssociacao->id],
            ['Associação Desportiva Local',   'info@adlocal.pt',      '213 000 002', $ptAssociacao->id],
            ['Empresa de Limpeza CleanCity',  'cleancity@email.pt',   '213 000 010', $ptFornecedor->id],
            ['Construções Silva & Filhos',    'geral@silvaconstrucoes.pt','213 000 011',$ptFornecedor->id],
            ['Papelaria Central',             'papelaria@central.pt', '213 000 012', $ptFornecedor->id],
            ['TechSoft Lda.',                 'info@techsoft.pt',     '213 000 020', $ptEmpresa->id   ],
        ];

        foreach ($dadosEntidades as [$name,$email,$phone,$ptId]) {
            $entidades[] = Contact::firstOrCreate(['organization_id'=>$oid,'email'=>$email],[
                'name'           => $name,
                'phone'          => $phone,
                'person_type_id' => $ptId,
                'is_active'      => true,
                'type'           => 'entidade',
            ]);
        }

        $this->command->info('✔ Pessoas e Entidades criadas');

        // ── Ligar utilizadores às pessoas ─────────────────────────────────────
        $pessoas[5]->update(['user_id' => $exec->id]);  // Ana Sousa → presidente
        $pessoas[6]->update(['user_id' => $op1->id]);   // João Santos → op1
        $pessoas[7]->update(['user_id' => $op2->id]);   // Filipa Costa → op2
        $pessoas[8]->update(['user_id' => $viewer->id]);// Paulo Marques → viewer

        // ── Áreas de serviço ──────────────────────────────────────────────────
        $areas = [];
        foreach ([
            ['Atendimento ao Cidadão', '#0284c7'],
            ['Manutenção e Obras',     '#dc2626'],
            ['Higiene Urbana',         '#16a34a'],
            ['Espaços e Reservas',     '#7c3aed'],
            ['Secretaria',             '#b45309'],
            ['Desporto e Cultura',     '#0891b2'],
        ] as [$name, $color]) {
            $areas[] = ServiceArea::firstOrCreate(
                ['organization_id'=>$oid,'name'=>$name],
                ['color'=>$color,'is_active'=>true]
            );
        }

        $this->command->info('✔ Áreas de serviço criadas');

        // ── Equipas ───────────────────────────────────────────────────────────
        $equipaOp = Team::firstOrCreate(['organization_id'=>$oid,'name'=>'Equipa de Operações'],[
            'type'        => 'operacional',
            'leader_id'   => $op1->id,
            'description' => 'Responsável pela manutenção e higiene urbana.',
            'is_active'   => true,
        ]);
        $equipaAdmin = Team::firstOrCreate(['organization_id'=>$oid,'name'=>'Equipa Administrativa'],[
            'type'      => 'administrativo',
            'leader_id' => $op2->id,
            'description'=> 'Gestão administrativa e atendimento ao cidadão.',
            'is_active'  => true,
        ]);

        // Membros das equipas
        DB::table('team_members')->insertOrIgnore([
            ['team_id'=>$equipaOp->id,   'user_id'=>$op1->id,   'role'=>'lider',  'created_at'=>$now],
            ['team_id'=>$equipaOp->id,   'user_id'=>$viewer->id,'role'=>'membro', 'created_at'=>$now],
            ['team_id'=>$equipaAdmin->id,'user_id'=>$op2->id,   'role'=>'lider',  'created_at'=>$now],
            ['team_id'=>$equipaAdmin->id,'user_id'=>$exec->id,  'role'=>'membro', 'created_at'=>$now],
        ]);

        $this->command->info('✔ Equipas criadas');

        // ── Espaços ───────────────────────────────────────────────────────────
        $espacos = [];
        foreach ([
            ['Salão Nobre',          'salão',         200, true ],
            ['Sala de Reuniões A',   'sala_reunioes',  20, false],
            ['Sala de Reuniões B',   'sala_reunioes',  15, false],
            ['Auditório Municipal',  'auditório',     120, true ],
            ['Campo Desportivo',     'campo',         500, true ],
            ['Jardim da Freguesia',  'jardim',       1000, true ],
        ] as [$name,$type,$cap,$public]) {
            $espacos[] = Space::firstOrCreate(['organization_id'=>$oid,'name'=>$name],[
                'type'      => $type,
                'capacity'  => $cap,
                'is_active' => true,
                'is_public' => $public,
            ]);
        }

        // ── Reservas ──────────────────────────────────────────────────────────
        $reservas = [
            SpaceReservation::firstOrCreate(
                ['organization_id'=>$oid,'title'=>'Festa Anual da Associação Cultural'],
                [
                    'space_id'           => $espacos[0]->id,
                    'contact_id'         => $entidades[0]->id,
                    'purpose'            => 'Evento cultural anual com espetáculo e jantar convívio.',
                    'starts_at'          => $now->copy()->addDays(12)->setHour(19)->setMinute(0),
                    'ends_at'            => $now->copy()->addDays(12)->setHour(23)->setMinute(30),
                    'expected_attendees' => 180,
                    'status'             => 'aprovada',
                    'reviewed_by'        => $admin->id,
                    'reviewed_at'        => $now,
                ]
            ),
            SpaceReservation::firstOrCreate(
                ['organization_id'=>$oid,'title'=>'Torneio de Futsal Inter-Freguesias'],
                [
                    'space_id'           => $espacos[4]->id,
                    'contact_id'         => $entidades[1]->id,
                    'purpose'            => 'Torneio desportivo com participação de 8 equipas.',
                    'starts_at'          => $now->copy()->addDays(20)->setHour(9)->setMinute(0),
                    'ends_at'            => $now->copy()->addDays(20)->setHour(18)->setMinute(0),
                    'expected_attendees' => 200,
                    'status'             => 'pendente',
                ]
            ),
            SpaceReservation::firstOrCreate(
                ['organization_id'=>$oid,'title'=>'Reunião da Assembleia de Freguesia'],
                [
                    'space_id'           => $espacos[3]->id,
                    'purpose'            => 'Reunião ordinária trimestral da Assembleia.',
                    'starts_at'          => $now->copy()->addDays(5)->setHour(21)->setMinute(0),
                    'ends_at'            => $now->copy()->addDays(5)->setHour(23)->setMinute(0),
                    'expected_attendees' => 80,
                    'status'             => 'aprovada',
                    'reviewed_by'        => $admin->id,
                    'reviewed_at'        => $now,
                ]
            ),
            SpaceReservation::firstOrCreate(
                ['organization_id'=>$oid,'title'=>'Workshop de Pintura para Seniores'],
                [
                    'space_id'           => $espacos[1]->id,
                    'contact_id'         => $pessoas[0]->id,
                    'purpose'            => 'Atividade sociocultural para cidadãos seniores.',
                    'starts_at'          => $now->copy()->addDays(3)->setHour(10)->setMinute(0),
                    'ends_at'            => $now->copy()->addDays(3)->setHour(12)->setMinute(0),
                    'expected_attendees' => 15,
                    'status'             => 'aprovada',
                    'reviewed_by'        => $exec->id,
                    'reviewed_at'        => $now,
                ]
            ),
        ];

        $this->command->info('✔ Espaços e reservas criados');

        // ── Tickets ───────────────────────────────────────────────────────────
        $ticketData = [
            ['Buraco na calçada da Rua das Flores',       'aberto',       'alta',   'presencial', $pessoas[0]->id, $areas[0]->id, $op1->id,  'pedido'     ],
            ['Iluminação avariada no Largo Central',       'em_progresso', 'urgente','telefone',   $pessoas[1]->id, $areas[1]->id, $op1->id,  'reclamacao' ],
            ['Pedido de licença de ruído para evento',     'em_analise',   'normal', 'email',      $entidades[0]->id,$areas[3]->id,$exec->id, 'pedido'     ],
            ['Reclamação sobre frequência de recolha',     'resolvido',    'normal', 'portal',     $pessoas[2]->id, $areas[2]->id, $op2->id,  'reclamacao' ],
            ['Pedido de certidão de residência',           'encerrado',    'baixa',  'presencial', $pessoas[3]->id, $areas[4]->id, $op2->id,  'pedido'     ],
            ['Árvore caída junto ao jardim público',       'com_tarefas',  'urgente','telefone',   $pessoas[4]->id, $areas[1]->id, $op1->id,  'incidente'  ],
            ['Pavimento danificado na Av. Principal',      'em_progresso', 'alta',   'email',      $pessoas[0]->id, $areas[1]->id, $op1->id,  'reclamacao' ],
            ['Pedido de apoio para evento desportivo',     'em_analise',   'normal', 'portal',     $entidades[1]->id,$areas[5]->id,$exec->id, 'pedido'     ],
            ['Graffiti em parede patrimonial',             'aberto',       'alta',   'presencial', $pessoas[1]->id, $areas[1]->id, $op2->id,  'reclamacao' ],
            ['Ruído excessivo em estabelecimento',         'aberto',       'alta',   'telefone',   $pessoas[2]->id, $areas[0]->id, $exec->id, 'reclamacao' ],
        ];

        $tickets = [];
        foreach ($ticketData as $i => [$title,$status,$priority,$origin,$contactId,$areaId,$assignedTo,$tipo]) {
            $tickets[] = Ticket::firstOrCreate(
                ['organization_id'=>$oid,'title'=>$title],
                [
                    'description'   => "Pedido registado pelo cidadão: $title. Aguarda análise e resposta por parte dos serviços competentes.",
                    'status'        => $status,
                    'public_status' => in_array($status,['resolvido','encerrado']) ? 'resolvido' : 'em_tratamento',
                    'priority'      => $priority,
                    'origin'        => $origin,
                    'ticket_type'   => $tipo,
                    'contact_id'    => $contactId,
                    'created_by'    => $admin->id,
                    'assigned_to'   => $assignedTo,
                    'service_area_id'=> $areaId,
                    'resolved_at'   => in_array($status,['resolvido','encerrado']) ? $now->copy()->subDays(rand(1,5)) : null,
                ]
            );
        }

        // Comentários nos tickets
        $tickets[0]->comments()->firstOrCreate(['user_id'=>$admin->id,'type'=>'internal'],
            ['body'=>'Pedido recebido e encaminhado para a equipa de manutenção. A verificar no local.']);
        $tickets[1]->comments()->firstOrCreate(['user_id'=>$op1->id,'type'=>'internal'],
            ['body'=>'Equipa deslocou-se ao local. Material necessário: 2 lâmpadas LED 60W. A aguardar encomenda.']);
        $tickets[1]->comments()->firstOrCreate(['user_id'=>$exec->id,'type'=>'public'],
            ['body'=>'Caro munícipe, a sua reclamação foi registada com prioridade urgente. Estamos a trabalhar na resolução.']);
        $tickets[3]->comments()->firstOrCreate(['user_id'=>$op2->id,'type'=>'public'],
            ['body'=>'A situação foi regularizada junto da empresa responsável pela recolha. Obrigado pelo contacto.']);

        $this->command->info('✔ Tickets criados');

        // ── Planos Operacionais ───────────────────────────────────────────────
        $planos = [];
        $planosData = [
            ['Reabilitação do Parque Urbano Central',          2026, 'ativo',    $areas[3]->id, $exec->id,  45000, 35],
            ['Programa de Higiene Urbana Semestral',           2026, 'ativo',    $areas[2]->id, $op1->id,   12000, 60],
            ['Renovação da Iluminação Pública',                2026, 'planeado', $areas[1]->id, $exec->id,  80000,  0],
            ['Semana Cultural 2026',                           2026, 'ativo',    $areas[5]->id, $exec->id,   8500, 20],
            ['Manutenção Preventiva de Infraestruturas 2025',  2025, 'concluido',$areas[1]->id, $op1->id,   30000,100],
        ];

        foreach ($planosData as [$title,$year,$status,$areaId,$managerId,$budget,$progress]) {
            $planos[] = OperationalPlan::firstOrCreate(
                ['organization_id'=>$oid,'title'=>$title],
                [
                    'created_by'    => $admin->id,
                    'manager_id'    => $managerId,
                    'service_area_id'=> $areaId,
                    'year'          => $year,
                    'status'        => $status,
                    'progress'      => $progress,
                    'budget'        => $budget,
                    'planned_start' => Carbon::create($year,1,1),
                    'planned_end'   => Carbon::create($year,12,31),
                    'description'   => "Plano operacional: $title",
                ]
            );
        }

        $this->command->info('✔ Planos operacionais criados');

        // ── Tarefas ───────────────────────────────────────────────────────────
        $tarefasData = [
            ['Reparar calçada Rua das Flores',           'in_progress','high',  $op1->id,  $areas[1]->id, $equipaOp->id,   3, $tickets[0]->id, $planos[0]->id],
            ['Substituir lâmpadas Largo Central',        'pending',    'high',  $op1->id,  $areas[1]->id, $equipaOp->id,   5, $tickets[1]->id, $planos[2]->id],
            ['Limpeza espaços verdes — Semana 26',       'in_progress','medium',$op1->id,  $areas[2]->id, $equipaOp->id,   2, null,            $planos[1]->id],
            ['Preparar relatório mensal de maio',        'completed',  'low',   $op2->id,  $areas[4]->id, $equipaAdmin->id,-2, null,            null          ],
            ['Verificar instalações Salão Nobre',        'pending',    'medium',$op1->id,  $areas[3]->id, $equipaOp->id,   7, null,            null          ],
            ['Tratar árvore caída no jardim público',    'in_progress','high',  $op1->id,  $areas[1]->id, $equipaOp->id,   1, $tickets[5]->id, null          ],
            ['Preparar logística Semana Cultural',       'pending',    'medium',$op2->id,  $areas[5]->id, $equipaAdmin->id,14, null,            $planos[3]->id],
            ['Inspecção pavimento Av. Principal',        'pending',    'high',  $op1->id,  $areas[1]->id, $equipaOp->id,   4, $tickets[6]->id, $planos[0]->id],
            ['Actualizar base de dados de munícipes',    'pending',    'low',   $op2->id,  $areas[4]->id, $equipaAdmin->id,10, null,            null          ],
            ['Pintura da fachada do edifício sede',      'pending',    'medium',$op1->id,  $areas[1]->id, $equipaOp->id,   30,null,            $planos[0]->id],
        ];

        $tarefas = [];
        foreach ($tarefasData as [$title,$status,$priority,$assignedTo,$areaId,$teamId,$days,$ticketId,$planId]) {
            $tarefas[] = Task::firstOrCreate(
                ['organization_id'=>$oid,'title'=>$title],
                [
                    'description'    => "Tarefa operacional: $title",
                    'status'         => $status,
                    'priority'       => $priority,
                    'assigned_to'    => $assignedTo,
                    'created_by'     => $admin->id,
                    'service_area_id'=> $areaId,
                    'team_id'        => $teamId,
                    'ticket_id'      => $ticketId,
                    'plan_id'        => $planId,
                    'due_date'       => $now->copy()->addDays($days),
                    'origin'         => $ticketId ? 'ticket' : 'manual',
                    'recurrence'     => 'nenhuma',
                    'validation_status'=> 'nao_aplicavel',
                ]
            );
        }

        // Checklists
        $checklistData = [
            0 => [
                ['Sinalizar a área de obra',  true ],
                ['Remover material solto',    true ],
                ['Colocar material novo',     false],
                ['Acabamento e limpeza',      false],
            ],
            2 => [
                ['Cortar ervas daninhas',     true ],
                ['Recolher resíduos',         true ],
                ['Regar plantas',             false],
            ],
            5 => [
                ['Avaliar dimensão da árvore',true ],
                ['Solicitar equipamento',     true ],
                ['Remover a árvore',          false],
                ['Tratar do entulho',         false],
            ],
        ];

        foreach ($checklistData as $tIdx => $items) {
            foreach ($items as $order => [$desc,$done]) {
                TaskChecklistItem::firstOrCreate(
                    ['task_id'=>$tarefas[$tIdx]->id,'description'=>$desc],
                    ['is_done'=>$done,'sort_order'=>$order,'created_by'=>$admin->id]
                );
            }
        }

        $this->command->info('✔ Tarefas criadas');

        // ── Eventos ───────────────────────────────────────────────────────────
        $eventosData = [
            ['Reunião de Executivo — Junho',    'reunião',  'interno', $now->copy()->addDays(2)->setHour(10), $now->copy()->addDays(2)->setHour(12),  '#7c3aed', null           ],
            ['Dia da Freguesia 2026',           'público',  'público', $now->copy()->addDays(18)->setHour(10),$now->copy()->addDays(18)->setHour(20),  '#16a34a', $planos[3]->id ],
            ['Manutenção Preventiva Semanal',   'interno',  'interno', $now->copy()->addDays(1)->setHour(8),  $now->copy()->addDays(1)->setHour(17),   '#dc2626', $planos[1]->id ],
            ['Sessão de Atendimento Alargado',  'publico',  'público', $now->copy()->addDays(4)->setHour(9),  $now->copy()->addDays(4)->setHour(13),   '#0284c7', null           ],
            ['Workshop Empreendedorismo Local', 'público',  'público', $now->copy()->addDays(25)->setHour(14),$now->copy()->addDays(25)->setHour(17),  '#0891b2', $planos[3]->id ],
            ['Reunião com Associações Locais',  'reunião',  'interno', $now->copy()->addDays(7)->setHour(15), $now->copy()->addDays(7)->setHour(17),   '#b45309', null           ],
            ['Assembleia de Freguesia',         'reunião',  'público', $now->copy()->addDays(5)->setHour(21), $now->copy()->addDays(5)->setHour(23),   '#1d4ed8', null           ],
        ];

        $eventos = [];
        foreach ($eventosData as [$title,$type,$visibility,$start,$end,$color,$planId]) {
            $eventos[] = Event::firstOrCreate(
                ['organization_id'=>$oid,'title'=>$title],
                [
                    'type'        => $type,
                    'visibility'  => $visibility,
                    'starts_at'   => $start,
                    'ends_at'     => $end,
                    'color'       => $color,
                    'plan_id'     => $planId,
                    'created_by'  => $admin->id,
                    'description' => "$title — organizado pela Junta de Freguesia de Santa Maria.",
                ]
            );
        }

        // Participantes em eventos
        DB::table('event_participants')->insertOrIgnore([
            ['event_id'=>$eventos[0]->id,'user_id'=>$admin->id, 'status'=>'confirmado','created_at'=>$now,'updated_at'=>$now],
            ['event_id'=>$eventos[0]->id,'user_id'=>$exec->id,  'status'=>'confirmado','created_at'=>$now,'updated_at'=>$now],
            ['event_id'=>$eventos[0]->id,'user_id'=>$op2->id,   'status'=>'confirmado','created_at'=>$now,'updated_at'=>$now],
            ['event_id'=>$eventos[1]->id,'user_id'=>$admin->id, 'status'=>'confirmado','created_at'=>$now,'updated_at'=>$now],
            ['event_id'=>$eventos[1]->id,'user_id'=>$exec->id,  'status'=>'confirmado','created_at'=>$now,'updated_at'=>$now],
            ['event_id'=>$eventos[2]->id,'user_id'=>$op1->id,   'status'=>'confirmado','created_at'=>$now,'updated_at'=>$now],
            ['event_id'=>$eventos[2]->id,'user_id'=>$viewer->id,'status'=>'confirmado','created_at'=>$now,'updated_at'=>$now],
            ['event_id'=>$eventos[5]->id,'user_id'=>$admin->id, 'status'=>'confirmado','created_at'=>$now,'updated_at'=>$now],
            ['event_id'=>$eventos[5]->id,'user_id'=>$exec->id,  'status'=>'confirmado','created_at'=>$now,'updated_at'=>$now],
            ['event_id'=>$eventos[6]->id,'user_id'=>$admin->id, 'status'=>'confirmado','created_at'=>$now,'updated_at'=>$now],
            ['event_id'=>$eventos[6]->id,'user_id'=>$exec->id,  'status'=>'confirmado','created_at'=>$now,'updated_at'=>$now],
        ]);

        $this->command->info('✔ Eventos criados');

        // ── Documentos (Atas) ─────────────────────────────────────────────────
        $docs = [
            ['Ata da Reunião de Executivo — Março 2026',     'ata',          '2026-03-10', true ],
            ['Ata da Reunião de Executivo — Fevereiro 2026', 'ata',          '2026-02-12', true ],
            ['Ata da Assembleia de Freguesia — Janeiro 2026','ata',          '2026-01-15', true ],
            ['Regulamento de Utilização de Espaços',         'regulamento',  null,         true ],
            ['Plano de Atividades 2026',                     'plano',        null,         true ],
            ['Orçamento 2026',                               'orcamento',    null,         true ],
            ['Relatório de Atividades 2025',                 'relatorio',    null,         true ],
            ['Regulamento Interno de Pessoal',               'regulamento',  null,         false],
        ];

        foreach ($docs as [$title,$type,$meetDate,$isPublic]) {
            Document::firstOrCreate(
                ['organization_id'=>$oid,'title'=>$title],
                [
                    'created_by'   => $admin->id,
                    'type'         => $type,
                    'visibility'   => $isPublic ? 'público' : 'interno',
                    'is_approved'  => true,
                    'approved_by'  => $admin->id,
                    'approved_at'  => $now,
                    'meeting_date' => $meetDate,
                ]
            );
        }

        $this->command->info('✔ Documentos criados');

        // ── Inventário ────────────────────────────────────────────────────────
        $catLimpeza   = InventoryCategory::firstOrCreate(['organization_id'=>$oid,'name'=>'Material de Limpeza']);
        $catFerr      = InventoryCategory::firstOrCreate(['organization_id'=>$oid,'name'=>'Ferramentas e Equipamentos']);
        $catEPI       = InventoryCategory::firstOrCreate(['organization_id'=>$oid,'name'=>'EPI e Segurança']);
        $catEscritorio= InventoryCategory::firstOrCreate(['organization_id'=>$oid,'name'=>'Material de Escritório']);
        $catEletrico  = InventoryCategory::firstOrCreate(['organization_id'=>$oid,'name'=>'Material Eléctrico']);

        $itensData = [
            ['Detergente Multiusos (5L)',     $catLimpeza->id,   'lt',  10.0, 45.0,  3.50,  $entidades[2]->id, 'consumivel'],
            ['Sacos de Lixo 100L (cx50)',     $catLimpeza->id,   'cx',   5.0, 18.0,  8.90,  $entidades[2]->id, 'consumivel'],
            ['Lixívia Industrial (5L)',        $catLimpeza->id,   'lt',   8.0, 24.0,  2.80,  $entidades[2]->id, 'consumivel'],
            ['Mop Industrial',                $catLimpeza->id,   'un',   2.0,  6.0, 12.50,  $entidades[2]->id, 'equipamento'],
            ['Martelo 500g',                  $catFerr->id,      'un',   1.0,  8.0, 15.00,  $entidades[3]->id, 'equipamento'],
            ['Berbequim Elétrico',            $catFerr->id,      'un',   1.0,  3.0,125.00,  $entidades[3]->id, 'equipamento'],
            ['Chave de Fendas (jogo)',         $catFerr->id,      'un',   2.0,  5.0,  9.90,  $entidades[3]->id, 'equipamento'],
            ['Escada Alumínio 4m',            $catFerr->id,      'un',   1.0,  2.0, 89.00,  $entidades[3]->id, 'equipamento'],
            ['Colete Reflector',              $catEPI->id,       'un',   5.0, 12.0,  6.50,  $entidades[2]->id, 'EPI'       ],
            ['Luvas de Proteção (par)',        $catEPI->id,       'par', 10.0, 30.0,  2.20,  $entidades[2]->id, 'EPI'       ],
            ['Capacete de Segurança',         $catEPI->id,       'un',   3.0,  7.0, 18.00,  $entidades[2]->id, 'EPI'       ],
            ['Resma A4 80g',                  $catEscritorio->id,'un',   5.0, 22.0,  4.50,  $entidades[4]->id, 'consumivel'],
            ['Canetas BIC (cx12)',             $catEscritorio->id,'cx',   3.0, 10.0,  3.20,  $entidades[4]->id, 'consumivel'],
            ['Tinteiro HP 302 Preto',         $catEscritorio->id,'un',   2.0,  4.0, 16.90,  $entidades[4]->id, 'consumivel'],
            ['Lâmpada LED 60W E27',           $catEletrico->id,  'un',  10.0, 35.0,  4.20,  $entidades[4]->id, 'consumivel'],
            ['Fita Isoladora (rolo)',          $catEletrico->id,  'un',   5.0, 15.0,  1.80,  $entidades[4]->id, 'consumivel'],
        ];

        $itens = [];
        foreach ($itensData as [$name,$catId,$unit,$min,$stock,$preco,$supplierId,$genre]) {
            $itens[] = InventoryItem::firstOrCreate(
                ['organization_id'=>$oid,'name'=>$name],
                [
                    'inventory_category_id' => $catId,
                    'unit'          => $unit,
                    'min_stock'     => $min,
                    'current_stock' => $stock,
                    'subcategory'   => $genre,
                    'supplier_id'   => $supplierId,
                    'is_active'     => true,
                    'quality_grade' => 'A',
                ]
            );
        }

        // Movimentos de inventário
        $movimentosData = [
            [$itens[0]->id,  'entrada',    20, 'Reposição de stock — encomenda mensal',              $op2->id],
            [$itens[1]->id,  'entrada',    10, 'Reposição de stock',                                 $op2->id],
            [$itens[4]->id,  'saída',       2, 'Empréstimo para obra Rua das Flores',                $op1->id],
            [$itens[5]->id,  'empréstimo',  1, 'Emprestado à equipa de manutenção',                 $op1->id],
            [$itens[8]->id,  'entrada',     5, 'Compra de novos coletes',                            $op2->id],
            [$itens[14]->id, 'saída',       8, 'Substituição lâmpadas Largo Central',               $op1->id],
            [$itens[11]->id, 'saída',       3, 'Material para secretaria',                           $op2->id],
            [$itens[0]->id,  'quebra',      2, 'Frasco danificado durante transporte',              $op1->id],
        ];

        foreach ($movimentosData as [$itemId,$type,$qty,$notes,$userId]) {
            InventoryMovement::firstOrCreate(
                ['inventory_item_id'=>$itemId,'notes'=>$notes],
                [
                    'organization_id'  => $oid,
                    'user_id'          => $userId,
                    'type'             => $type,
                    'quantity'         => $qty,
                    'occurred_at'      => $now->copy()->subDays(rand(1,20)),
                ]
            );
        }

        // Empréstimos
        MaterialLoan::firstOrCreate(
            ['organization_id'=>$oid,'inventory_item_id'=>$itens[5]->id,'borrower_name'=>'João Santos'],
            [
                'user_id'           => $op1->id,
                'borrower_contact_id'=> $pessoas[6]->id,
                'team_id'           => $equipaOp->id,
                'quantity'          => 1,
                'purpose'           => 'Obra de reparação calçada Rua das Flores',
                'condition_out'     => 'Bom',
                'loaned_at'         => $now->copy()->subDays(5),
                'expected_return_at'=> $now->copy()->addDays(3),
                'status'            => 'activo',
            ]
        );
        MaterialLoan::firstOrCreate(
            ['organization_id'=>$oid,'inventory_item_id'=>$itens[7]->id,'borrower_name'=>'Paulo Marques'],
            [
                'user_id'           => $viewer->id,
                'borrower_contact_id'=> $pessoas[8]->id,
                'quantity'          => 1,
                'purpose'           => 'Trabalhos técnicos no Auditório',
                'condition_out'     => 'Bom',
                'loaned_at'         => $now->copy()->subDays(10),
                'expected_return_at'=> $now->copy()->subDays(3),
                'returned_at'       => $now->copy()->subDays(3),
                'condition_in'      => 'Bom',
                'status'            => 'devolvido',
            ]
        );

        // Requisições
        MaterialRequisition::firstOrCreate(
            ['organization_id'=>$oid,'inventory_item_id'=>$itens[14]->id,'purpose'=>'Substituição iluminação Largo Central'],
            [
                'requester_id'       => $op1->id,
                'team_id'            => $equipaOp->id,
                'quantity_requested' => 10,
                'status'             => 'aprovada',
                'approved_by'        => $admin->id,
                'approved_at'        => $now->copy()->subDays(2),
                'quantity_delivered' => 10,
                'delivered_at'       => $now->copy()->subDays(1),
            ]
        );
        MaterialRequisition::firstOrCreate(
            ['organization_id'=>$oid,'inventory_item_id'=>$itens[0]->id,'purpose'=>'Limpeza semanal espaços públicos'],
            [
                'requester_id'       => $op1->id,
                'team_id'            => $equipaOp->id,
                'quantity_requested' => 5,
                'status'             => 'pendente',
            ]
        );

        $this->command->info('✔ Inventário criado');

        // ── Chat (Conversações) ───────────────────────────────────────────────
        $chatGeral = Conversation::firstOrCreate(
            ['organization_id'=>$oid,'name'=>'Equipa Operacional'],
            [
                'type'           => 'group',
                'avatar_color'   => '#dc2626',
                'created_by'     => $admin->id,
                'last_message_at'=> $now->copy()->subMinutes(15),
            ]
        );

        DB::table('conversation_participants')->insertOrIgnore([
            ['conversation_id'=>$chatGeral->id,'user_id'=>$admin->id,'is_admin'=>true, 'joined_at'=>$now,'last_read_at'=>$now],
            ['conversation_id'=>$chatGeral->id,'user_id'=>$op1->id,  'is_admin'=>false,'joined_at'=>$now,'last_read_at'=>$now->copy()->subMinutes(30)],
            ['conversation_id'=>$chatGeral->id,'user_id'=>$op2->id,  'is_admin'=>false,'joined_at'=>$now,'last_read_at'=>$now->copy()->subHours(2)],
            ['conversation_id'=>$chatGeral->id,'user_id'=>$viewer->id,'is_admin'=>false,'joined_at'=>$now,'last_read_at'=>$now->copy()->subHours(5)],
        ]);

        $mensagens = [
            [$admin->id,  'Bom dia equipa! Não se esqueçam da reunião de amanhã às 10h.', $now->copy()->subHours(3)],
            [$op1->id,    'Confirmado! Estamos na obra da Rua das Flores hoje até às 17h.', $now->copy()->subHours(2)],
            [$op2->id,    'Preciso de mais sacos de lixo para o turno da tarde. Posso levantar no armazém?', $now->copy()->subHour()],
            [$admin->id,  'Sim, já autorizei. Stock actualizado no sistema.', $now->copy()->subMinutes(45)],
            [$viewer->id, 'A inspecção ao Auditório está concluída. Tudo em ordem para a assembleia.', $now->copy()->subMinutes(15)],
        ];

        foreach ($mensagens as [$userId,$body,$at]) {
            Message::firstOrCreate(
                ['conversation_id'=>$chatGeral->id,'user_id'=>$userId,'body'=>$body],
                ['created_at'=>$at,'updated_at'=>$at]
            );
        }

        // Conversa directa admin ↔ presidente
        $chatDireto = Conversation::firstOrCreate(
            ['organization_id'=>$oid,'name'=>null,'created_by'=>$admin->id,'type'=>'direct'],
            [
                'type'           => 'direct',
                'avatar_color'   => '#7c3aed',
                'created_by'     => $admin->id,
                'last_message_at'=> $now->copy()->subHours(1),
            ]
        );

        DB::table('conversation_participants')->insertOrIgnore([
            ['conversation_id'=>$chatDireto->id,'user_id'=>$admin->id,'is_admin'=>true, 'joined_at'=>$now,'last_read_at'=>$now],
            ['conversation_id'=>$chatDireto->id,'user_id'=>$exec->id, 'is_admin'=>false,'joined_at'=>$now,'last_read_at'=>$now->copy()->subHours(1)],
        ]);

        Message::firstOrCreate(
            ['conversation_id'=>$chatDireto->id,'user_id'=>$exec->id,'body'=>'Ricardo, podes verificar o orçamento do plano do parque?'],
            ['created_at'=>$now->copy()->subHours(2),'updated_at'=>$now->copy()->subHours(2)]
        );
        Message::firstOrCreate(
            ['conversation_id'=>$chatDireto->id,'user_id'=>$admin->id,'body'=>'Sim, já está actualizado. Vê no módulo de Planeamento.'],
            ['created_at'=>$now->copy()->subHours(1),'updated_at'=>$now->copy()->subHours(1)]
        );

        $this->command->info('✔ Chat criado');

        $this->command->newLine();
        $this->command->info('🎉 Dados de demonstração criados com sucesso!');
        $this->command->newLine();
        $this->command->table(
            ['Credencial', 'Valor'],
            [
                ['URL',      config('app.url').'/login'],
                ['Admin',    'admin@jf-santamaria.pt / password'],
                ['Executivo','presidente@jf-santamaria.pt / password'],
                ['Operacional','joao.santos@jf-santamaria.pt / password'],
            ]
        );
    }
}
