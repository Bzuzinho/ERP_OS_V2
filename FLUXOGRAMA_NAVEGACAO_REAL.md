# FLUXOGRAMA DE NAVEGAÇÃO - Junta Operacional

## 📊 ESTRUTURA REAL DA APLICAÇÃO

### ✅ IMPLEMENTADO ATUALMENTE

#### 1. LOGIN / AUTENTICAÇÃO
```
User não autenticado
         ↓
    [GET /]
         ↓
  Middleware: auth:sanctum
         ↓
   SIM → DashboardController::index()
         ↓
   [Inertia::render('Dashboard')]
         ↓
   Dashboard carregado
```

#### 2. DASHBOARD (HOMEPAGE)
```
GET /dashboard
         ↓
DashboardController::index()
         ↓
Busca stats:
  - totalTasks (COUNT all tasks)
  - completedTasks (COUNT WHERE status='completed')
  - inProgressTasks (COUNT WHERE status='in_progress')
  - pendingTasks (COUNT WHERE status='pending')
         ↓
Retorna: Dashboard.tsx
         ↓
Renderiza:
  ├─ 4 Cards com stats
  │  ├─ 📋 Total de Tarefas
  │  ├─ ✓ Concluídas
  │  ├─ ⏳ Em Progresso
  │  └─ ⚠️ Pendentes
  └─ Mensagem bem-vindo
```

#### 3. NAVEGAÇÃO PRINCIPAL
```
Navigation.tsx (em MainLayout.tsx)
         ↓
Menu disponível:
  ├─ Dashboard [Link /]
  │   └─ Vai para Dashboard
  ├─ Tarefas [Link /tarefas]
  │   └─ Vai para Tasks/Index.tsx (EM DESENVOLVIMENTO)
  ├─ Pedidos [Link /pedidos]
  │   └─ Vai para Orders/Index.tsx (EM DESENVOLVIMENTO)
  └─ Configurações [Link /settings]
      └─ Vai para Settings/Index.tsx (EM DESENVOLVIMENTO)
```

---

## 🔄 FLUXO DE TAREFAS (PLANEJADO)

### CREATE TAREFA
```
[Tarefas Page]
        ↓
  [Click + Button]
        ↓
GET /tarefas/create
        ↓
TaskController::create()
        ↓
Inertia::render('Tasks/Create')
        ↓
   Formulário:
   ├─ Title (required|string|max:255)
   ├─ Description (nullable|string)
   ├─ Status (required|in:pending,in_progress,completed,cancelled)
   ├─ Priority (required|in:low,medium,high)
   ├─ Assigned To (nullable|exists:users,id)
   ├─ Due Date (nullable|date)
   └─ [Submit Button]
        ↓
POST /tarefas
        ↓
TaskController::store()
        ↓
Validar input
        ↓
DB: Task::create($validated)
        ↓
Redirect /tarefas (com mensagem sucesso)
        ↓
Tarefa criada ✓
```

### READ TAREFAS (LISTA)
```
GET /tarefas
        ↓
TaskController::index()
        ↓
$tasks = Task::with('assignee')
          ->orderBy('due_date')
          ->paginate(15)
        ↓
Inertia::render('Tasks/Index', [
  'tasks' => $tasks
])
        ↓
Mostra lista com:
├─ Todas as tarefas
├─ Ordenadas por due_date
└─ Paginadas (15 por página)
```

### READ TAREFA (DETALHE)
```
[Click em Task Card]
        ↓
GET /tarefas/{id}
        ↓
TaskController::show(Task $task)
        ↓
$task = Task::load('assignee')
        ↓
Inertia::render('Tasks/Show', [
  'task' => $task
])
        ↓
Mostra detalhes completos:
├─ Title
├─ Description
├─ Status
├─ Priority
├─ Assigned To (User)
└─ Due Date
```

### UPDATE TAREFA
```
[Click Edit Button]
        ↓
GET /tarefas/{id}/edit
        ↓
TaskController::edit(Task $task)
        ↓
Inertia::render('Tasks/Edit', [
  'task' => $task
])
        ↓
   Formulário (pre-filled):
   ├─ Title
   ├─ Description
   ├─ Status dropdown
   ├─ Priority dropdown
   ├─ Assigned To select
   ├─ Due Date picker
   └─ [Update Button]
        ↓
PUT/PATCH /tarefas/{id}
        ↓
TaskController::update(Request $request, Task $task)
        ↓
Validar input
        ↓
DB: $task->update($validated)
        ↓
Redirect /tarefas (com mensagem sucesso)
        ↓
Tarefa atualizada ✓
```

### DELETE TAREFA
```
[Click Delete Button]
        ↓
Confirmação: "Tem certeza?"
        ↓
DELETE /tarefas/{id}
        ↓
TaskController::destroy(Task $task)
        ↓
DB: $task->delete()
        ↓
Redirect /tarefas (com mensagem sucesso)
        ↓
Tarefa deletada ✓
```

---

## 📋 ESTADOS DE TAREFA

```
Task Status Flow:
        ↓
    pending ←───────┐
        ↓            │
  in_progress ←─────┤ (pode voltar)
        ↓            │
   completed ←──────┘
        
    cancelled (pode ir de qualquer estado)
        
Validação no Backend:
└─ status: required|in:pending,in_progress,completed,cancelled
```

---

## 📊 CAMPOS DA TAREFA (TASK MODEL)

```
Tabela: tasks

├─ id (PK)
├─ title (string|required)
├─ description (text|nullable)
├─ status (enum|required) = [pending, in_progress, completed, cancelled]
├─ priority (enum|required) = [low, medium, high]
├─ assigned_to (FK|nullable → users.id)
├─ due_date (date|nullable)
├─ created_at
└─ updated_at
```

---

## 📡 RELACIONAMENTOS

```
User (1) ──→ (N) Task
           └─ assigned_to (FK)

Task Model:
└─ public function assignee()
   └─ belongs_to(User::class, 'assigned_to')
```

---

## 🚧 EM DESENVOLVIMENTO

| Página | Rota | Status | Implementado |
|--------|------|--------|--------------|
| Tarefas | /tarefas | Em Dev | Skeleton page |
| Pedidos | /pedidos | Em Dev | Skeleton page |
| Configurações | /settings | Em Dev | Skeleton page |
| Eventos | /eventos | ❌ | Não existe |
| Inventário | /inventario | ❌ | Não existe |
| Pessoal | /pessoal | ❌ | Não existe |
| Espaços | /espacos | ❌ | Não existe |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO NECESSÁRIA

### ROTAS
- [ ] GET /tarefas → TaskController@index
- [ ] GET /tarefas/create → TaskController@create
- [ ] POST /tarefas → TaskController@store
- [ ] GET /tarefas/{id} → TaskController@show
- [ ] GET /tarefas/{id}/edit → TaskController@edit
- [ ] PUT /tarefas/{id} → TaskController@update
- [ ] DELETE /tarefas/{id} → TaskController@destroy
- [ ] Rotas para Pedidos (Ocorrências)
- [ ] Rotas para Eventos
- [ ] Rotas para Inventário
- [ ] Rotas para Pessoal
- [ ] Rotas para Espaços

### PÁGINAS FRONTEND
- [ ] Tasks/Index.tsx (implementar listagem real)
- [ ] Tasks/Create.tsx (implementar formulário)
- [ ] Tasks/Edit.tsx (implementar edição)
- [ ] Tasks/Show.tsx (implementar detalhe)
- [ ] Orders/Index.tsx
- [ ] Events/Index.tsx
- [ ] Inventory/Index.tsx
- [ ] Personnel/Index.tsx
- [ ] Spaces/Index.tsx

### DATABASE
- [ ] Migrations para: requests, events, inventory, employees, spaces, notifications
- [ ] Models para todas as tabelas
- [ ] Relationships entre models

### VALIDAÇÕES
- [ ] Form validation (frontend)
- [ ] Request validation (backend)
- [ ] Permission checks (Spatie)

### FUNCIONALIDADES
- [ ] Estado-based workflows (Task Status Flow)
- [ ] Auto-generate reference numbers (OC-001, PD-002, etc.)
- [ ] Role-based permissions (Admin vs Worker)
- [ ] Notifications system
- [ ] Stock alerts (Inventário)
