# 🚀 Guia de Instalação - Junta Operacional

## Passo-a-Passo Completo para Windows

### ✅ Passo 1: Verificar Pré-requisitos

Antes de começar, certifique-se de que tem instalado:

1. **PHP 8.1+**
   ```bash
   php --version
   ```
   - Download: https://windows.php.net/downloads/releases/
   - Ou use: [Laravel Herd](https://herd.laravel.com/) (recomendado para Windows)

2. **Composer**
   ```bash
   composer --version
   ```
   - Download: https://getcomposer.org/

3. **Node.js 18+**
   ```bash
   node --version
   npm --version
   ```
   - Download: https://nodejs.org/

### ✅ Passo 2: Abrir PowerShell ou CMD

Navegue até a pasta do projeto:

```bash
cd C:\projetos\ERP_OS_V2\ERP_OS_V2
```

### ✅ Passo 3: Instalar Dependências PHP

```bash
composer install
```

**⏱️ Tempo esperado: 2-5 minutos**

Se receber erro de `php.exe` não encontrado, adicione PHP ao PATH ou use o caminho completo.

### ✅ Passo 4: Instalar Dependências Node.js

```bash
npm install
```

**⏱️ Tempo esperado: 3-8 minutos**

### ✅ Passo 5: Configurar Arquivo .env

```bash
# Copiar arquivo de exemplo
copy .env.example .env

# Gerar chave de aplicação
php artisan key:generate
```

Verifique se o arquivo `.env` tem:
```
APP_KEY=base64:... (deve estar preenchido após o comando anterior)
DB_DATABASE=database/junta.sqlite
```

### ✅ Passo 6: Criar Banco de Dados

```bash
# Executar migrações
php artisan migrate

# Seed com dados de demo
php artisan db:seed
```

**Resultado esperado:**
- Arquivo `database/junta.sqlite` criado
- Tabelas e dados de demonstração carregados
- 5 usuários demo com 8 tarefas criadas

### ✅ Passo 7: Iniciar Servidor Laravel

Abra um **novo terminal/PowerShell**:

```bash
php artisan serve
```

**Resultado esperado:**
```
Laravel development server started on [http://127.0.0.1:8000]
```

### ✅ Passo 8: Iniciar Vite (Frontend)

Abra um **segundo terminal/PowerShell**:

```bash
npm run dev
```

**Resultado esperado:**
```
Local:   http://localhost:5173/
```

### ✅ Passo 9: Acessar a Aplicação

Abra o navegador e acesse:

```
http://localhost:8000
```

Você verá a página de Dashboard com estatísticas.

## 🔑 Dados de Acesso

Use qualquer uma destas credenciais para entrar:

| Email | Senha |
|-------|-------|
| admin@junta.local | password |
| joao@junta.local | password |
| maria@junta.local | password |
| pedro@junta.local | password |
| ana@junta.local | password |

## 📝 Próximos Passos

Após a instalação com sucesso:

1. **Explorar o Dashboard** - Ver as estatísticas de tarefas
2. **Criar nova página** - Adicione uma página em `resources/js/Pages/`
3. **Criar um Model** - Use `php artisan make:model NomeModelo`
4. **Criar um Controller** - Use `php artisan make:controller NomeController`

## 🛑 Troubleshooting

### Problema: "php" não é reconhecido como comando interno

**Solução:**
- Instale [Laravel Herd](https://herd.laravel.com/) ou [XAMPP](https://www.apachefriends.org/)
- Ou adicione PHP ao PATH do Windows

### Problema: "npm" não é reconhecido

**Solução:**
- Reinstale Node.js
- Reinicie o terminal/PowerShell

### Problema: SQLSTATE[HY000]: General error: 14 "unable to open database file"

**Solução:**
```bash
php artisan migrate:fresh --seed
```

### Problema: Porta 8000 já está em uso

**Solução:**
```bash
php artisan serve --port=8001
```

### Problema: Vite não atualiza (Hot Reload não funciona)

**Solução:**
```bash
npm run build
php artisan view:clear
```

## 🔧 VSCode Setup (Recomendado)

1. Abra VSCode
2. Abra a pasta `C:\projetos\ERP_OS_V2\ERP_OS_V2`
3. Instale extensões recomendadas:
   - Laravel Blade Snippets
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux/React-Native snippets
   - TypeScript Vue Plugin

4. Abra terminal integrado: `Ctrl + `` (backtick)

5. Divida o terminal em dois painéis:
   - Painel 1: `php artisan serve`
   - Painel 2: `npm run dev`

## 📞 Ajuda

Se encontrar problemas:
1. Verificar logs em `storage/logs/laravel.log`
2. Rodar `php artisan migrate:fresh --seed` para resetar
3. Limpar cache: `php artisan cache:clear`

---

✨ **Pronto para desenvolvimento!** ✨
