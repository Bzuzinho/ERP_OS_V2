# 🚀 JUNTA OPERACIONAL - Guia de Início Rápido

## ✅ Status: Pronto para Usar

A aplicação está completamente configurada e pronta para ser executada no seu VSCode!

---

## 📌 Como Iniciar

### Opção 1: Script Automático (Recomendado)
Simplesmente execute o ficheiro `START.bat` na pasta do projeto:

1. Abra a pasta `C:\projetos\ERP_OS_V2\ERP_OS_V2` no Explorador de Ficheiros
2. Clique duas vezes em `START.bat`
3. Dois terminais vão abrir automaticamente com os servidores

---

## 🌐 Acesso à Aplicação

Após iniciar os servidores, acede à aplicação em:

```
http://localhost:8000
```

---

## 👥 Contas de Teste

A aplicação vem com 4 contas de teste já criadas. **Qualquer senha funciona** (é apenas uma demonstração):

### Contas Admin
- **Executivo**: `executivo@junta.local`
- **Coordenador**: `coordenador@junta.local`  
- **Secretária**: `secretaria@junta.local`

### Conta Trabalhador
- **Trabalhador**: `trabalhador@junta.local`

---

## 📋 Funcionalidades Disponíveis

✅ **Dashboard** - Vista geral com métricas  
✅ **Tarefas** - Criar e gerir tarefas  
✅ **Ocorrências** - Registar e acompanhar ocorrências  
✅ **Agenda** - Ver eventos da junta  
✅ **Inventário** - Gerir stock e equipamentos  
✅ **Funcionários** - Consultar pessoal da junta  
✅ **Espaços** - Gerir instalações disponíveis  

---

## 🛠️ Estrutura Técnica

```
ERP_OS_V2/
├── resources/views/app.blade.php    ← Aplicação completa aqui
├── routes/web.php                   ← Rotas da aplicação
├── public/index.php                 ← Entry point
├── bootstrap/app.php                ← Configuração Laravel
└── .env                             ← Variáveis de ambiente
```

---

## 📝 Próximos Passos

Após verificar que tudo funciona, pode:

1. **Modificar a aplicação** no VSCode
2. **Adicionar rotas/controllers** conforme necessário
3. **Integrar com a base de dados** gradualmente
4. **Estender funcionalidades** usando Laravel + React

---

## ⚠️ Troubleshooting

### Se ver uma página em branco:
- Certifique-se que ambos os servidores estão a rodar (2 janelas do terminal abertos)
- Aguarde 5-10 segundos para o Vite compilar os assets
- Pressione F5 para recarregar a página

### Se a porta 8000 estiver ocupada:
Abra um terminal e execute:
```bash
php artisan serve --port=8001
```

### Se npm run dev falhar:
Verifique que tem Node.js instalado:
```bash
node --version
npm --version
```

---

## 💡 Dica

Mantenha ambas as janelas de terminal abertas enquanto está a programar. O Vite vai recompilar automaticamente quando guardar ficheiros, e o Laravel vai servir as alterações em tempo real.

---

**Desenvolvido com ❤️ para a Junta Operacional**
