#!/usr/bin/env python3
"""
JuntaOS — Migração Relacional
Adiciona novas tabelas e colunas para suporte a:
  - Equipas (internas e externas)
  - Manutenções de espaços
  - Uso e alocação de materiais
  - Validação de tarefas
  - Origem de pedidos (munícipe / associação / interno)
"""
import sqlite3, sys, os

DB_PATH = os.path.join(os.path.dirname(__file__), 'juntaos.sqlite')

def run():
    conn = sqlite3.connect(DB_PATH)
    conn.execute('PRAGMA journal_mode=WAL')
    c = conn.cursor()

    # ──────────────────────────────────────────
    # NOVAS TABELAS
    # ──────────────────────────────────────────

    c.executescript("""
    -- Equipas (internas = funcionários da junta; externas = empresas/prestadores)
    CREATE TABLE IF NOT EXISTS teams (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL DEFAULT 1,
        name            TEXT    NOT NULL,
        type            TEXT    NOT NULL DEFAULT 'interna',   -- interna | externa
        leader_id       INTEGER,                               -- FK users.id
        description     TEXT,
        contact_name    TEXT,
        contact_phone   TEXT,
        contact_email   TEXT,
        is_active       INTEGER NOT NULL DEFAULT 1,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Membros de equipas (equipa interna → utilizadores da plataforma)
    CREATE TABLE IF NOT EXISTS team_members (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id    INTEGER NOT NULL,
        user_id    INTEGER NOT NULL,
        role       TEXT DEFAULT 'membro',   -- membro | lider | supervisor
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(team_id, user_id)
    );

    -- Manutenções de espaços (preventiva, corretiva, urgente, periódica)
    CREATE TABLE IF NOT EXISTS maintenances (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id  INTEGER NOT NULL DEFAULT 1,
        space_id         INTEGER,                -- FK spaces.id
        title            TEXT    NOT NULL,
        description      TEXT,
        type             TEXT    NOT NULL DEFAULT 'corretiva', -- preventiva|corretiva|urgente|periodica
        status           TEXT    NOT NULL DEFAULT 'pendente',  -- pendente|em_progresso|concluida|cancelada
        priority         TEXT    NOT NULL DEFAULT 'normal',    -- baixa|normal|alta|urgente
        assigned_team_id INTEGER,               -- FK teams.id
        assigned_to      INTEGER,               -- FK users.id (responsável individual)
        created_by       INTEGER,               -- FK users.id
        scheduled_at     DATETIME,
        completed_at     DATETIME,
        estimated_cost   REAL,
        actual_cost      REAL,
        notes            TEXT,
        created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Relação Manutenção ↔ Tarefas geradas
    CREATE TABLE IF NOT EXISTS maintenance_tasks (
        maintenance_id INTEGER NOT NULL,
        task_id        INTEGER NOT NULL,
        PRIMARY KEY (maintenance_id, task_id)
    );

    -- Uso de materiais em tarefas (consumido = baixa stock; utilizado/alocado = sem baixa)
    CREATE TABLE IF NOT EXISTS task_materials (
        id                INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id           INTEGER NOT NULL,
        inventory_item_id INTEGER NOT NULL,
        quantity          REAL    NOT NULL DEFAULT 1,
        usage_type        TEXT    NOT NULL DEFAULT 'consumido', -- consumido|utilizado|alocado
        notes             TEXT,
        created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Alocação de materiais reutilizáveis a funcionários / equipas / departamentos
    CREATE TABLE IF NOT EXISTS material_allocations (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        inventory_item_id   INTEGER NOT NULL,
        allocated_to_type   TEXT    NOT NULL,  -- user | team | department
        allocated_to_id     INTEGER,
        allocated_to_name   TEXT,              -- nome livre (equipa externa, etc.)
        quantity            REAL    NOT NULL DEFAULT 1,
        status              TEXT    NOT NULL DEFAULT 'em_uso',  -- em_uso|devolvido|perdido
        task_id             INTEGER,           -- tarefa que originou a alocação
        notes               TEXT,
        allocated_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
        returned_at         DATETIME,
        created_by          INTEGER,
        created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # ──────────────────────────────────────────
    # ALTER TABLE (ADD COLUMN — idempotente)
    # ──────────────────────────────────────────

    def add_col(table, col, definition):
        c.execute(f"PRAGMA table_info({table})")
        cols = [r[1] for r in c.fetchall()]
        if col not in cols:
            c.execute(f"ALTER TABLE {table} ADD COLUMN {col} {definition}")
            print(f"  + {table}.{col}")
        else:
            print(f"  ~ {table}.{col} já existe")

    print("\n[tasks]")
    add_col('tasks', 'team_id',          "INTEGER")                             # equipa responsável
    add_col('tasks', 'plan_id',          "INTEGER")                             # plano operacional pai
    add_col('tasks', 'maintenance_id',   "INTEGER")                             # manutenção que gerou
    add_col('tasks', 'validation_status', "TEXT DEFAULT 'nao_aplicavel'")       # nao_aplicavel|pendente|validado|rejeitado
    add_col('tasks', 'validated_by',     "INTEGER")                             # FK users.id
    add_col('tasks', 'validated_at',     "DATETIME")
    add_col('tasks', 'rejection_reason', "TEXT")

    print("\n[tickets]")
    add_col('tickets', 'source_type',   "TEXT DEFAULT 'interno'")              # municipe|associacao|interno
    add_col('tickets', 'project_id',    "INTEGER")                             # FK operational_plans.id
    add_col('tickets', 'team_id',       "INTEGER")                             # FK teams.id

    print("\n[inventory_items]")
    add_col('inventory_items', 'item_type', "TEXT DEFAULT 'consumivel'")       # consumivel|reutilizavel|equipamento
    add_col('inventory_items', 'serial_number', "TEXT")
    add_col('inventory_items', 'purchase_date', "DATE")
    add_col('inventory_items', 'purchase_price', "REAL")
    add_col('inventory_items', 'condition',  "TEXT DEFAULT 'bom'")             # bom|regular|mau|inutilizado

    print("\n[operational_plans]")
    add_col('operational_plans', 'progress',   "INTEGER DEFAULT 0")
    add_col('operational_plans', 'budget',     "REAL")
    add_col('operational_plans', 'manager_id', "INTEGER")
    add_col('operational_plans', 'year',       "INTEGER")

    print("\n[documents]")
    add_col('documents', 'content', "TEXT")                                    # conteúdo de atas

    conn.commit()
    conn.close()
    print("\n✓ Migração concluída com sucesso.")

if __name__ == '__main__':
    run()
