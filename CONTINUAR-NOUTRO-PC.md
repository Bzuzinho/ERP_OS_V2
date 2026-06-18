# Continuar o desenvolvimento noutro computador

Repositório: **https://github.com/Bzuzinho/ERP_OS_V2**

---

## Requisitos

- PHP 8.3+ (com extensões: pdo_sqlite, mbstring, openssl, tokenizer, xml, ctype, json, bcmath)
- Composer
- Node.js 20+
- Git

---

## Setup inicial (primeira vez neste computador)

```bash
# 1. Clonar o repositório
git clone https://github.com/Bzuzinho/ERP_OS_V2.git
cd ERP_OS_V2

# 2. Instalar dependências PHP
composer install

# 3. Instalar dependências Node
npm install

# 4. Configurar ambiente
copy .env.example .env
php artisan key:generate

# 5. Criar e popular a base de dados
php artisan migrate
php artisan db:seed

# 6. Criar link de storage
php artisan storage:link
```

---

## Arrancar o projeto

Abrir **dois terminais** na pasta do projeto:

**Terminal 1 — Laravel (backend):**
```bash
php artisan serve --port=8001
```

**Terminal 2 — Vite (frontend):**
```bash
npm run dev
```

Abrir no browser: **http://localhost:8001**

Login padrão:
- Email: `admin@juntaos.pt`
- Password: `password`

> Em alternativa, clicar duas vezes em **START.bat** para arrancar tudo automaticamente.

---

## Sincronizar com a versão mais recente

Sempre que retomar o desenvolvimento:

```bash
# Buscar últimas alterações do GitHub
git pull

# Se houver novas migrações
php artisan migrate

# Se houver novas dependências PHP
composer install

# Se houver novas dependências Node
npm install
```

---

## Guardar trabalho no GitHub

Após cada sessão de desenvolvimento, correr **GIT-PUSH.bat** (dois cliques)  
ou manualmente:

```bash
git add .
git commit -m "descrição do que foi feito"
git push
```

---

## Estrutura do projeto

```
ERP_OS_V2/
├── app/
│   ├── Http/Controllers/   # Controllers Laravel
│   └── Models/             # Modelos Eloquent
├── database/
│   ├── migrations/         # Migrações da base de dados
│   └── seeders/            # Dados iniciais
├── resources/js/
│   ├── Layouts/            # AdminLayout (sidebar + header)
│   └── Pages/              # Páginas React/Inertia
├── routes/web.php          # Todas as rotas
├── START.bat               # Arrancar o projeto (Windows)
├── GIT-PUSH.bat            # Commit e push rápido (Windows)
└── CONTINUAR-NOUTRO-PC.md  # Este ficheiro
```

---

## Módulos implementados

| Módulo | Rota | Estado |
|--------|------|--------|
| Dashboard | `/` | ✅ |
| Pedidos | `/pedidos` | ✅ |
| Tarefas | `/tarefas` | ✅ |
| Agenda | `/agenda` | ✅ |
| Reservas de Espaços | `/reservas` | ✅ |
| Espaços | `/espacos` | ✅ |
| Planeamento | `/planeamento` | ✅ |
| Munícipes / Pessoas | `/municipes` | ✅ |
| Funcionários | `/rh` | ✅ |
| Equipas | `/equipas` | ✅ |
| Inventário | `/inventario` | ✅ |
| Manutenções | `/manutencoes` | ✅ |
| Documentos | `/documentos` | ✅ |
| Atas | `/atas` | ✅ |
| Relatórios | `/relatorios` | ✅ |
| Notificações | `/notificacoes` | ✅ |
| Configurações | `/configuracoes` | ✅ |

---

## Base de dados

SQLite em `database/juntaos.sqlite` (criado automaticamente com `php artisan migrate`).

Para fazer reset completo:
```bash
php artisan migrate:fresh --seed
```
