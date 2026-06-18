# ✓ Lista de Verificação - Junta Operacional

## Status: ✅ PRONTO PARA USAR

### Instalações e Dependências
- ✅ Composer e pacotes PHP instalados (`vendor/` existe)
- ✅ NPM e pacotes JavaScript instalados (`node_modules/` existe)
- ✅ Base de dados SQLite criada (`database/junta.sqlite`)
- ✅ Diretórios de cache e storage criados

### Configuração Laravel
- ✅ Bootstrap da aplicação configurado (`bootstrap/app.php`)
- ✅ Middleware Inertia configurado
- ✅ Arquivo `.env` criado com configurações
- ✅ Chave de aplicação gerada (`APP_KEY`)
- ✅ Artisan CLI funcional

### Frontend
- ✅ Vite configurado para assets (`vite.config.ts`)
- ✅ Tailwind CSS pronto (`tailwind.config.js`)
- ✅ TypeScript configurado (`tsconfig.json`)
- ✅ Aplicação completa em `resources/views/app.blade.php`

### Aplicação Junta Operacional
- ✅ Toda a interface visual pronta
- ✅ Sistema de login com contas demo
- ✅ Dashboard com métricas
- ✅ Gestão de tarefas
- ✅ Registo de ocorrências
- ✅ Agenda/Eventos
- ✅ Inventário
- ✅ Funcionários
- ✅ Espaços

---

## 🎯 Para Começar

### 1. Abrir o Projeto no VSCode
```
Ficheiro → Abrir Pasta → C:\projetos\ERP_OS_V2\ERP_OS_V2
```

### 2. Iniciar os Servidores
Duplo clique em `START.bat` na pasta do projeto.

Vai ver:
- Uma janela com "Laravel Server" 
- Uma janela com "Vite Dev Server"
- Ambas devem indicar que está tudo a funcionar

### 3. Aceder à Aplicação
Abra no navegador:
```
http://localhost:8000
```

### 4. Fazer Login
Use uma das contas de teste:
- executivo@junta.local
- coordenador@junta.local
- secretaria@junta.local
- trabalhador@junta.local

(Qualquer senha funciona)

---

## 📁 Ficheiros Principais Para Editar

Quando quiser modificar a aplicação:

- **`resources/views/app.blade.php`** - Interface completa da aplicação
- **`routes/web.php`** - Rotas da aplicação
- **`app/Http/Controllers/`** - Controllers Laravel
- **`app/Models/`** - Modelos de dados

---

## 🔧 Estrutura Base

```php
// routes/web.php - Define as rotas
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// app/Http/Middleware/HandleInertiaRequests.php
// Partilha dados com a aplicação frontend
```

---

## 💾 Base de Dados

- **Tipo**: SQLite (ideal para desenvolvimento)
- **Ficheiro**: `database/junta.sqlite`
- **Migrations**: `database/migrations/`
- **Seeders**: `database/seeders/`

Para executar migrations:
```bash
php artisan migrate
```

Para popular com dados iniciais:
```bash
php artisan db:seed
```

---

## 🚀 Próximas Etapas Sugeridas

1. **Verificar que tudo funciona** - Aceder à app e testar login
2. **Explorar a interface** - Navegar por todas as secções
3. **Começar a programar** - Adicionar novas funcionalidades
4. **Integrar com DB** - Ligar o Laravel aos dados da aplicação
5. **Adicionar autenticação real** - Usar o sistema de auth do Laravel

---

## ❓ Dúvidas?

Se algo não funcionar:
1. Verifique que ambos os servidores estão a correr
2. Aguarde 10 segundos para compilação do Vite
3. Recarregue a página (F5)
4. Verifique a porta (default é 8000)

---

**Tudo pronto para começar a programar! 🎉**
