# 👨‍💻 Guia de Desenvolvimento - Junta Operacional

Este documento fornece diretrizes para desenvolver no projeto Junta Operacional.

## 📦 Estrutura de Pastas

```
app/
├── Http/
│   ├── Controllers/      # Controladores (lógica de negócio)
│   ├── Requests/         # Form Requests (validação)
│   └── Middleware/       # Middleware personalizado
├── Models/               # Modelos Eloquent
├── Policies/             # Policies de autorização
└── Services/             # Services (lógica reutilizável)

database/
├── migrations/           # Migrações de schema
├── seeders/              # Seeders (dados iniciais)
└── factories/            # Model Factories (testes)

resources/
├── css/                  # Estilos Tailwind
└── js/
    ├── Pages/            # Componentes de página (Inertia)
    ├── Components/       # Componentes reutilizáveis
    └── Layouts/          # Layouts de página

routes/
└── web.php               # Definição de rotas
```

## 🛠️ Criar Nova Funcionalidade

### 1️⃣ Criar Model

```bash
php artisan make:model NomeModelo -m
```

Isso cria:
- `app/Models/NomeModelo.php` - Modelo Eloquent
- `database/migrations/YYYY_MM_DD_HHMMSS_create_nome_modelos_table.php` - Migration

### 2️⃣ Criar Migration

```bash
php artisan make:migration create_nome_tabelas_table
```

Editar a migration em `database/migrations/`:

```php
Schema::create('nome_tabelas', function (Blueprint $table) {
    $table->id();
    $table->string('titulo');
    $table->text('descricao')->nullable();
    $table->enum('status', ['ativo', 'inativo'])->default('ativo');
    $table->timestamps();
});
```

### 3️⃣ Criar Controller

```bash
php artisan make:controller NomeController --resource
```

Isso cria um controlador com métodos CRUD:
- `index()` - Listar
- `create()` - Formulário de criar
- `store()` - Salvar novo
- `show()` - Ver detalhes
- `edit()` - Formulário de editar
- `update()` - Atualizar
- `destroy()` - Deletar

### 4️⃣ Registrar Rota

Em `routes/web.php`:

```php
Route::resource('nome', NomeController::class);
```

Isso cria automaticamente:
- GET `/nome` - index
- GET `/nome/create` - create
- POST `/nome` - store
- GET `/nome/{id}` - show
- GET `/nome/{id}/edit` - edit
- PUT/PATCH `/nome/{id}` - update
- DELETE `/nome/{id}` - destroy

### 5️⃣ Criar Página React

Em `resources/js/Pages/Nome/Index.tsx`:

```tsx
import React from 'react'
import { Head } from '@inertiajs/react'
import MainLayout from '@/Layouts/MainLayout'

interface NomeProps {
  items?: any[]
}

export default function Index({ items = [] }: NomeProps) {
  return (
    <MainLayout>
      <Head title="Nome" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Nome</h1>
          {/* Conteúdo aqui */}
        </div>
      </div>
    </MainLayout>
  )
}
```

### 6️⃣ Criar Componente Reutilizável

Em `resources/js/Components/Botao.tsx`:

```tsx
import React from 'react'
import clsx from 'clsx'

interface BotaoProps {
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export default function Botao({ 
  onClick, 
  children, 
  variant = 'primary' 
}: BotaoProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        {
          'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
          'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
        }
      )}
    >
      {children}
    </button>
  )
}
```

## 🎨 Padrões de Código

### TypeScript/React

```tsx
// ✅ Bom
interface UserProps {
  name: string
  email: string
  isActive: boolean
}

export default function User({ name, email, isActive }: UserProps) {
  return <div>{name}</div>
}

// ❌ Evitar
export default function User(props) {
  return <div>{props.name}</div>
}
```

### Laravel/PHP

```php
// ✅ Bom - Usar type hints
public function store(Request $request): Response
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
    ]);

    $item = Item::create($validated);
    return response()->json($item, 201);
}

// ❌ Evitar
public function store($request)
{
    $item = Item::create($request->all());
}
```

## 🔐 Autorização com Spatie Permission

### Criar Roles e Permissions

```bash
php artisan tinker
```

```php
// Criar roles
$admin = Role::create(['name' => 'admin']);
$user = Role::create(['name' => 'user']);

// Criar permissions
$editTasks = Permission::create(['name' => 'edit-tasks']);
$deleteTasks = Permission::create(['name' => 'delete-tasks']);

// Atribuir permissions a roles
$admin->givePermissionTo([$editTasks, $deleteTasks]);

// Atribuir role a usuário
$user = User::find(1);
$user->assignRole('admin');
```

### Usar em Controllers

```php
class TaskController extends Controller
{
    public function update(Request $request, Task $task)
    {
        // Verificar permissão
        if (!auth()->user()->can('edit-tasks')) {
            abort(403, 'Unauthorized');
        }

        $task->update($request->validated());
        return redirect()->back();
    }
}
```

### Usar em Views/Components

```tsx
// No componente React, receber permissões via props
interface TaskProps {
  task: Task
  canEdit: boolean
}

export default function Task({ task, canEdit }: TaskProps) {
  return (
    <div>
      {canEdit && (
        <button>Editar</button>
      )}
    </div>
  )
}
```

## 📝 Validação

### Form Request

```bash
php artisan make:request StoreTaskRequest
```

`app/Http/Requests/StoreTaskRequest.php`:

```php
public function rules(): array
{
    return [
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'status' => 'required|in:pending,completed',
    ];
}

public function authorize(): bool
{
    return true;
}
```

Use no controller:

```php
public function store(StoreTaskRequest $request)
{
    $validated = $request->validated();
    Task::create($validated);
}
```

## 🧪 Testes

```bash
# Criar teste
php artisan make:test TaskTest

# Rodar testes
php artisan test

# Com cobertura
php artisan test --coverage
```

## 🔄 Migrações

```bash
# Rodar migrações
php artisan migrate

# Desfazer última migração
php artisan migrate:rollback

# Desfazer todas
php artisan migrate:reset

# Fresh (reset + migrate + seed)
php artisan migrate:fresh --seed
```

## 📦 Seeders

Criar seeder:

```bash
php artisan make:seeder NomeSeeder
```

`database/seeders/NomeSeeder.php`:

```php
public function run(): void
{
    User::factory(10)->create();
    Task::factory(50)->create();
}
```

Executar:

```bash
php artisan db:seed
php artisan db:seed --class=NomeSeeder
```

## 🔍 Debugging

### Usando dd() (dump and die)

```php
dd($user);  // Para a execução e mostra o valor
```

### Usando Log

```php
use Illuminate\Support\Facades\Log;

Log::info('Informação', ['user_id' => $user->id]);
Log::error('Erro', ['exception' => $e]);
```

Ver logs:

```bash
tail -f storage/logs/laravel.log
```

## 🚀 Performance

### Lazy Loading (Problema)

```php
// ❌ Problema: N+1 query
$tasks = Task::all();
foreach ($tasks as $task) {
    echo $task->assignee->name; // Query por tarefa
}
```

### Eager Loading (Solução)

```php
// ✅ Solução: 2 queries
$tasks = Task::with('assignee')->get();
foreach ($tasks as $task) {
    echo $task->assignee->name; // Sem query adicional
}
```

## 📚 Recursos Úteis

- [Laravel Docs](https://laravel.com/docs)
- [Inertia.js Docs](https://inertiajs.com/)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Spatie Permission](https://spatie.be/docs/laravel-permission)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Bom desenvolvimento! 🚀
