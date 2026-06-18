import React, { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  ChevronLeft, CheckSquare, Square, Calendar, Plus, X,
  AlertTriangle, Clock, Users, Edit2, Trash2, CalendarDays,
  TrendingUp, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

const TASK_STATUS_COLORS: Record<string,string> = {
  pending:     'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-gray-100 text-gray-500',
}
const TASK_STATUS_LABELS: Record<string,string> = {
  pending:'Pendente', in_progress:'Em progresso', completed:'Concluída', cancelled:'Cancelada',
}
const PRIORITY_COLORS: Record<string,string> = {
  low:'bg-gray-100 text-gray-500', medium:'bg-blue-100 text-blue-600', high:'bg-red-100 text-red-600',
}
const PLAN_STATUS_COLORS: Record<string,string> = {
  rascunho:'bg-gray-100 text-gray-600', ativo:'bg-blue-100 text-blue-700',
  concluido:'bg-green-100 text-green-700', cancelado:'bg-red-100 text-red-700',
}
const EVENT_TYPE_COLORS: Record<string,string> = {
  interno:'bg-indigo-100 text-indigo-700', público:'bg-green-100 text-green-700',
  reunião:'bg-purple-100 text-purple-700', reserva:'bg-blue-100 text-blue-700',
  planeamento:'bg-orange-100 text-orange-700',
}

function StatusBar({ byStatus, total }: any) {
  const colors: Record<string,string> = {
    pending:'bg-yellow-400', in_progress:'bg-blue-500', completed:'bg-green-500', cancelled:'bg-gray-300',
  }
  return (
    <div className="flex rounded-full overflow-hidden h-2 gap-px">
      {Object.entries(colors).map(([st, col]) => {
        const w = total > 0 ? Math.round(((byStatus[st] ?? 0) / total) * 100) : 0
        return w > 0 ? <div key={st} className={col} style={{ width: `${w}%` }} title={`${TASK_STATUS_LABELS[st]}: ${byStatus[st] ?? 0}`}/> : null
      })}
    </div>
  )
}

export default function PlaneamentoShow({ plan, events = [], users = [], teams = [] }: any) {
  const tasks = plan.tasks ?? []
  const total     = tasks.length
  const completed = tasks.filter((t: any) => t.status === 'completed').length
  const pct       = plan.progress ?? (total > 0 ? Math.round((completed / total) * 100) : 0)
  const byStatus: Record<string,number> = plan.tasks_by_status ?? {}

  const [filterStatus, setFilterStatus] = useState<string>('')
  const [editPlan, setEditPlan]         = useState(false)
  const [addingTask, setAddingTask]     = useState(false)

  const planForm = useForm({
    title:       plan.title,
    description: plan.description ?? '',
    starts_at:   plan.starts_at ? new Date(plan.starts_at).toISOString().slice(0,10) : '',
    ends_at:     plan.ends_at   ? new Date(plan.ends_at).toISOString().slice(0,10)   : '',
    status:      plan.status,
  })

  const taskForm = useForm({
    title:      '',
    priority:   'medium',
    assigned_to:'',
    team_id:    '',
    due_date:   '',
    plan_id:    plan.id,
    status:     'pending',
    organization_id: 1,
  })

  function savePlan(e: React.FormEvent) {
    e.preventDefault()
    planForm.patch(`/planeamento/${plan.id}`, { onSuccess: () => setEditPlan(false) })
  }

  function addTask(e: React.FormEvent) {
    e.preventDefault()
    taskForm.post('/tarefas', { preserveScroll: true, onSuccess: () => { taskForm.reset('title','priority','assigned_to','team_id','due_date'); setAddingTask(false) } })
  }

  function deletePlan() {
    if (!confirm(`Eliminar "${plan.title}" e todas as suas tarefas?`)) return
    router.delete(`/planeamento/${plan.id}`)
  }

  const visibleTasks = filterStatus ? tasks.filter((t: any) => t.status === filterStatus) : tasks

  return (
    <AdminLayout title={plan.title}>
      <Head title={`${plan.title} — JuntaOS`}/>
      <div className="p-6 max-w-6xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/planeamento" className="hover:text-primary-600 flex items-center gap-1"><ChevronLeft size={14}/>Planeamento</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{plan.title}</span>
        </div>

        {/* Plan header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          {editPlan ? (
            <form onSubmit={savePlan} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={planForm.data.title} onChange={e => planForm.setData('title', e.target.value)} required
                  placeholder="Título" className="sm:col-span-2 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                <textarea value={planForm.data.description} onChange={e => planForm.setData('description', e.target.value)}
                  rows={2} placeholder="Descrição" className="sm:col-span-2 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Início</label>
                  <input type="date" value={planForm.data.starts_at} onChange={e => planForm.setData('starts_at', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fim</label>
                  <input type="date" value={planForm.data.ends_at} onChange={e => planForm.setData('ends_at', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                </div>
                <select value={planForm.data.status} onChange={e => planForm.setData('status', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                  <option value="rascunho">Rascunho</option>
                  <option value="ativo">Ativo</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={planForm.processing} className="text-sm bg-primary-600 text-white rounded-lg px-4 py-2 hover:bg-primary-700 disabled:opacity-50">Guardar</button>
                <button type="button" onClick={() => setEditPlan(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-gray-900">{plan.title}</h1>
                    <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', PLAN_STATUS_COLORS[plan.status] ?? 'bg-gray-100 text-gray-600')}>
                      {plan.status}
                    </span>
                  </div>
                  {plan.description && <p className="mt-1.5 text-sm text-gray-600">{plan.description}</p>}
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                    <Calendar size={11}/>
                    {plan.starts_at ? new Date(plan.starts_at).toLocaleDateString('pt-PT') : '—'}
                    {' → '}
                    {plan.ends_at ? new Date(plan.ends_at).toLocaleDateString('pt-PT') : '—'}
                    <span>· {plan.year}</span>
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setEditPlan(true)} className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors">
                    <Edit2 size={13}/> Editar
                  </button>
                  <button onClick={deletePlan} className="flex items-center gap-1.5 text-sm border border-red-200 rounded-lg px-3 py-1.5 text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={13}/> Eliminar
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    {Object.entries(TASK_STATUS_LABELS).map(([k,l]) => (
                      <span key={k} className="flex items-center gap-1">
                        <span className={clsx('w-2 h-2 rounded-full inline-block', {
                          'bg-yellow-400':k==='pending','bg-blue-500':k==='in_progress','bg-green-500':k==='completed','bg-gray-300':k==='cancelled',
                        })}/>
                        {byStatus[k] ?? 0} {l.toLowerCase()}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-primary-700 flex items-center gap-1"><TrendingUp size={13}/>{pct}%</span>
                </div>
                <StatusBar byStatus={byStatus} total={total}/>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Tasks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-sm text-gray-700">Tarefas ({total})</h3>
                  {/* Quick filter */}
                  <div className="flex gap-1">
                    {['', 'pending', 'in_progress', 'completed'].map(s => (
                      <button key={s} onClick={() => setFilterStatus(s)}
                        className={clsx('text-xs px-2 py-0.5 rounded-full transition-colors',
                          filterStatus === s ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100')}>
                        {s === '' ? 'Todas' : TASK_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setAddingTask(!addingTask)}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  <Plus size={13}/> Adicionar
                </button>
              </div>

              {addingTask && (
                <form onSubmit={addTask} className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 space-y-3">
                  <input value={taskForm.data.title} onChange={e => taskForm.setData('title', e.target.value)} required
                    placeholder="Título da tarefa..." autoFocus
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <select value={taskForm.data.priority} onChange={e => taskForm.setData('priority', e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                    <select value={taskForm.data.assigned_to} onChange={e => taskForm.setData('assigned_to', e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
                      <option value="">Responsável...</option>
                      {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <select value={taskForm.data.team_id} onChange={e => taskForm.setData('team_id', e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
                      <option value="">Equipa...</option>
                      {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input type="date" value={taskForm.data.due_date} onChange={e => taskForm.setData('due_date', e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={taskForm.processing} className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 disabled:opacity-50">Criar tarefa</button>
                    <button type="button" onClick={() => setAddingTask(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-gray-50">
                {visibleTasks.length === 0 && (
                  <div className="px-5 py-8 text-center">
                    <CheckSquare size={32} className="mx-auto text-gray-200 mb-2"/>
                    <p className="text-sm text-gray-400">{filterStatus ? 'Sem tarefas neste estado.' : 'Sem tarefas neste plano.'}</p>
                    {!filterStatus && (
                      <button onClick={() => setAddingTask(true)} className="mt-2 text-xs text-primary-600 hover:underline flex items-center gap-1 mx-auto">
                        <Plus size={12}/> Adicionar tarefa
                      </button>
                    )}
                  </div>
                )}
                {visibleTasks.map((t: any) => {
                  const items = t.checklist_items ?? t.checklistItems ?? []
                  const itemsDone = items.filter((i: any) => i.is_completed).length
                  const overdue = t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
                  return (
                    <Link key={t.id} href={`/tarefas/${t.id}`}
                      className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50/70 transition-colors group">
                      <div className="mt-0.5 flex-shrink-0">
                        {t.status === 'completed'
                          ? <CheckSquare size={16} className="text-green-500"/>
                          : <Square size={16} className="text-gray-300"/>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={clsx('text-sm font-medium', t.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800 group-hover:text-primary-700')}>{t.title}</p>
                          <span className={clsx('text-xs px-2 py-0.5 rounded-full', PRIORITY_COLORS[t.priority])}>{t.priority}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                          {t.assignee && <span className="flex items-center gap-1"><Users size={10}/>{t.assignee.name}</span>}
                          {t.due_date && (
                            <span className={clsx('flex items-center gap-1', overdue && 'text-red-500 font-medium')}>
                              {overdue && <AlertTriangle size={10}/>}
                              <Clock size={10}/>{new Date(t.due_date).toLocaleDateString('pt-PT')}
                            </span>
                          )}
                          {items.length > 0 && (
                            <span>{itemsDone}/{items.length} checklist</span>
                          )}
                        </div>
                        {items.length > 0 && (
                          <div className="mt-1 w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-400 rounded-full" style={{ width: `${Math.round((itemsDone/items.length)*100)}%` }}/>
                          </div>
                        )}
                      </div>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full flex-shrink-0', TASK_STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-500')}>
                        {TASK_STATUS_LABELS[t.status] ?? t.status}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Events in plan period */}
            {events.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1.5"><CalendarDays size={13} className="text-gray-400"/>Eventos no período</h3>
                  <Link href="/agenda" className="text-xs text-primary-600 hover:text-primary-700">Ver agenda →</Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {events.slice(0,6).map((e: any) => (
                    <Link key={e.id} href={`/agenda/${e.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color ?? '#0284c7' }}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate group-hover:text-primary-700">{e.title}</p>
                        <p className="text-xs text-gray-400">{new Date(e.starts_at).toLocaleDateString('pt-PT', { day:'2-digit', month:'short' })}</p>
                      </div>
                      <span className={clsx('text-xs px-1.5 py-0.5 rounded-full', EVENT_TYPE_COLORS[e.type] ?? 'bg-gray-100 text-gray-600')}>{e.type}</span>
                    </Link>
                  ))}
                  {events.length > 6 && (
                    <div className="px-4 py-2 text-xs text-gray-400 text-center">+{events.length - 6} eventos</div>
                  )}
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resumo</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label:'Total', value: total, color:'text-gray-800' },
                  { label:'Concluídas', value: byStatus['completed'] ?? 0, color:'text-green-700' },
                  { label:'Em progresso', value: byStatus['in_progress'] ?? 0, color:'text-blue-700' },
                  { label:'Pendentes', value: byStatus['pending'] ?? 0, color:'text-yellow-700' },
                ].map(s => (
                  <div key={s.label} className="text-center bg-gray-50 rounded-lg p-2.5">
                    <p className={clsx('text-xl font-bold', s.color)}>{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Link to tasks list filtered */}
            <Link href={`/tarefas?plan_id=${plan.id}`}
              className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 hover:bg-primary-100 transition-colors">
              <span className="text-sm text-primary-700 font-medium">Ver todas as tarefas</span>
              <ChevronRight size={14} className="text-primary-600"/>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
