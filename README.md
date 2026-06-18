# 🏛️ Junta Operacional

Sistema de Gestão Operacional para Juntas de Freguesia, desenvolvido com Laravel, Inertia.js e React.

## 🚀 Stack Tecnológico

- **Backend**: Laravel 11
- **Frontend**: React 18 + TypeScript
- **UI**: Tailwind CSS
- **Integração**: Inertia.js
- **Permissões**: Spatie Permission
- **Database**: SQLite (desenvolvimento)
- **Build Tool**: Vite

## 📋 Pré-requisitos

- PHP 8.1 ou superior
- Composer
- Node.js 18+
- npm ou yarn

## 🔧 Instalação e Setup

### 1. Clonar ou Acessar o Repositório

```bash
cd C:\projetos\ERP_OS_V2\ERP_OS_V2
```

### 2. Instalar Dependências PHP

```bash
composer install
```

### 3. Instalar Dependências JavaScript

```bash
npm install
```

### 4. Configurar Arquivo .env

```bash
# Copiar arquivo de exemplo
copy .env.example .env

# Gerar chave da aplicação
php artisan key:generate
```

### 5. Criar e Popolar Banco de Dados

```bash
# Criar migrações
php artisan migrate

# Seed com dados de demonstração
php artisan db:seed
```

## 🎯 Executar Aplicação

### Terminal 1: Backend (Laravel)

```bash
php artisan serve
```

A aplicação estará disponível em `http://localhost:8000`

### Terminal 2: Frontend (Vite)

```bash
npm run dev
```

Vite estará rodando em `http://localhost:5173`

## 📱 Credenciais de Acesso (Demo)

| Usuário | Email | Senha |
|---------|-------|-------|
| Admin | admin@junta.local | password |
| João Silva | joao@junta.local | password |
| Maria Santos | maria@junta.local | password |
| Pedro Oliveira | pedro@junta.local | password |
| Ana Costa | ana@junta.local | password |

## 📂 Estrutura do Projeto

```
junta-operacional/
├── app/
│   ├── Http/Controllers/        # Controllers
│   ├── Models/                  # Modelos Eloquent
│   └── ...
├── database/
│   ├── migrations/              # Migrações de banco de dados
│   ├── seeders/                 # Seeders para dados demo
│   └── junta.sqlite             # Banco SQLite (auto-criado)
├── resources/
│   ├── css/                     # Estilos (Tailwind)
│   └── js/
│       ├── Pages/               # Páginas React (Inertia)
│       ├── Components/          # Componentes React
│       ├── Layouts/             # Layouts
│       └── app.tsx              # Entrada do app
├── routes/
│   └── web.php                  # Rotas web
├── vite.config.ts               # Configuração do Vite
├── tailwind.config.js           # Configuração do Tailwind
├── tsconfig.json                # Configuração TypeScript
└── composer.json                # Dependências PHP

```

## 🛠️ Comandos Úteis

### Backend

```bash
# Executar servidor
php artisan serve

# Criar migração
php artisan make:migration nome_da_migracao

# Criar modelo
php artisan make:model NomeModelo

# Criar controller
php artisan make:controller NomeController

# Executar migrações
php artisan migrate

# Desfazer última migração
php artisan migrate:rollback

# Fresh migrations + seed
php artisan migrate:fresh --seed

# Acessar Tinker (REPL)
php artisan tinker
```

### Frontend

```bash
# Desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🔐 Permissões e Roles (Spatie Permission)

O sistema usa `spatie/laravel-permission` para controle de acesso. Você pode gerenciar roles e permissões através:

```bash
# No Tinker
php artisan tinker

# Criar role
$role = \Spatie\Permission\Models\Role::create(['name' => 'admin']);

# Atribuir permissão a role
$role->givePermissionTo('edit-tasks');

# Atribuir role a usuário
$user->assignRole('admin');
```

## 📝 Desenvolvimento

### Criar Nova Página

1. Criar componente em `resources/js/Pages/NomePagina.tsx`
2. Adicionar rota em `routes/web.php`
3. Criar controller se necessário

### Criar Novo Componente

Componentes React em `resources/js/Components/` são reutilizáveis em múltiplas páginas.

### Adicionar Estilos

- Estilos globais: `resources/css/app.css`
- Tailwind utilities estão disponíveis em todos os componentes

## 🐛 Troubleshooting

### Erro: "No application encryption key has been set"

```bash
php artisan key:generate
```

### Banco de dados não encontrado

```bash
php artisan migrate
php artisan db:seed
```

### Hot reload não funciona

- Verificar se `npm run dev` está rodando
- Limpar cache: `npm run build && php artisan view:clear`

## 📚 Recursos Úteis

- [Laravel Docs](https://laravel.com/docs)
- [Inertia.js](https://inertiajs.com/)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Spatie Permission](https://spatie.be/docs/laravel-permission)

## 📄 Licença

MIT License

## 👥 Contribuindo

Para contribuições, crie um branch, faça suas alterações e envie um pull request.

---

**Desenvolvido com ❤️ para Juntas de Freguesia**
