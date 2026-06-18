# 🎉 Bem-vindo ao Junta Operacional!

Sua aplicação **Laravel + React + TypeScript** está pronta para desenvolvimento!

## 📋 O que foi criado?

Você tem uma estrutura completa e profissional com:

✅ **Backend Laravel 11**
- Controllers CRUD exemplo
- Modelos Eloquent
- Migrações e Seeders
- Rotas RESTful
- Autenticação com Sanctum
- Permissões com Spatie Permission

✅ **Frontend React 18 + TypeScript**
- Componentes reutilizáveis
- Layout principal
- Páginas exemplo (Dashboard, Tasks, Orders, Settings)
- Inertia.js para comunicação com backend
- Tailwind CSS para estilos

✅ **Banco de Dados SQLite**
- 5 usuários demo
- 8 tarefas demo com diferentes status
- Tudo pronto para usar

✅ **Documentação Completa**
- QUICKSTART.md - Instalação em 3 minutos
- SETUP.md - Guia passo-a-passo
- DEVELOPMENT.md - Como desenvolver
- ARCHITECTURE.md - Visão geral da arquitetura

## 🚀 Começa Aqui

### Opção 1: Script Automático (Windows)
```bash
cd C:\projetos\ERP_OS_V2\ERP_OS_V2
INSTALL.bat
```

### Opção 2: Comandos Manuais
```bash
cd C:\projetos\ERP_OS_V2\ERP_OS_V2
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
```

### Iniciar Desenvolvimento
```bash
# Terminal 1
php artisan serve

# Terminal 2 (novo terminal)
npm run dev
```

Acesse: **http://localhost:8000**

Login com:
- Email: `admin@junta.local`
- Senha: `password`

## 📁 Arquivo por Arquivo

### 📄 Documentação
| Arquivo | Descrição |
|---------|-----------|
| **QUICKSTART.md** | Instalação em 3 minutos |
| **SETUP.md** | Guia passo-a-passo com troubleshooting |
| **DEVELOPMENT.md** | Como criar features (Models, Controllers, Pages) |
| **ARCHITECTURE.md** | Visão da arquitetura e conceitos |
| **README.md** | Documentação técnica completa |

### 🛠️ Configuração
| Arquivo | Descrição |
|---------|-----------|
| **composer.json** | Dependências PHP |
| **package.json** | Dependências Node.js |
| **.env.example** | Template de configuração |
| **vite.config.ts** | Configuração do build tool |
| **tailwind.config.js** | Temas do Tailwind CSS |
| **tsconfig.json** | Configuração TypeScript |

### 💻 Backend PHP/Laravel
| Arquivo | Descrição |
|---------|-----------|
| **app/Http/Controllers/** | Controllers (DashboardController, AuthController, TaskController) |
| **app/Models/** | Modelos (User, Task) |
| **routes/web.php** | Definição de rotas |
| **database/migrations/** | Estrutura do banco de dados |
| **database/seeders/** | Dados iniciais de demo |

### 🎨 Frontend React/TypeScript
| Arquivo | Descrição |
|---------|-----------|
| **resources/js/app.tsx** | Entrada da aplicação |
| **resources/js/bootstrap.ts** | Configuração inicial |
| **resources/js/Pages/** | Páginas (Dashboard, Tasks, Orders, Settings) |
| **resources/js/Components/** | Componentes reutilizáveis (Navigation) |
| **resources/js/Layouts/** | Layouts (MainLayout) |
| **resources/css/app.css** | Estilos globais com Tailwind |

### 📦 Outros
| Arquivo | Descrição |
|---------|-----------|
| **.gitignore** | Arquivos ignorados pelo Git |
| **INSTALL.bat** | Script automático de instalação |
| **junta-operacional.code-workspace** | Workspace do VSCode |
| **public/index.php** | Entrada da aplicação web |

## 🎯 Próximas Ações Recomendadas

### 1️⃣ Instalação (5 minutos)
```bash
INSTALL.bat  # ou comandos manuais
```

### 2️⃣ Explorar a aplicação (10 minutos)
- Abrir http://localhost:8000
- Fazer login com `admin@junta.local` / `password`
- Ver o Dashboard com estatísticas
- Navegar pelas páginas

### 3️⃣ Primeira Feature (30 minutos)
Seguir [DEVELOPMENT.md](./DEVELOPMENT.md):
1. Criar novo Model: `php artisan make:model Order -m`
2. Adicionar campos na migration
3. Criar Controller: `php artisan make:controller OrderController --resource`
4. Adicionar rota: `Route::resource('orders', OrderController::class)`
5. Criar página React: `resources/js/Pages/Orders/Index.tsx`

### 4️⃣ Entender a Arquitetura (20 minutos)
Ler [ARCHITECTURE.md](./ARCHITECTURE.md) para:
- Como dados fluem entre React e Laravel
- Padrões de código
- Como autenticação funciona
- Estrutura de banco de dados

## 🔧 Comandos Úteis

### Backend
```bash
php artisan serve                          # Iniciar servidor
php artisan tinker                         # REPL interativo
php artisan make:model NomeModelo -m       # Criar model + migration
php artisan make:controller NomeController # Criar controller
php artisan migrate                        # Executar migrations
php artisan db:seed                        # Rodar seeders
php artisan migrate:fresh --seed           # Reset + migrate + seed
```

### Frontend
```bash
npm run dev                # Dev mode com hot reload
npm run build              # Build para produção
npm run preview            # Preview da build
```

## 📞 Precisa de Ajuda?

### Erro: PHP não encontrado
👉 Instale [Laravel Herd](https://herd.laravel.com/) ou [XAMPP](https://www.apachefriends.org/)

### Erro: Node não encontrado
👉 Instale [Node.js](https://nodejs.org/) (versão 18+)

### Porta 8000 já está em uso
👉 `php artisan serve --port=8001`

### Banco de dados corrompido
👉 `php artisan migrate:fresh --seed`

### Hot reload não funciona
👉 Verifique se `npm run dev` está rodando em outro terminal

Para mais troubleshooting, veja [SETUP.md](./SETUP.md#-troubleshooting)

## 🎓 Recursos Educacionais

- [Laravel Docs](https://laravel.com/docs)
- [React Docs](https://react.dev)
- [Inertia.js Guide](https://inertiajs.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🚀 Roadmap de Desenvolvimento

Sugestão de funcionalidades a implementar:

- [ ] **Autenticação** - Login/Register completo
- [ ] **Gestão de Tarefas** - CRUD completo
- [ ] **Dashboard Avançado** - Gráficos e relatórios
- [ ] **Pedidos/Ordens de Serviço** - Sistema de pedidos
- [ ] **Relatórios** - PDF/Excel
- [ ] **Notificações** - Sistema de alertas
- [ ] **API REST** - Para integração com terceiros
- [ ] **Testes** - Unit e Feature tests
- [ ] **Deploy** - Para produção (Heroku/AWS)

## ✨ Bom Desenvolvimento!

Você tem tudo que precisa para criar uma aplicação profissional. 

Aproveite! 🚀

---

**Criado em**: 13 de Maio de 2026  
**Versão**: 1.0.0  
**Stack**: Laravel 11 + React 18 + TypeScript + Tailwind CSS
