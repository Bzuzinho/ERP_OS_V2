import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, Search, CheckSquare, Square, ChevronRight, Filter } from 'lucide-react'
import clsx from 'clsx'

const STATUS_OPTS = [
  { value: '',            label: 'Todos os estados' },
  { value: 'pending',     label: 'Pendente' },
  { value: 'in_progress', label: 'Em progresso' },
  { value: 'completed',   label: 'Concluída' },
  { value: 'cancelled',   label: 'Cancelada' },
]

const PRIORITY_OPTS = [
  { value: '',       label: 'Qualquer prioridade' },
  { value: 'low',    label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high',   label: 'Alta' },
]

const VALIDATION_OPTS = [
  { value: '',              label: 'Qualquer validação' },
  { value: 'pendente',      label: 'Por validar' },
  { value: 'validado',      label: 'Validado' },
  { value: 'rejeitado',     label: 'Rejeitado' },
  { value: 'nao_aplicavel', label: 'N/A' },
]

const STATUS_COLORS: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-gray-100 text-gray-500',
}
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente', in_progress: 'Em progresso', completed: 'Concluída', cancelled: 'Cancelada',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-500', medium: 'bg-blue-100 text-blue-600', high: 'bg-red-100 text-red-600',
}
const PRIORITY_LABELS: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' }

const VALIDATION_COLORS: Record<string, string> = {
  nao_aplicavel: 'text-gray-400', pendente: 'text-yellow-600', validado: 'text-green-600', rejeitado: 'text-red-600',
}

function ChecklistBar({ items }: { items: any[] }) {
  if (!items?.length) return null
  const done = items.filter(i => i.is_completed).length
  const pct  = Math.round((done / items.length) * 100)
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 bg-gray-100 rounded-full h-1">
        <div className="bg-primary-500 h-1 rounded-full" style={{ width: `${pct}%` }}/>
      </div>
      <span className="text-xs text-gray-400 tabular-nums">{done}/{items.length}</span>
    </div>
  )
}

export default function TaskIndex({ tasks, filters = {}, users = [], teams = [] }: any) {
  const [search, setSearch]     = useState(filters.search ?? '')
  const [showFilters, setShowFilters] = useState(false)

  function applyFilters(extra: Record<string, string> = {}) {
    router.get('/tarefas', { ...filters, search, ...extra }, { preserveState: true, replace: true })
  }

  function applyFilter(key: string, value: string) {
    router.get('/tarefas', { ...filters, search, [key]: value }, { preserveState: true, replace: true })
  }

  const activeFilterCount = ['status','priority','validation_status','team_id','assigned_to']
    .filter(k => filters[k]).length

  return (
    <AdminLayout title="Tarefas">
      <Head title="Tarefas — JuntaOS"/>
      <div className="p-6 max-w-6xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                placeholder="Pesquisar tarefas..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'flex items-center gap-1.5 text-sm border rounded-xl px-3 py-2 transition-colors',
                showFilters || activeFilterCount > 0
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
              )}
            >
              <Filter size={14}/> Filtros
              {activeFilterCount > 0 && <span className="bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>
          <Link href="/tarefas/nova" className="flex items-center gap-1.5 text-sm bg-primary-600 text-white rounded-xl px-4 py-2 hover:bg-primary-700 transition-colors flex-shrink-0">
            <Plus size={15}/> Nova tarefa
          </Link>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <select value={filters.status ?? ''} onChange={e => applyFilter('status', e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filters.priority ?? ''} onChange={e => applyFilter('priority', e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
              {PRIORITY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filters.validation_status ?? ''} onChange={e => applyFilter('validation_status', e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
              {VALIDATION_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filters.team_id ?? ''} onChange={e => applyFilter('team_id', e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
              <option value="">Todas as equipas</option>
              {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={filters.assigned_to ?? ''} onChange={e => applyFilter('assigned_to', e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
              <option value="">Todos os utilizadores</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        )}

        {/* Task list */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {tasks.data?.length === 0 && (
            <div className="py-16 text-center">
              <CheckSquare size={36} className="mx-auto text-gray-200 mb-3"/>
              <p className="text-gray-400 text-sm">Sem tarefas encontradas.</p>
              <Link href="/tarefas/nova" className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"><Plus size={14}/> Criar tarefa</Link>
            </div>
          )}

          <div className="divide-y divide-gray-50">
            {tasks.data?.map((task: any) => {
              const items = task.checklist_items ?? task.checklistItems ?? []
              const valColor = VALIDATION_COLORS[task.validation_status ?? 'nao_aplicavel']
              return (
                <Link key={task.id} href={`/tarefas/${task.id}`} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors group">
                  <div className="mt-0.5 flex-shrink-0">
                    {task.status === 'completed'
                      ? <CheckSquare size={18} className="text-primary-500"/>
                      : <Square size={18} className="text-gray-300"/>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={clsx('text-sm font-medium text-gray-800 group-hover:text-primary-700 transition-colors', task.status === 'completed' && 'line-through text-gray-400')}>{task.title}</p>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full', STATUS_COLORS[task.status])}>{STATUS_LABELS[task.status] ?? task.status}</span>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full', PRIORITY_COLORS[task.priority])}>{PRIORITY_LABELS[task.priority] ?? task.priority}</span>
                    </div>
                    {task.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>}
                    <ChecklistBar items={items}/>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                      {task.assignee && <span>{task.assignee.name}</span>}
                      {task.due_date && <span>🗓 {new Date(task.due_date).toLocaleDateString('pt-PT')}</span>}
                      {task.team && <span>👥 {task.team.name}</span>}
                      {task.validation_status && task.validation_status !== 'nao_aplicavel' && (
                        <span className={clsx('font-medium', valColor)}>
                          {task.validation_status === 'pendente' ? '⏳ Por validar' : task.validation_status === 'validado' ? '✓ Validado' : '✗ Rejeitado'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 mt-0.5"/>
                </Link>
              )
            })}
          </div>

          {/* Pagination */}
          {(tasks.prev_page_url || tasks.next_page_url) && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span>{tasks.from}–{tasks.to} de {tasks.total}</span>
              <div className="flex gap-2">
                {tasks.prev_page_url && (
                  <Link href={tasks.prev_page_url} className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Anterior</Link>
                )}
                {tasks.next_page_url && (
                  <Link href={tasks.next_page_url} className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Próxima</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
