# Manual completo de utilizador — ERP_OS / Junta Operacional

Versão: 1.0  
Data: 30/06/2026

Este manual explica a utilização diária do ERP_OS, também identificado no projecto como Junta Operacional/JuntaOS. Foi escrito para utilizadores finais e administradores funcionais, com foco em procedimentos práticos.

> As capturas PNG existentes nesta pasta `Manual_ERP_OS` devem ser mantidas junto deste ficheiro. Ao exportar este manual para PDF ou Word, inserir em cada secção a captura correspondente ao ecrã indicado.

---

## 1. Finalidade da aplicação

O ERP_OS é um sistema de gestão operacional para juntas de freguesia. Centraliza pedidos, tarefas, agenda, reservas, espaços, diretório, equipas, recursos, documentos, atas, recursos humanos, chat, relatórios e configurações.

A lógica principal é: um pedido representa uma entrada de serviço; uma tarefa representa trabalho a executar; os módulos de agenda, reservas, inventário, documentos e RH suportam a operação.

---

## 2. Entrar e sair

Para entrar, abrir o endereço da aplicação, introduzir email e palavra-passe e confirmar o acesso. Em produção, cada utilizador deve ter conta própria. Evitar partilha de credenciais.

Para sair, abrir o menu do utilizador e escolher a opção de terminar sessão. Em computadores partilhados, isto é obrigatório.

Imagem recomendada: captura do ecrã de login.

---

## 3. Navegação principal

A barra lateral apresenta os módulos principais:

- Início
- Pedidos
- Tarefas
- Agenda
- Planeamento
- Diretório
- Equipas
- Recursos
- Documentos
- Chat
- Relatórios
- Configurações

Alguns módulos têm separadores internos. Agenda agrupa Agenda, Reservas e Espaços. Diretório agrupa Pessoas e Entidades. Recursos agrupa Catálogo, Stock, Empréstimos e Requisições. Documentos agrupa Documentos e Atas. Configurações inclui Geral e Permissões.

Imagem recomendada: captura da barra lateral/menu principal.

---

## 4. Início / Dashboard

O dashboard é o ponto de controlo. Deve ser a primeira página consultada no início do dia.

Mostra indicadores de pedidos, tarefas, reservas, inventário, planos activos, pedidos recentes, próximos eventos, reservas pendentes e ausências pendentes quando o utilizador tem permissão para aprovar.

Utilização recomendada:

1. Ver pedidos recentes.
2. Ver tarefas pendentes e em progresso.
3. Confirmar reservas pendentes.
4. Ver alertas de stock baixo.
5. Acompanhar planos operacionais activos.

Imagem recomendada: captura do dashboard.

---

## 5. Pedidos

O módulo Pedidos regista solicitações internas ou externas. Pode representar atendimento presencial, telefonema, email, pedido de portal ou necessidade interna.

### 5.1 Lista de pedidos

A lista permite filtrar por estado, prioridade, área de serviço e pesquisa livre.

Estados principais:

- aberto
- em progresso
- com tarefas
- resolvido
- cancelado

Prioridades:

- baixa
- normal
- alta
- urgente

### 5.2 Criar pedido

1. Entrar em Pedidos.
2. Escolher Novo pedido.
3. Preencher título e descrição.
4. Indicar prioridade e origem.
5. Associar contacto, se existir.
6. Associar área de serviço, responsável ou equipa, se já for conhecido.
7. Guardar.

Origens previstas: portal, presencial, telefone, email e interno.

### 5.3 Tratar pedido

No detalhe do pedido é possível consultar dados principais, contacto, responsável, área, equipas, comentários, anexos, histórico e tarefas relacionadas.

Operações importantes:

- actualizar estado;
- encaminhar para área/equipa/responsável;
- adicionar comentário público ou interno;
- associar ou alterar contacto;
- anexar ficheiros;
- gerar tarefa;
- cancelar pedido.

Comentário público deve ser usado para informação que pode ser comunicada. Comentário interno deve ser usado para notas de serviço, bastidores e coordenação interna.

### 5.4 Gerar tarefa a partir de pedido

Quando o pedido exige execução, usar a opção Gerar tarefa. A tarefa fica ligada ao pedido e permite acompanhar execução operacional. Regra simples: pedido é a solicitação; tarefa é o trabalho.

Imagens recomendadas: lista de pedidos, criação de pedido e detalhe de pedido.

---

## 6. Tarefas

O módulo Tarefas gere o trabalho a executar. Uma tarefa pode ser criada directamente, gerada por um pedido, criada por uma reserva aprovada ou associada a planeamento operacional.

### 6.1 Lista de tarefas

Filtros disponíveis: estado, prioridade, validação, equipa, responsável e pesquisa.

Estados:

- pending — pendente
- in_progress — em progresso
- completed — concluída
- cancelled — cancelada

Prioridades:

- low — baixa
- medium — média
- high — alta

### 6.2 Criar tarefa

1. Entrar em Tarefas.
2. Escolher Nova tarefa.
3. Preencher título e descrição.
4. Definir estado inicial e prioridade.
5. Associar responsável, equipa, área de serviço ou plano.
6. Indicar data limite, se existir.
7. Adicionar checklist, se houver passos de execução.
8. Adicionar materiais, se forem necessários.
9. Guardar.

### 6.3 Checklist

A checklist divide a tarefa em passos. O sistema pode actualizar automaticamente o estado da tarefa:

- nenhum item concluído: pendente;
- alguns itens concluídos: em progresso;
- todos os itens concluídos: concluída.

Alguns itens podem exigir validação. Nestes casos, o executante submete o item e o validador aprova ou rejeita.

### 6.4 Materiais na tarefa

Materiais podem ser associados como consumidos, utilizados ou alocados. Ao validar uma tarefa, o sistema pode actualizar stock ou criar alocações.

### 6.5 Recorrência

A aplicação suporta recorrência nenhuma, diária, semanal, quinzenal, mensal e anual. Ao concluir uma tarefa recorrente, pode ser criada a ocorrência seguinte.

Imagens recomendadas: lista de tarefas, criação de tarefa, detalhe, checklist e validação.

---

## 7. Agenda, Reservas e Espaços

A área Agenda contém Agenda, Reservas e Espaços.

### 7.1 Agenda

Mostra eventos e marcações. Pode incluir eventos criados manualmente e eventos gerados por reservas aprovadas.

### 7.2 Reservas

Usar Reservas para pedidos de utilização de espaços.

Criar reserva:

1. Entrar em Agenda > Reservas.
2. Criar nova reserva.
3. Escolher espaço.
4. Associar contacto, se existir.
5. Preencher título, finalidade, início, fim e número previsto de participantes.
6. Guardar.

O sistema verifica sobreposição de horários. Se houver conflito, a reserva não deve ser aceite.

Aprovar reserva: abrir reserva pendente e aprovar. Ao aprovar, o sistema cria evento e tarefa de preparação do espaço.

Rejeitar reserva: abrir reserva pendente, rejeitar e indicar motivo quando aplicável.

Cancelar reserva: a reserva passa para estado cancelada, preservando histórico.

### 7.3 Espaços

Espaços são locais físicos geridos pela junta. Devem ser mantidos actualizados, incluindo nome, localização, capacidade e estado activo.

Imagens recomendadas: agenda, reservas, detalhe de reserva e espaços.

---

## 8. Planeamento

Planeamento deve ser usado para organizar planos operacionais com tarefas, responsáveis, datas e recursos.

Separadores previstos:

- Planos
- Agenda
- Requisições

Usar planeamento quando existe uma intervenção com várias tarefas relacionadas: manutenção, limpeza sazonal, preparação de evento, campanha operacional ou conjunto de trabalhos por equipa.

Boas práticas:

- criar o plano antes das tarefas;
- associar tarefas ao plano;
- definir responsável;
- acompanhar progresso no dashboard;
- usar requisições quando houver necessidade de material.

Imagem recomendada: ecrãs de planeamento.

---

## 9. Diretório: Pessoas e Entidades

O Diretório separa Pessoas e Entidades.

### 9.1 Pessoas

Usar para munícipes, funcionários, constituintes e contactos individuais.

Operações previstas:

- criar pessoa;
- editar dados;
- consultar detalhe;
- carregar foto/avatar;
- criar conta de acesso;
- actualizar dados de acesso;
- remover ligação a utilizador;
- registar ausências, férias ou licenças quando aplicável.

### 9.2 Entidades

Usar para fornecedores, instituições, associações, parceiros e organizações.

Operações previstas:

- criar entidade;
- editar entidade;
- consultar detalhe;
- carregar imagem/avatar;
- eliminar ou desactivar.

Regra prática: pessoa é indivíduo; entidade é organização. Misturar isto estraga pesquisas e relatórios.

Imagens recomendadas: Pessoas, detalhe de pessoa, Entidades e detalhe de entidade.

---

## 10. Equipas

Equipas agrupam utilizadores ou operacionais. Podem ser associadas a pedidos, tarefas, reservas, inventário e planeamento.

Operações previstas:

- criar equipa;
- editar equipa;
- consultar equipa;
- remover equipa;
- adicionar membros;
- remover membros.

Exemplos: equipa administrativa, limpeza, obras, manutenção, eventos.

Imagem recomendada: ecrãs de Equipas.

---

## 11. Recursos / Inventário

Recursos gere catálogo, stock, empréstimos e requisições.

### 11.1 Catálogo

Regista materiais e equipamentos. Campos previstos incluem nome, referência, código de barras, categoria, fornecedor, subcategoria, tipo, descrição, unidade, stock actual, stock mínimo, stock máximo, localização, número de série, data de compra, preço, condição e notas de qualidade.

Tipos de item:

- consumível
- reutilizável
- equipamento
- EPI

### 11.2 Stock

Mostra materiais activos, alertas de stock baixo/esgotado e movimentos recentes.

Movimentos previstos:

- entrada
- saída
- quebra
- reposição
- empréstimo
- devolução

Entradas e reposições aumentam stock. Saídas, quebras e empréstimos reduzem stock. Devoluções repõem stock.

### 11.3 Empréstimos

Usar para material reutilizável ou equipamento que sai temporariamente.

Criar empréstimo: escolher material, pessoa/equipa, quantidade, finalidade, data de saída e data prevista de devolução. O sistema verifica stock disponível.

Devolver empréstimo: marcar como devolvido ou perdido. Se devolvido, o stock regressa. Se perdido, não regressa. É duro, mas é inventário, não magia.

### 11.4 Requisições

Permitem pedir material e controlar aprovação/entrega.

Estados:

- pendente
- aprovada
- rejeitada
- entregue
- cancelada

Fluxo recomendado: submeter requisição, aprovar ou rejeitar, entregar material e confirmar movimento de stock.

Imagens recomendadas: Catálogo, Stock, Empréstimos e Requisições.

---

## 12. Documentos e Atas

### 12.1 Documentos

Tipos previstos:

- documento
- ata
- regulamento
- formulário
- outro

Visibilidade:

- público
- interno
- restrito

Criar documento: preencher título, descrição, tipo, visibilidade e anexar ficheiro se necessário. O sistema suporta aprovação, retirada de aprovação e pedido de aprovação a utilizadores.

### 12.2 Atas

Atas são documentos com tipo ata, data de reunião e conteúdo associado.

Criar ata: preencher título, data da reunião, visibilidade, descrição/conteúdo e guardar.

Imagens recomendadas: Documentos, detalhe de documento, aprovação e Atas.

---

## 13. Recursos Humanos

RH permite gerir funcionários e ausências.

Operações previstas:

- listar funcionários;
- criar funcionário;
- consultar detalhe;
- editar funcionário;
- registar ausências;
- aprovar ou rejeitar ausências, mediante permissão.

Boas práticas: manter dados actualizados, registar ausências cedo e não deixar aprovações pendentes.

Imagem recomendada: ecrãs de RH e ausências.

---

## 14. Chat

Chat permite conversas internas e mensagens. A aplicação prevê contador de mensagens não lidas e notificações.

Operações previstas:

- criar conversa;
- abrir conversa;
- enviar mensagem;
- apagar mensagem;
- transformar mensagem em tarefa;
- transformar mensagem em pedido;
- consultar mensagens não lidas.

Regra prática: se uma mensagem exige execução, transformar em tarefa. Se é uma entrada de serviço, transformar em pedido. O chat não deve ser o arquivo final de trabalho.

Imagem recomendada: ecrãs de Chat.

---

## 15. Relatórios

Relatórios devem apoiar decisão e acompanhamento. Relatórios úteis incluem pedidos por estado, tarefas por responsável, tarefas por equipa, tempos de resolução, reservas por espaço, stock baixo, movimentos de inventário e documentos pendentes de aprovação.

Número que não muda uma decisão é decoração. Usar relatórios para agir.

Imagem recomendada: ecrãs de Relatórios.

---

## 16. Configurações e permissões

Configurações permite gerir parâmetros gerais, perfis, permissões e tipos de pessoa.

Boas práticas:

- criar perfis por função;
- atribuir apenas permissões necessárias;
- rever permissões quando alguém muda de função;
- remover acessos quando deixam de ser necessários;
- separar perfis administrativos de perfis operacionais.

Imagem recomendada: Configurações e Permissões.

---

## 17. Notificações

A aplicação apresenta notificações no sino e pode actualizar contadores de notificações e mensagens. Existem notificações para aprovações, validações, documentos e mensagens.

Consultar notificações diariamente. Notificação ignorada hoje é urgência amanhã.

---

## 18. Fluxos recomendados

### Pedido recebido por telefone

Criar pedido com origem telefone, associar contacto, definir prioridade, encaminhar para área/equipa, gerar tarefa se necessário, acompanhar execução e resolver.

### Reserva de espaço

Confirmar/criar pessoa no Diretório, criar reserva, verificar disponibilidade, aprovar ou rejeitar, acompanhar evento e tarefa de preparação.

### Requisição de material

Consultar stock, submeter requisição, aprovar, entregar material e validar movimento de stock.

### Tarefa com checklist

Criar tarefa, atribuir responsável/equipa, criar checklist, executar itens, validar itens sensíveis e fechar tarefa.

### Documento para aprovação

Criar documento, anexar ficheiro, solicitar aprovação, aprovar ou devolver para correcção.

---

## 19. Regras simples de utilização

1. Pedido é entrada de serviço.
2. Tarefa é trabalho a executar.
3. Comentários internos não são comunicação externa.
4. Anexos devem guardar prova/documentação.
5. Reservas devem ser aprovadas ou rejeitadas, não deixadas pendentes.
6. Stock deve ser actualizado no momento do movimento.
7. Pessoas e entidades não devem ser duplicadas.
8. Chat deve gerar tarefa ou pedido quando houver acção.
9. Notificações devem ser tratadas todos os dias.
10. O ciclo só termina quando está validado e fechado.

---

## 20. Glossário

Pedido: solicitação recebida.  
Tarefa: trabalho a executar.  
Checklist: passos de uma tarefa.  
Validação: confirmação formal.  
Reserva: pedido de utilização de espaço.  
Evento: marcação na agenda.  
Espaço: local físico gerido.  
Pessoa: contacto individual.  
Entidade: organização.  
Equipa: grupo operacional.  
Inventário: materiais e equipamentos.  
Movimento de stock: alteração de quantidade.  
Requisição: pedido de material.  
Ata: documento de reunião.  
PWA: aplicação web instalável.

---

## 21. Checklist de arranque

Antes de usar em produção:

- configurar organização, nome, logótipo e cores;
- criar utilizadores;
- definir perfis e permissões;
- criar áreas de serviço;
- criar equipas;
- criar pessoas e entidades principais;
- criar espaços;
- carregar inventário inicial;
- definir stocks mínimos;
- testar pedido para tarefa;
- testar reserva de espaço;
- testar requisição de material;
- testar aprovação de documento;
- testar notificações.

---

## 22. Enquadramento técnico mínimo

A aplicação está documentada no projecto como Laravel 11, React 18, TypeScript, Inertia.js, Tailwind CSS, Spatie Permission, Vite e SQLite em desenvolvimento.

Comandos comuns em desenvolvimento:

```bash
composer install
npm install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
npm run dev
```

---

## 23. Resumo final

O ERP_OS deve ser usado como sistema central de operação. O fluxo ideal é:

**entrada → classificação → atribuição → execução → validação → fecho**.

A ferramenta dá estrutura. A disciplina da equipa é que transforma estrutura em resultados.