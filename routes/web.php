<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PersonTypeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OperationalPlanController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SpaceController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\EntityController;
use App\Http\Controllers\ConversationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Auth (público)
Route::get('/login',   [AuthController::class, 'showLogin'])->name('login');
Route::post('/login',  [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Manifesto PWA dinâmico (sem auth — chamado pelo browser antes do login)
Route::get('/pwa-manifest', function () {
    $org  = \App\Models\Organization::find(1);
    $name = $org?->name ?? 'JuntaOS';

    $logoUrl = $org?->logo
        ? \Illuminate\Support\Facades\Storage::disk('public')->url($org->logo)
        : url('/icons/icon-192.png');

    $icons = [
        ['src' => $logoUrl,             'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'any maskable'],
        ['src' => url('/icons/icon-192.png'), 'sizes' => '192x192', 'type' => 'image/png', 'purpose' => 'any maskable'],
        ['src' => url('/icons/icon-144.png'), 'sizes' => '144x144', 'type' => 'image/png', 'purpose' => 'any maskable'],
    ];

    return response()->json([
        'name'             => $name,
        'short_name'       => $name,
        'description'      => 'Sistema de gestão para juntas de freguesia',
        'start_url'        => '/',
        'display'          => 'standalone',
        'background_color' => $org?->sidebar_color ?? '#0f172a',
        'theme_color'      => $org?->primary_color ?? '#4f46e5',
        'orientation'      => 'portrait-primary',
        'icons'            => $icons,
        'shortcuts'        => [
            ['name' => 'Chat',    'url' => '/chat',    'icons' => [['src' => url('/icons/icon-96.png'), 'sizes' => '96x96']]],
            ['name' => 'Tarefas', 'url' => '/tarefas', 'icons' => [['src' => url('/icons/icon-96.png'), 'sizes' => '96x96']]],
        ],
    ], 200, ['Content-Type' => 'application/manifest+json']);
});

// Rotas protegidas
Route::middleware('auth')->group(function () {

    // Dashboard
    Route::get('/',          [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Perfil do utilizador
    Route::get('/perfil',    [SettingsController::class, 'profile'])->name('profile');
    Route::patch('/perfil',  [SettingsController::class, 'updateProfile'])->name('profile.update');

    // Pedidos
    Route::get('/pedidos',                                          [TicketController::class, 'index'])->name('tickets.index');
    Route::get('/pedidos/novo',                                     [TicketController::class, 'create'])->name('tickets.create');
    Route::post('/pedidos',                                         [TicketController::class, 'store'])->name('tickets.store');
    Route::get('/pedidos/{ticket}',                                 [TicketController::class, 'show'])->name('tickets.show');
    Route::get('/pedidos/{ticket}/edit',                            [TicketController::class, 'edit'])->name('tickets.edit');
    Route::patch('/pedidos/{ticket}',                               [TicketController::class, 'update'])->name('tickets.update');
    Route::post('/pedidos/{ticket}/comentarios',                    [TicketController::class, 'addComment'])->name('tickets.comments.store');
    Route::post('/pedidos/{ticket}/encaminhar',                     [TicketController::class, 'route'])->name('tickets.route');
    Route::patch('/pedidos/{ticket}/equipas',                       [TicketController::class, 'updateTeams'])->name('tickets.teams.update');
    Route::patch('/pedidos/{ticket}/atribuir',                      [TicketController::class, 'assign'])->name('tickets.assign');
    Route::post('/pedidos/{ticket}/cancelar',                       [TicketController::class, 'cancel'])->name('tickets.cancel');
    Route::post('/pedidos/{ticket}/gerar-tarefa',                   [TicketController::class, 'createTask'])->name('tickets.task.create');
    Route::patch('/pedidos/{ticket}/contacto',                      [TicketController::class, 'updateContact'])->name('tickets.contact.update');
    Route::post('/pedidos/{ticket}/anexos',                         [TicketController::class, 'storeAttachment'])->name('tickets.attachments.store');
    Route::delete('/pedidos/{ticket}/anexos/{attachment}',          [TicketController::class, 'destroyAttachment'])->name('tickets.attachments.destroy');

    // Tarefas
    Route::get('/tarefas',                                          [TaskController::class, 'index'])->name('tasks.index');
    Route::get('/tarefas/nova',                                     [TaskController::class, 'create'])->name('tasks.create');
    Route::post('/tarefas',                                         [TaskController::class, 'store'])->name('tasks.store');
    Route::get('/tarefas/{task}',                                   [TaskController::class, 'show'])->name('tasks.show');
    Route::get('/tarefas/{task}/edit',                              [TaskController::class, 'edit'])->name('tasks.edit');
    Route::patch('/tarefas/{task}',                                 [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tarefas/{task}',                                [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::post('/tarefas/{task}/validar',                          [TaskController::class, 'approveTask'])->name('tasks.validate');
    Route::patch('/tarefas/{task}/atribuicao',                      [TaskController::class, 'updateAssignment'])->name('tasks.assignment.update');
    Route::post('/tarefas/{task}/materiais',                        [TaskController::class, 'addMaterial'])->name('tasks.materials.store');
    Route::post('/tarefas/{task}/checklist',                        [TaskController::class, 'storeChecklistItem'])->name('tasks.checklist.store');
    Route::patch('/tarefas/{task}/checklist/{item}/toggle',         [TaskController::class, 'toggleChecklistItem'])->name('tasks.checklist.toggle');
    Route::post('/tarefas/{task}/checklist/{item}/validar',         [TaskController::class, 'validateChecklistItem'])->name('tasks.checklist.validate');
    Route::delete('/tarefas/{task}/checklist/{item}',               [TaskController::class, 'destroyChecklistItem'])->name('tasks.checklist.destroy');
    Route::patch('/tarefas/{task}/checklist/{item}',                [TaskController::class, 'updateChecklistItem'])->name('tasks.checklist.update');

    // Equipas
    Route::get('/equipas',                                          [TeamController::class, 'index'])->name('teams.index');
    Route::post('/equipas',                                         [TeamController::class, 'store'])->name('teams.store');
    Route::get('/equipas/{team}',                                   [TeamController::class, 'show'])->name('teams.show');
    Route::patch('/equipas/{team}',                                 [TeamController::class, 'update'])->name('teams.update');
    Route::delete('/equipas/{team}',                                [TeamController::class, 'destroy'])->name('teams.destroy');
    Route::post('/equipas/{team}/membros',                          [TeamController::class, 'addMember'])->name('teams.members.add');
    Route::delete('/equipas/{team}/membros',                        [TeamController::class, 'removeMember'])->name('teams.members.remove');

    // Manutenções
    Route::get('/manutencoes',                                      [MaintenanceController::class, 'index'])->name('maintenances.index');
    Route::post('/manutencoes',                                     [MaintenanceController::class, 'store'])->name('maintenances.store');
    Route::get('/manutencoes/{maintenance}',                        [MaintenanceController::class, 'show'])->name('maintenances.show');
    Route::patch('/manutencoes/{maintenance}',                      [MaintenanceController::class, 'update'])->name('maintenances.update');
    Route::delete('/manutencoes/{maintenance}',                     [MaintenanceController::class, 'destroy'])->name('maintenances.destroy');

    // Munícipes / Entidades
    // Pessoas (pessoas naturais: munícipes, funcionários, constituintes, etc.)
    Route::get('/pessoas',                                          [PersonController::class, 'index'])->name('pessoas.index');
    Route::post('/pessoas',                                         [PersonController::class, 'store'])->name('pessoas.store');
    Route::get('/pessoas/{contact}',                                [PersonController::class, 'show'])->name('pessoas.show');
    Route::patch('/pessoas/{contact}',                              [PersonController::class, 'update'])->name('pessoas.update');
    Route::delete('/pessoas/{contact}',                             [PersonController::class, 'destroy'])->name('pessoas.destroy');
    // Foto de perfil
    Route::post('/pessoas/{contact}/avatar',                        [PersonController::class, 'uploadAvatar'])->name('pessoas.avatar');
    // Conta de acesso da pessoa
    Route::post('/pessoas/{contact}/criar-conta',                   [PersonController::class, 'createUserAccount'])->name('pessoas.criar-conta');
    Route::patch('/pessoas/{contact}/acesso',                       [PersonController::class, 'updateUserAccount'])->name('pessoas.update-acesso');
    Route::delete('/pessoas/{contact}/remover-conta',               [PersonController::class, 'unlinkUser'])->name('pessoas.remover-conta');
    // Registos RH (ausências, férias, licenças)
    Route::post('/pessoas/{contact}/ausencias',                     [PersonController::class, 'storeAbsence'])->name('pessoas.ausencias.store');
    Route::patch('/pessoas/{contact}/ausencias/{absence}',          [PersonController::class, 'updateAbsence'])->name('pessoas.ausencias.update');
    Route::delete('/pessoas/{contact}/ausencias/{absence}',         [PersonController::class, 'destroyAbsence'])->name('pessoas.ausencias.destroy');
    // Aprovação rápida (via sino) — admin e executivo
    Route::patch('/ausencias/{absence}/aprovar',                    [PersonController::class, 'approveAbsence'])->name('ausencias.aprovar');
    Route::patch('/ausencias/{absence}/rejeitar',                   [PersonController::class, 'rejectAbsence'])->name('ausencias.rejeitar');

    // Entidades (organizações: fornecedores, instituições, parceiros, etc.)
    Route::get('/entidades',                                        [EntityController::class, 'index'])->name('entidades.index');
    Route::post('/entidades',                                       [EntityController::class, 'store'])->name('entidades.store');
    Route::get('/entidades/{contact}',                              [EntityController::class, 'show'])->name('entidades.show');
    Route::patch('/entidades/{contact}',                            [EntityController::class, 'update'])->name('entidades.update');
    Route::delete('/entidades/{contact}',                           [EntityController::class, 'destroy'])->name('entidades.destroy');
    Route::post('/entidades/{contact}/avatar',                      [EntityController::class, 'uploadAvatar'])->name('entidades.avatar');

    // Munícipes (alias legado — mantido para links existentes em Pedidos, etc.)
    Route::get('/municipes',                                        [ContactController::class, 'index'])->name('contacts.index');
    Route::get('/municipes/novo',                                   [ContactController::class, 'create'])->name('contacts.create');
    Route::post('/municipes',                                       [ContactController::class, 'store'])->name('contacts.store');
    Route::get('/municipes/{contact}',                              [ContactController::class, 'show'])->name('contacts.show');
    Route::get('/municipes/{contact}/edit',                         [ContactController::class, 'edit'])->name('contacts.edit');
    Route::patch('/municipes/{contact}',                            [ContactController::class, 'update'])->name('contacts.update');
    Route::delete('/municipes/{contact}',                           [ContactController::class, 'destroy'])->name('contacts.destroy');

    // Agenda
    Route::get('/agenda',                                           [EventController::class, 'index'])->name('events.index');
    Route::post('/agenda',                                          [EventController::class, 'store'])->name('events.store');
    Route::get('/agenda/{event}',                                   [EventController::class, 'show'])->name('events.show');
    Route::patch('/agenda/{event}',                                 [EventController::class, 'update'])->name('events.update');
    Route::delete('/agenda/{event}',                                [EventController::class, 'destroy'])->name('events.destroy');
    Route::post('/agenda/{event}/participantes',                    [EventController::class, 'storeParticipant'])->name('events.participants.store');
    Route::patch('/agenda/{event}/participantes/{participant}',     [EventController::class, 'updateParticipant'])->name('events.participants.update');
    Route::delete('/agenda/{event}/participantes/{participant}',    [EventController::class, 'destroyParticipant'])->name('events.participants.destroy');

    // Reservas
    Route::get('/reservas',                                         [ReservationController::class, 'index'])->name('reservations.index');
    Route::get('/reservas/nova',                                    [ReservationController::class, 'create'])->name('reservations.create');
    Route::post('/reservas',                                        [ReservationController::class, 'store'])->name('reservations.store');
    Route::get('/reservas/{reservation}',                           [ReservationController::class, 'show'])->name('reservations.show');
    Route::post('/reservas/{reservation}/aprovar',                  [ReservationController::class, 'approve'])->name('reservations.approve');
    Route::post('/reservas/{reservation}/rejeitar',                 [ReservationController::class, 'reject'])->name('reservations.reject');
    Route::post('/reservas/{reservation}/escalar',                  [ReservationController::class, 'escalate'])->name('reservations.escalate');
    Route::delete('/reservas/{reservation}',                        [ReservationController::class, 'destroy'])->name('reservations.destroy');

    // Espaços (vista pública)
    Route::get('/espacos',                                          [SpaceController::class, 'index'])->name('spaces.index');

    // Espaços (gestão em Configurações)
    Route::get('/configuracoes/espacos',                            [SpaceController::class, 'settingsIndex'])->name('settings.spaces');
    Route::post('/configuracoes/espacos',                           [SpaceController::class, 'store'])->name('spaces.store');
    Route::patch('/configuracoes/espacos/{space}',                  [SpaceController::class, 'update'])->name('spaces.update');
    Route::delete('/configuracoes/espacos/{space}',                 [SpaceController::class, 'destroy'])->name('spaces.destroy');

    // Documentos
    Route::get('/documentos',                                       [DocumentController::class, 'index'])->name('documents.index');
    Route::post('/documentos',                                      [DocumentController::class, 'store'])->name('documents.store');
    Route::get('/documentos/{document}',                            [DocumentController::class, 'show'])->name('documents.show');
    Route::post('/documentos/{document}',                           [DocumentController::class, 'update'])->name('documents.update');
    Route::get('/documentos/{document}/download',                   [DocumentController::class, 'download'])->name('documents.download');
    Route::post('/documentos/{document}/aprovar',                   [DocumentController::class, 'approve'])->name('documents.approve');
    Route::post('/documentos/{document}/desaprovar',                [DocumentController::class, 'unapprove'])->name('documents.unapprove');
    Route::post('/documentos/{document}/solicitar-aprovacao',       [DocumentController::class, 'requestApproval'])->name('documents.request-approval');
    Route::delete('/documentos/{document}',                         [DocumentController::class, 'destroy'])->name('documents.destroy');

    // Atas
    Route::get('/atas',                                             [DocumentController::class, 'atasIndex'])->name('atas.index');
    Route::post('/atas',                                            [DocumentController::class, 'atasStore'])->name('atas.store');
    Route::get('/atas/{document}',                                  [DocumentController::class, 'atasShow'])->name('atas.show');
    Route::patch('/atas/{document}',                                [DocumentController::class, 'atasUpdate'])->name('atas.update');
    Route::delete('/atas/{document}',                               [DocumentController::class, 'destroy'])->name('atas.destroy');

    // Recursos Humanos
    Route::get('/rh',                                               [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/rh/novo',                                          [EmployeeController::class, 'create'])->name('employees.create');
    Route::post('/rh',                                              [EmployeeController::class, 'store'])->name('employees.store');
    Route::get('/rh/{employee}',                                    [EmployeeController::class, 'show'])->name('employees.show');
    Route::get('/rh/{employee}/edit',                               [EmployeeController::class, 'edit'])->name('employees.edit');
    Route::patch('/rh/{employee}',                                  [EmployeeController::class, 'update'])->name('employees.update');
    Route::post('/rh/{employee}/ausencias',                         [EmployeeController::class, 'storeAbsence'])->name('employees.absences.store');

    // Recursos Materiais (Inventário)
    // ── Recursos / Inventário ──────────────────────────────────────────────────
    Route::get('/inventario',                                              [InventoryController::class, 'index'])->name('inventory.index');
    Route::get('/inventario/stock',                                        [InventoryController::class, 'stock'])->name('inventory.stock');
    Route::get('/inventario/emprestimos',                                  [InventoryController::class, 'loans'])->name('inventory.loans');
    Route::get('/inventario/requisicoes',                                  [InventoryController::class, 'requisitions'])->name('inventory.requisitions');
    // Catálogo CRUD
    Route::post('/inventario',                                             [InventoryController::class, 'store'])->name('inventory.store');
    Route::patch('/inventario/{item}',                                     [InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('/inventario/{item}',                                    [InventoryController::class, 'destroy'])->name('inventory.destroy');
    Route::post('/inventario/categorias',                                  [InventoryController::class, 'storeCategory'])->name('inventory.categories.store');
    // Movimentos de stock
    Route::post('/inventario/{item}/movimentos',                           [InventoryController::class, 'addMovement'])->name('inventory.movements.store');
    // Empréstimos
    Route::post('/inventario/emprestimos',                                 [InventoryController::class, 'storeLoan'])->name('inventory.loans.store');
    Route::patch('/inventario/emprestimos/{loan}/devolver',                [InventoryController::class, 'returnLoan'])->name('inventory.loans.return');
    // Requisições
    Route::post('/inventario/requisicoes',                                 [InventoryController::class, 'storeRequisition'])->name('inventory.requisitions.store');
    Route::patch('/inventario/requisicoes/{req}/aprovar',                  [InventoryController::class, 'approveRequisition'])->name('inventory.requisitions.approve');
    Route::patch('/inventario/requisicoes/{req}/rejeitar',                 [InventoryController::class, 'rejectRequisition'])->name('inventory.requisitions.reject');
    Route::patch('/inventario/requisicoes/{req}/entregar',                 [InventoryController::class, 'deliverRequisition'])->name('inventory.requisitions.deliver');
    // Compat legado
    Route::post('/inventario/{item}/alocar',                               [InventoryController::class, 'allocate'])->name('inventory.allocate');
    Route::get('/inventario/alocacoes',                                    [InventoryController::class, 'allocations'])->name('inventory.allocations');
    Route::patch('/alocacoes/{allocation}/devolver',                [InventoryController::class, 'returnAllocation'])->name('allocations.return');

    // ── Chat ──────────────────────────────────────────────────────────────────
    Route::get('/chat',                                                        [ConversationController::class, 'index'])->name('chat.index');
    Route::get('/chat/{conversation}',                                         [ConversationController::class, 'show'])->name('chat.show');
    Route::post('/chat',                                                       [ConversationController::class, 'store'])->name('chat.store');
    Route::patch('/chat/{conversation}',                                       [ConversationController::class, 'update'])->name('chat.update');
    Route::delete('/chat/{conversation}',                                      [ConversationController::class, 'destroy'])->name('chat.destroy');
    Route::post('/chat/{conversation}/mensagens',                              [ConversationController::class, 'sendMessage'])->name('chat.messages.store');
    Route::post('/chat/{conversation}/messages',                               [ConversationController::class, 'sendMessage']);
    Route::delete('/chat/{conversation}/messages/{message}',                   [ConversationController::class, 'destroyMessage']);
    Route::post('/chat/{conversation}/messages/{message}/task',                [ConversationController::class, 'messageToTask']);
    Route::post('/chat/{conversation}/messages/{message}/ticket',              [ConversationController::class, 'messageToTicket']);
    Route::get('/chat/{conversation}/poll',                                    [ConversationController::class, 'poll'])->name('chat.poll');
    Route::delete('/chat/{conversation}/mensagens/{message}',                  [ConversationController::class, 'destroyMessage'])->name('chat.messages.destroy');
    Route::post('/chat/{conversation}/mensagens/{message}/tarefa',             [ConversationController::class, 'messageToTask'])->name('chat.messages.task');
    Route::post('/chat/{conversation}/mensagens/{message}/pedido',             [ConversationController::class, 'messageToTicket'])->name('chat.messages.ticket');
    Route::post('/chat/push/subscribe',                                        [ConversationController::class, 'subscribePush'])->name('chat.push.subscribe');
    Route::get('/chat/global/unread',                                          [ConversationController::class, 'globalUnread'])->name('chat.unread');
    Route::get('/debug/push-status',                                           function () {
        $user = auth()->user();
        if (!$user) return response()->json(['error' => 'not logged in']);

        // Conversas onde este user é participante e quem mais está nelas
        $convs = \App\Models\ConversationParticipant::where('user_id', $user->id)
            ->with('conversation.participants')
            ->get()
            ->map(fn($cp) => [
                'conv_id'      => $cp->conversation_id,
                'participants' => $cp->conversation?->participants->map(fn($u) => ['id' => $u->id, 'name' => $u->name]),
                'other_users_with_subs' => $cp->conversation?->participants
                    ->where('id', '!=', $user->id)
                    ->map(fn($u) => [
                        'id'        => $u->id,
                        'name'      => $u->name,
                        'push_subs' => \App\Models\PushSubscription::where('user_id', $u->id)->count(),
                    ]),
            ]);

        return response()->json([
            'user_id'     => $user->id,
            'user_name'   => $user->name,
            'push_subs'   => \App\Models\PushSubscription::where('user_id', $user->id)->count(),
            'bell_unread' => \App\Models\NotificationRecipient::where('user_id', $user->id)->whereNull('read_at')->count(),
            'last_notifs' => \App\Models\NotificationRecipient::where('user_id', $user->id)
                ->latest()->limit(5)
                ->with('notification')
                ->get()
                ->map(fn($nr) => ['id' => $nr->id, 'title' => $nr->notification?->title, 'read_at' => $nr->read_at, 'created_at' => $nr->created_at]),
            'conversations' => $convs,
        ]);
    });
    // Limpar utilizadores seed: desactivar IDs 2,3,4,5 e migrar conversas
    // User 2 (Administrador) → migrar para quem estiver autenticado
    // User 5 (Ricardo duplicado) → migrar para user 1
    // Users 3,4 (Maria/João seed) → só desactivar
    Route::get('/debug/cleanup-seed-users',                                    function () {
        $DB = \Illuminate\Support\Facades\DB::class;
        $log = [];
        $currentId = auth()->id();

        try {
            // User 5 → user 1 (dois Ricardos, manter o 1 que é o do iPhone)
            foreach (['conversation_participants', 'messages', 'push_subscriptions', 'notification_recipients'] as $tbl) {
                $n = $DB::table($tbl)->where('user_id', 5)->update(['user_id' => 1]);
                if ($n) $log[] = "Migrado $n registo(s) de user#5→user#1 em $tbl";
            }
            $DB::table('users')->where('id', 5)->update(['is_active' => false]);
            $log[] = "Desactivado user#5 (Ricardo duplicado)";

            // User 2 (Administrador seed) → migrar para user actual ($currentId)
            if ($currentId !== 2) {
                foreach (['conversation_participants', 'messages', 'push_subscriptions', 'notification_recipients'] as $tbl) {
                    $n = $DB::table($tbl)->where('user_id', 2)->update(['user_id' => $currentId]);
                    if ($n) $log[] = "Migrado $n registo(s) de user#2→user#$currentId em $tbl";
                }
                $DB::table('users')->where('id', 2)->update(['is_active' => false]);
                $log[] = "Desactivado user#2 (Administrador seed) → conversas migradas para user#$currentId";
            }

            // Users 3 e 4 → desactivar sem migrar (não têm conversas reais)
            $DB::table('users')->whereIn('id', [3, 4])->update(['is_active' => false]);
            $log[] = "Desactivados users#3 e #4 (seed Maria/João sem conversas)";

            $after = $DB::table('users')->orderBy('id')
                ->get(['id', 'name', 'email', 'role', 'is_active']);
            return response()->json(['ok' => true, 'actions' => $log, 'users' => $after]);

        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage(), 'actions' => $log], 500);
        }
    });
    Route::get('/debug/fix-users',                                             function () {
        $log = [];
        $currentId = auth()->id();
        $DB = \Illuminate\Support\Facades\DB::class;

        try {
            // PASSO 1: ligar users sem contact_id ao contacto com o mesmo email
            $orphans = $DB::table('users')->whereNull('contact_id')->get();
            foreach ($orphans as $u) {
                $contact = $DB::table('contacts')->where('email', $u->email)->first();
                if ($contact) {
                    $DB::table('users')->where('id', $u->id)->update(['contact_id' => $contact->id]);
                    $log[] = "✓ user#{$u->id} ({$u->email}) → contact#{$contact->id}";
                } else {
                    // Criar contacto mínimo
                    $cid = $DB::table('contacts')->insertGetId([
                        'organization_id' => 1,
                        'name'            => $u->name,
                        'email'           => $u->email,
                        'created_at'      => now(),
                        'updated_at'      => now(),
                    ]);
                    $DB::table('users')->where('id', $u->id)->update(['contact_id' => $cid]);
                    $log[] = "✓ criado contact#{$cid} para user#{$u->id} ({$u->name})";
                }
            }

            // PASSO 2: detectar contact_id duplicados → manter o user actual ou o de menor id
            $dupes = $DB::select("
                SELECT contact_id, MIN(id) as keep_id, COUNT(*) as cnt
                FROM users
                WHERE contact_id IS NOT NULL AND is_active = true
                GROUP BY contact_id HAVING COUNT(*) > 1
            ");
            foreach ($dupes as $d) {
                // Se o user actual tem este contact_id, é ele que fica
                $keepId = $DB::table('users')
                    ->where('contact_id', $d->contact_id)
                    ->where('id', $currentId)->exists() ? $currentId : $d->keep_id;

                $toMerge = $DB::table('users')
                    ->where('contact_id', $d->contact_id)
                    ->where('id', '!=', $keepId)->pluck('id');

                foreach ($toMerge as $uid) {
                    $uName = $DB::table('users')->where('id', $uid)->value('name');
                    $DB::table('conversation_participants')->where('user_id', $uid)->update(['user_id' => $keepId]);
                    $DB::table('messages')->where('user_id', $uid)->update(['user_id' => $keepId]);
                    $DB::table('push_subscriptions')->where('user_id', $uid)->update(['user_id' => $keepId]);
                    $DB::table('notification_recipients')->where('user_id', $uid)->update(['user_id' => $keepId]);
                    $DB::table('users')->where('id', $uid)->update(['is_active' => false, 'contact_id' => null]);
                    $log[] = "⚠ duplicado: user#{$uid} ({$uName}) → migrado para user#{$keepId} e desactivado";
                }
            }

            $after = $DB::table('users')->orderBy('id')
                ->get(['id', 'name', 'email', 'role', 'contact_id', 'is_active']);
            return response()->json(['ok' => true, 'actions' => $log, 'users' => $after]);

        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage(), 'actions_so_far' => $log], 500);
        }
    });
    Route::get('/debug/push-test',                                             function () {
        $user = auth()->user();
        if (!$user) return response()->json(['error' => 'not logged in']);

        $vapidPublicKey  = config('vapid.public_key');
        $vapidPrivateKey = config('vapid.private_key');

        if (!$vapidPublicKey || !$vapidPrivateKey) {
            return response()->json(['error' => 'VAPID keys not set', 'pub' => $vapidPublicKey ? 'ok' : 'MISSING', 'priv' => $vapidPrivateKey ? 'ok' : 'MISSING']);
        }

        $subs = \App\Models\PushSubscription::where('user_id', $user->id)->get();
        if ($subs->isEmpty()) {
            return response()->json(['error' => 'No push subscriptions for this user']);
        }

        $results = [];
        try {
            $webPush = new \Minishlink\WebPush\WebPush([
                'VAPID' => [
                    'subject'    => config('vapid.subject'),
                    'publicKey'  => $vapidPublicKey,
                    'privateKey' => $vapidPrivateKey,
                ],
            ]);

            foreach ($subs as $sub) {
                $webPush->queueNotification(
                    \Minishlink\WebPush\Subscription::create([
                        'endpoint' => $sub->endpoint,
                        'keys'     => ['p256dh' => $sub->p256dh_key, 'auth' => $sub->auth_key],
                    ]),
                    json_encode(['title' => 'Teste JuntaOS', 'body' => 'Push a funcionar!', 'url' => '/chat'])
                );
            }

            foreach ($webPush->flush() as $report) {
                $results[] = [
                    'endpoint' => substr((string) $report->getRequest()->getUri(), 0, 55),
                    'success'  => $report->isSuccess(),
                    'expired'  => $report->isSubscriptionExpired(),
                    'reason'   => $report->getReason(),
                ];
            }
        } catch (\Throwable $e) {
            return response()->json(['exception' => $e->getMessage(), 'trace' => substr($e->getTraceAsString(), 0, 500)]);
        }

        return response()->json(['subs_count' => $subs->count(), 'results' => $results]);
    });

    // Planeamento — sub-secções fixas (antes das rotas com {plan})
    Route::get('/planeamento/agenda',                               [OperationalPlanController::class, 'agenda'])->name('plans.agenda');
    Route::get('/planeamento/requisicoes',                          [OperationalPlanController::class, 'requisicoes'])->name('plans.requisicoes');

    // Planeamento — planos operacionais
    Route::get('/planeamento',                                      [OperationalPlanController::class, 'index'])->name('plans.index');
    Route::post('/planeamento',                                     [OperationalPlanController::class, 'store'])->name('plans.store');
    Route::get('/planeamento/{plan}',                               [OperationalPlanController::class, 'show'])->name('plans.show');
    Route::patch('/planeamento/{plan}',                             [OperationalPlanController::class, 'update'])->name('plans.update');
    Route::delete('/planeamento/{plan}',                            [OperationalPlanController::class, 'destroy'])->name('plans.destroy');

    // Relatórios
    Route::get('/relatorios',                                       [ReportController::class, 'index'])->name('reports.index');

    // Notificações
    Route::get('/notificacoes',                                     [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notificacoes/unread-count',                        [NotificationController::class, 'unreadCount'])->name('notifications.unreadCount');
    Route::get('/notificacoes/recentes',                            [NotificationController::class, 'recentes'])->name('notifications.recentes');
    Route::post('/notificacoes/marcar-todas',                       [NotificationController::class, 'markAllRead'])->name('notifications.readAll');
    Route::post('/notificacoes/{recipient}/lida',                   [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notificacoes/{recipient}/lida-json',              [NotificationController::class, 'markReadJson'])->name('notifications.readJson');

    // Configurações
    Route::get('/configuracoes',                                    [SettingsController::class, 'index'])->name('settings.index');
    Route::get('/configuracoes/utilizadores',                       [SettingsController::class, 'utilizadores'])->name('settings.utilizadores');
    Route::get('/configuracoes/perfis',                             [SettingsController::class, 'perfis'])->name('settings.perfis');
    Route::get('/configuracoes/permissoes',                         [SettingsController::class, 'permissoes'])->name('settings.permissoes');
    Route::get('/configuracoes/areas',                              [SettingsController::class, 'areas'])->name('settings.areas');
    Route::post('/configuracoes/areas',                             [SettingsController::class, 'storeArea'])->name('settings.areas.store');
    Route::patch('/configuracoes/areas/{area}',                     [SettingsController::class, 'updateArea'])->name('settings.areas.update');
    Route::delete('/configuracoes/areas/{area}',                    [SettingsController::class, 'destroyArea'])->name('settings.areas.destroy');
    Route::post('/configuracoes/instituicao',                       [SettingsController::class, 'updateInstitution'])->name('settings.institution.update');
    Route::delete('/configuracoes/instituicao/logo',                [SettingsController::class, 'removeLogo'])->name('settings.institution.logo.remove');
    Route::post('/configuracoes/permissoes',                        [SettingsController::class, 'updatePermissions'])->name('settings.permissions.update');
    // Gestão de perfis (roles)
    Route::post('/configuracoes/perfis/criar',                      [PermissionController::class, 'storeRole'])->name('roles.store');
    Route::patch('/configuracoes/perfis/{role}',                    [PermissionController::class, 'updateRole'])->name('roles.update');
    Route::delete('/configuracoes/perfis/{role}',                   [PermissionController::class, 'destroyRole'])->name('roles.destroy');
    // Acções (nível mínimo)
    Route::patch('/configuracoes/acoes/{action}',                   [PermissionController::class, 'updateAction'])->name('permission-actions.update');
    // Delegações ad-hoc
    Route::post('/configuracoes/delegacoes',                        [PermissionController::class, 'storeGrant'])->name('grants.store');
    Route::patch('/configuracoes/delegacoes/{grant}',               [PermissionController::class, 'updateGrant'])->name('grants.update');
    Route::delete('/configuracoes/delegacoes/{grant}',              [PermissionController::class, 'destroyGrant'])->name('grants.destroy');
    Route::post('/configuracoes/usuarios',                          [SettingsController::class, 'storeUser'])->name('settings.users.store');
    Route::patch('/configuracoes/usuarios/{user}',                  [SettingsController::class, 'updateUser'])->name('settings.users.update');
    Route::delete('/configuracoes/usuarios/{user}',                 [SettingsController::class, 'destroyUser'])->name('settings.users.destroy');

    // Configurações — Tipos de Pessoa
    Route::get('/configuracoes/tipos-pessoa',                       [PersonTypeController::class, 'index'])->name('person-types.index');
    Route::post('/configuracoes/tipos-pessoa',                      [PersonTypeController::class, 'store'])->name('person-types.store');
    Route::patch('/configuracoes/tipos-pessoa/{personType}',        [PersonTypeController::class, 'update'])->name('person-types.update');
    Route::delete('/configuracoes/tipos-pessoa/{personType}',       [PersonTypeController::class, 'destroy'])->name('person-types.destroy');
    // ── Chat ──────────────────────────────────────────────────────────────────
    Route::get('/chat',                                                      [ConversationController::class, 'index'])->name('chat.index');
    Route::post('/chat',                                                     [ConversationController::class, 'store'])->name('chat.store');
    Route::get('/chat/{conversation}',                                       [ConversationController::class, 'show'])->name('chat.show');
    Route::patch('/chat/{conversation}',                                     [ConversationController::class, 'update'])->name('chat.update');
    Route::delete('/chat/{conversation}',                                    [ConversationController::class, 'destroy'])->name('chat.destroy');
    Route::post('/chat/{conversation}/messages',                             [ConversationController::class, 'sendMessage'])->name('chat.message.send');
    Route::get('/chat/{conversation}/poll',                                  [ConversationController::class, 'poll'])->name('chat.poll');
    Route::delete('/chat/{conversation}/messages/{message}',                 [ConversationController::class, 'destroyMessage'])->name('chat.message.destroy');
    Route::post('/chat/{conversation}/messages/{message}/task',              [ConversationController::class, 'messageToTask'])->name('chat.message.task');
    Route::post('/chat/{conversation}/messages/{message}/ticket',            [ConversationController::class, 'messageToTicket'])->name('chat.message.ticket');
    Route::post('/chat/push/subscribe',                                      [ConversationController::class, 'subscribePush'])->name('chat.push.subscribe');


});

Route::fallback(fn() => Inertia::render('404'));
