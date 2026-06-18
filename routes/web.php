<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
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
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Auth (público)
Route::get('/login',   [AuthController::class, 'showLogin'])->name('login');
Route::post('/login',  [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Rotas protegidas
Route::middleware('auth')->group(function () {

    // Dashboard
    Route::get('/',          [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Perfil do utilizador
    Route::get('/perfil',    [SettingsController::class, 'profile'])->name('profile');
    Route::patch('/perfil',  [SettingsController::class, 'updateProfile'])->name('profile.update');

    // Pedidos
    Route::get('/pedidos',                       [TicketController::class, 'index'])->name('tickets.index');
    Route::get('/pedidos/novo',                  [TicketController::class, 'create'])->name('tickets.create');
    Route::post('/pedidos',                      [TicketController::class, 'store'])->name('tickets.store');
    Route::get('/pedidos/{ticket}',              [TicketController::class, 'show'])->name('tickets.show');
    Route::patch('/pedidos/{ticket}',            [TicketController::class, 'update'])->name('tickets.update');
    Route::post('/pedidos/{ticket}/comentarios', [TicketController::class, 'addComment'])->name('tickets.comments.store');

    // Tarefas
    Route::get('/tarefas',                          [TaskController::class, 'index'])->name('tasks.index');
    Route::get('/tarefas/nova',                     [TaskController::class, 'create'])->name('tasks.create');
    Route::post('/tarefas',                         [TaskController::class, 'store'])->name('tasks.store');
    Route::get('/tarefas/{task}',                   [TaskController::class, 'show'])->name('tasks.show');
    Route::get('/tarefas/{task}/edit',              [TaskController::class, 'edit'])->name('tasks.edit');
    Route::patch('/tarefas/{task}',                 [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tarefas/{task}',                [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::post('/tarefas/{task}/validar',          [TaskController::class, 'approveTask'])->name('tasks.validate');
    Route::post('/tarefas/{task}/materiais',        [TaskController::class, 'addMaterial'])->name('tasks.materials.store');

    // Equipas
    Route::get('/equipas',                          [TeamController::class, 'index'])->name('teams.index');
    Route::post('/equipas',                         [TeamController::class, 'store'])->name('teams.store');
    Route::get('/equipas/{team}',                   [TeamController::class, 'show'])->name('teams.show');
    Route::patch('/equipas/{team}',                 [TeamController::class, 'update'])->name('teams.update');
    Route::delete('/equipas/{team}',                [TeamController::class, 'destroy'])->name('teams.destroy');
    Route::post('/equipas/{team}/membros',          [TeamController::class, 'addMember'])->name('teams.members.add');
    Route::delete('/equipas/{team}/membros',        [TeamController::class, 'removeMember'])->name('teams.members.remove');

    // Manutenções
    Route::get('/manutencoes',                      [MaintenanceController::class, 'index'])->name('maintenances.index');
    Route::post('/manutencoes',                     [MaintenanceController::class, 'store'])->name('maintenances.store');
    Route::get('/manutencoes/{maintenance}',        [MaintenanceController::class, 'show'])->name('maintenances.show');
    Route::patch('/manutencoes/{maintenance}',      [MaintenanceController::class, 'update'])->name('maintenances.update');
    Route::delete('/manutencoes/{maintenance}',     [MaintenanceController::class, 'destroy'])->name('maintenances.destroy');

    // Munícipes / Entidades
    Route::get('/municipes',             [ContactController::class, 'index'])->name('contacts.index');
    Route::get('/municipes/novo',        [ContactController::class, 'create'])->name('contacts.create');
    Route::post('/municipes',            [ContactController::class, 'store'])->name('contacts.store');
    Route::get('/municipes/{contact}',   [ContactController::class, 'show'])->name('contacts.show');
    Route::get('/municipes/{contact}/edit', [ContactController::class, 'edit'])->name('contacts.edit');
    Route::patch('/municipes/{contact}', [ContactController::class, 'update'])->name('contacts.update');
    Route::delete('/municipes/{contact}',[ContactController::class, 'destroy'])->name('contacts.destroy');

    // Agenda
    Route::get('/agenda',           [EventController::class, 'index'])->name('events.index');
    Route::post('/agenda',          [EventController::class, 'store'])->name('events.store');
    Route::patch('/agenda/{event}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/agenda/{event}',[EventController::class, 'destroy'])->name('events.destroy');

    // Reservas
    Route::get('/reservas',                        [ReservationController::class, 'index'])->name('reservations.index');
    Route::get('/reservas/nova',                   [ReservationController::class, 'create'])->name('reservations.create');
    Route::post('/reservas',                       [ReservationController::class, 'store'])->name('reservations.store');
    Route::post('/reservas/{reservation}/aprovar', [ReservationController::class, 'approve'])->name('reservations.approve');
    Route::post('/reservas/{reservation}/rejeitar',[ReservationController::class, 'reject'])->name('reservations.reject');

    // Espaços
    Route::get('/espacos',            [SpaceController::class, 'index'])->name('spaces.index');
    Route::post('/espacos',           [SpaceController::class, 'store'])->name('spaces.store');
    Route::patch('/espacos/{space}',  [SpaceController::class, 'update'])->name('spaces.update');
    Route::delete('/espacos/{space}', [SpaceController::class, 'destroy'])->name('spaces.destroy');

    // Documentos
    Route::get('/documentos',                      [DocumentController::class, 'index'])->name('documents.index');
    Route::post('/documentos',                     [DocumentController::class, 'store'])->name('documents.store');
    Route::post('/documentos/{document}/aprovar',  [DocumentController::class, 'approve'])->name('documents.approve');
    Route::delete('/documentos/{document}',        [DocumentController::class, 'destroy'])->name('documents.destroy');

    // Atas
    Route::get('/atas',                  [DocumentController::class, 'atasIndex'])->name('atas.index');
    Route::post('/atas',                 [DocumentController::class, 'atasStore'])->name('atas.store');
    Route::get('/atas/{document}',       [DocumentController::class, 'atasShow'])->name('atas.show');
    Route::patch('/atas/{document}',     [DocumentController::class, 'atasUpdate'])->name('atas.update');
    Route::delete('/atas/{document}',    [DocumentController::class, 'destroy'])->name('atas.destroy');

    // Recursos Humanos
    Route::get('/rh',                          [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/rh/novo',                     [EmployeeController::class, 'create'])->name('employees.create');
    Route::post('/rh',                         [EmployeeController::class, 'store'])->name('employees.store');
    Route::get('/rh/{employee}',               [EmployeeController::class, 'show'])->name('employees.show');
    Route::get('/rh/{employee}/edit',          [EmployeeController::class, 'edit'])->name('employees.edit');
    Route::patch('/rh/{employee}',             [EmployeeController::class, 'update'])->name('employees.update');
    Route::post('/rh/{employee}/ausencias',    [EmployeeController::class, 'storeAbsence'])->name('employees.absences.store');

    // Recursos Materiais (Inventário)
    Route::get('/inventario',                        [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventario',                       [InventoryController::class, 'store'])->name('inventory.store');
    Route::patch('/inventario/{item}',               [InventoryController::class, 'update'])->name('inventory.update');
    Route::post('/inventario/{item}/movimentos',     [InventoryController::class, 'addMovement'])->name('inventory.movements.store');
    Route::post('/inventario/{item}/alocar',         [InventoryController::class, 'allocate'])->name('inventory.allocate');
    Route::get('/inventario/alocacoes',              [InventoryController::class, 'allocations'])->name('inventory.allocations');
    Route::patch('/alocacoes/{allocation}/devolver', [InventoryController::class, 'returnAllocation'])->name('allocations.return');

    // Planeamento — sub-secções fixas (antes das rotas com {plan})
    Route::get('/planeamento/agenda',       [OperationalPlanController::class, 'agenda'])->name('plans.agenda');
    Route::get('/planeamento/requisicoes',  [OperationalPlanController::class, 'requisicoes'])->name('plans.requisicoes');
    Route::get('/planeamento/recursos',     [OperationalPlanController::class, 'recursos'])->name('plans.recursos');

    // Planeamento — planos operacionais
    Route::get('/planeamento',              [OperationalPlanController::class, 'index'])->name('plans.index');
    Route::post('/planeamento',             [OperationalPlanController::class, 'store'])->name('plans.store');
    Route::get('/planeamento/{plan}',       [OperationalPlanController::class, 'show'])->name('plans.show');
    Route::patch('/planeamento/{plan}',     [OperationalPlanController::class, 'update'])->name('plans.update');
    Route::delete('/planeamento/{plan}',    [OperationalPlanController::class, 'destroy'])->name('plans.destroy');

    // Relatórios
    Route::get('/relatorios', [ReportController::class, 'index'])->name('reports.index');

    // Notificações
    Route::get('/notificacoes',                    [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notificacoes/marcar-todas',      [NotificationController::class, 'markAllRead'])->name('notifications.readAll');
    Route::post('/notificacoes/{recipient}/lida',  [NotificationController::class, 'markRead'])->name('notifications.read');

    // Munícipes / Pessoas
    Route::get('/municipes',             [ContactController::class, 'index'])->name('contacts.index');
    Route::get('/municipes/novo',        [ContactController::class, 'create'])->name('contacts.create');
    Route::post('/municipes',            [ContactController::class, 'store'])->name('contacts.store');
    Route::get('/municipes/{contact}',   [ContactController::class, 'show'])->name('contacts.show');
    Route::get('/municipes/{contact}/edit', [ContactController::class, 'edit'])->name('contacts.edit');
    Route::patch('/municipes/{contact}', [ContactController::class, 'update'])->name('contacts.update');
    Route::delete('/municipes/{contact}',[ContactController::class, 'destroy'])->name('contacts.destroy');

    // Configurações
    Route::get('/configuracoes',          [SettingsController::class, 'index'])->name('settings.index');
    Route::get('/configuracoes/usuarios', [SettingsController::class, 'users'])->name('settings.users');
    Route::post('/configuracoes/usuarios',[SettingsController::class, 'storeUser'])->name('settings.users.store');
    Route::patch('/configuracoes/usuarios/{user}', [SettingsController::class, 'updateUser'])->name('settings.users.update');
    Route::delete('/configuracoes/usuarios/{user}',[SettingsController::class, 'destroyUser'])->name('settings.users.destroy');

    // Configurações — Tipos de Pessoa
    Route::get('/configuracoes/tipos-pessoa',           [PersonTypeController::class, 'index'])->name('person-types.index');
    Route::post('/configuracoes/tipos-pessoa',          [PersonTypeController::class, 'store'])->name('person-types.store');
    Route::patch('/configuracoes/tipos-pessoa/{personType}', [PersonTypeController::class, 'update'])->name('person-types.update');
    Route::delete('/configuracoes/tipos-pessoa/{personType}',[PersonTypeController::class, 'destroy'])->name('person-types.destroy');
});

Route::fallback(fn() => Inertia::render('404'));
