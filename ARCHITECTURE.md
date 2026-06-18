# 🏗️ Arquitetura - Junta Operacional

Visão geral da arquitetura e padrões utilizados no projeto.

## 📊 Diagrama em Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Browser)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
         ┌───────────────┴──────────────┐
         ▼                              ▼
  ┌─────────────────┐          ┌──────────────────┐
  │  Vite (Dev)     │          │  Build (Prod)    │
  │  Port 5173      │          │  dist/           │
  └────────┬────────┘          └────────┬─────────┘
           │                            │
           └──────────────┬─────────────┘
                          │
           ┌──────────────┴──────────────┐
           ▼                             ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  React + TypeScript     │  JavaScript Build  │
    │  - Pages                │  - app.js (bundled)│
    │  - Components           │  - styles.css     │
    │  - Layouts              │                    │
    └──────────┬───────┘      └────────┬──────────┘
               │                       │
               └───────────┬───────────┘
                           │ API Calls
         ┌─────────────────▼─────────────────┐
         │  Laravel Backend (Port 8000)       │
         │  http://localhost:8000             │
         └──────────┬────────────┬────────────┘
                    │            │
        ┌───────────┼────────────┼───────────┐
        ▼           ▼            ▼           ▼
   ┌────────┐  ┌──────────┐  ┌────────┐  ┌─────┐
   │ Routes │  │Controllers│  │ Models │  │ Auth│
   └────┬───┘  └─────┬────┘  └───┬────┘  └──┬──┘
        │            │           │          │
        └────────────┴───────────┴──────────┘
                     │
              ┌──────▼──────┐
              │ Inertia.js  │ (Ponte React-Laravel)
              └──────┬──────┘
                     │
        ┌────────────▼────────────┐
        │   SQLite Database       │
        │ database/junta.sqlite   │
        └─────────────────────────┘
```

## 🎯 Stack Técnico

### Backend
- **Framework**: Laravel 11
- **Language**: PHP 8.1+
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **API Bridge**: Inertia.js
- **Auth**: Laravel Sanctum
- **Permissions**: Spatie Permission

### Frontend
- **Library**: React 18
- **Language**: TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **State**: Context API / Props
- **HTTP Client**: Axios

### DevTools
- **Package Manager**: npm
- **Version Control**: Git
- **IDE**: VSCode (recommended)
- **Database Viewer**: SQLite Browser

## 🔄 Fluxo de Requisição

### 1. User Action
```
User clicks button → React component handles click
```

### 2. Request to Backend
```
React component → Inertia.js → HTTP POST/GET → Laravel Route
```

### 3. Backend Processing
```
Route → Controller → Model → Database Query
```

### 4. Response
```
Database Result → Model → Controller → Inertia Response → React Props
```

### 5. UI Update
```
React re-renders with new props → User sees updated UI
```

## 📁 Organização de Código

### Controllers
**Local**: `app/Http/Controllers/`

Padrão RESTful:
```
DashboardController
├── index()        // GET  /dashboard
├── show()         // GET  /dashboard/{id}
└── ...

TaskController
├── index()        // GET  /tasks
├── create()       // GET  /tasks/create
├── store()        // POST /tasks
├── show()         // GET  /tasks/{id}
├── edit()         // GET  /tasks/{id}/edit
├── update()       // PUT  /tasks/{id}
└── destroy()      // DELETE /tasks/{id}
```

### Models
**Local**: `app/Models/`

```php
class Task extends Model {
    // Fillable attributes
    protected $fillable = ['title', 'status', ...];
    
    // Relationships
    public function assignee() { ... }
    
    // Accessors/Mutators
    protected function casts() { ... }
    
    // Scopes
    public function scopePending() { ... }
}
```

### Routes
**Local**: `routes/web.php`

```php
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::resource('tasks', TaskController::class);
```

### Migrations
**Local**: `database/migrations/`

```php
Schema::create('tasks', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->timestamps();
});
```

### React Pages
**Local**: `resources/js/Pages/`

```tsx
export default function Dashboard({ stats }) {
  return (
    <MainLayout>
      <Head title="Dashboard" />
      {/* Content */}
    </MainLayout>
  )
}
```

### React Components
**Local**: `resources/js/Components/`

```tsx
interface ButtonProps {
  onClick?: () => void
  children: React.ReactNode
}

export default function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
```

## 🔐 Autenticação e Autorização

### Autenticação
- Usa Laravel Sanctum (token-based)
- Session-based cookies para SPAs
- Login endpoint valida credenciais

### Autorização
- Spatie Permission (Roles e Permissions)
- Middleware customizado para verificação
- Policies para autorização granular

```php
// Em Controller
if (!auth()->user()->can('edit-tasks')) {
    abort(403);
}

// Em Blade/React
@can('edit-tasks')
  <button>Edit</button>
@endcan
```

## 💾 Banco de Dados

### Modelo Entidade-Relacionamento (MER)

```
Users (1) ──── (*) Tasks
  id              id
  name            title
  email           description
  password        status
  ...             assigned_to (FK)
                  due_date
                  ...

Roles & Permissions (Spatie)
  roles
    id
    name
  
  permissions
    id
    name
  
  role_has_permissions (pivot)
  model_has_roles (pivot)
  model_has_permissions (pivot)
```

### Tipos de Dados
- **id**: BigInteger (Auto-increment)
- **strings**: VARCHAR(255)
- **text**: TEXT (sem limite)
- **enum**: VARCHAR com constraint
- **timestamps**: created_at, updated_at
- **Foreign Keys**: Chaves estrangeiras com cascata

## 🚀 Performance

### Frontend
- Code splitting com Vite
- Lazy loading de componentes
- Caching de assets
- Minificação automática em produção

### Backend
- Eager loading com `.with()` (previne N+1 queries)
- Indexes em colunas frequently queried
- Caching com Redis
- Pagination para listas longas

### Database
- SQLite (dev) é rápido para desenvolvimento
- PostgreSQL (prod) para escalabilidade
- Índices em foreign keys e queries frequentes

## 📦 Deploy

### Produção
1. Compilar assets: `npm run build`
2. Instalar dependências: `composer install --no-dev`
3. Gerar key: `php artisan key:generate`
4. Migrar DB: `php artisan migrate --force`
5. Servir com Nginx/Apache

### Environment
- `.env` contém variáveis de configuração
- Diferentes valores para dev/staging/prod
- Nunca commitir `.env` (apenas `.env.example`)

## 🧪 Testes

### Unit Tests
```bash
php artisan make:test TaskTest --unit
```

### Feature Tests
```bash
php artisan make:test TaskFeatureTest
```

### Executar
```bash
php artisan test
php artisan test --filter=TaskTest
```

## 📚 Conceitos-Chave

### Inertia.js
Ponte entre Laravel e React:
- Controllers retornam `Inertia::render('Page', $data)`
- Dados ficam disponíveis como props em React
- Sem necessidade de API JSON separada

### Tailwind CSS
Utility-first CSS framework:
- Classes como `text-lg`, `bg-blue-500`, `hover:bg-blue-600`
- Rápido para prototipagem
- Purificação automática em produção

### TypeScript
Superset tipado de JavaScript:
- Interfaces para tipagem de props
- Compilado para JavaScript antes da execução
- Detecta erros em tempo de desenvolvimento

## 🔗 Fluxo de Desenvolvimento

```
1. Feature branch
   └─ git checkout -b feature/nova-funcionalidade

2. Código
   ├─ Criar migration
   ├─ Criar modelo
   ├─ Criar controller
   ├─ Criar rota
   ├─ Criar página React
   └─ Testar localmente

3. Commit
   └─ git commit -m "Add nova funcionalidade"

4. Push & Pull Request
   └─ git push origin feature/nova-funcionalidade

5. Merge
   └─ Feature integrada em main/master
```

---

Entender essa arquitetura facilita o desenvolvimento e manutenção do projeto! 🚀
