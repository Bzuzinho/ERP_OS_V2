import React, { useState, useRef } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  CheckSquare, Square, Plus, Trash2, ChevronLeft, Package,
  User, Calendar, Clock, Tag, ShieldCheck, XCircle, Edit2,
  AlertTriangle, CheckCircle2, RotateCcw, Check, X,
} from 'lucide-react'
import clsx from 'clsx'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:     { label: 'Pendente',     color: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'Em progresso', color: 'bg-blue-100 text-blue-700' },
  completed:   { label: 'Concluída',    color: 'bg-green-100 text-green-700' },
  cancelled:   { label: 'Cancelada',    color: 'bg-gray-100 text-gray-600' },
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  low:    { label: 'Baixa',  color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Média',  color: 'bg-blue-100 text-blue-700' },
  high:   { label: 'Alta',   color: 'bg-red-100 text-red-700' },
}

const VALIDATION_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  nao_aplicavel: { label: 'N/A',         color: 'bg-gray-100 text-gray-500',   icon: null },
  pendente:      { label: 'Por validar', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  validado:      { label: 'Validado',    color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  rejeitado:     { label: 'Rejeitado',   color: 'bg-red-100 text-red-700',      icon: XCircle },
}

function Section({ title, children, action }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-sm text-gray-700">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

export default function TaskShow({ task, users = [], inventory = [] }: any) {
  const [addingItem, setAddingItem]   = useState(false)
  const [newItem, setNewItem]         = useState('')
  const [editingItem, setEditingItem] = useState<number|null>(null)
  const [editText, setEditText]       = useState('')
  const [addingMat, setAddingMat]     = useState(false)
  const [rejectOpen, setRejectOpen]   = useState(false)

  const matForm   = useForm({ inventory_item_id: '', quantity: 1, usage_type: 'consumido', notes: '' })
  const valForm   = useForm({ action: 'validado', rejection_reason: '' })
  const statusForm = useForm({ status: task.status })

  const checklist = task.checklist_items ?? task.checklistItems ?? []
  const materials  = task.materials ?? []
  const done       = checklist.filter((i: any) => i.is_completed).length
  const pct        = checklist.length ? Math.round((done / checklist.length) * 100) : 0

  const st  = STATUS_LABELS[task.status] ?? { label: task.status, color: 'bg-gray-100 text-gray-600' }
  const pri = PRIORITY_LABELS[task.priority] ?? { label: task.priority, color: 'bg-gray-100 text-gray-600' }
  const val = VALIDATION_LABELS[task.validation_status ?? 'nao_aplicavel']

  function addChecklist() {
    if (!newItem.trim()) return
    router.post(`/tarefas/${task.id}/checklist`, { title: newItem }, {
      preserveScroll: true,
      onSuccess: () => { setNewItem(''); setAddingItem(false) },
    })
  }

  function toggleItem(itemId: number) {
    router.patch(`/tarefas/${task.id}/checklist/${itemId}/toggle`, {}, { preserveScroll: true })
  }

  function deleteItem(itemId: number) {
    if (!confirm('Remover item?')) return
    router.delete(`/tarefas/${task.id}/checklist/${itemId}`, { preserveScroll: true })
  }

  function startEdit(item: any) {
    setEditingItem(item.id)
    setEditText(item.title)
  }

  function saveEdit(itemId: number) {
    if (!editText.trim()) return
    router.patch(`/tarefas/${task.id}/checklist/${itemId}`, { title: editText }, {
      preserveScroll: true,
      onSuccess: () => { setEditingItem(null); setEditText('') },
    })
  }

  function cancelEdit() {
    setEditingItem(null)
    setEditText('')
  }

  function submitMaterial(e: React.FormEvent) {
    e.preventDefault()
    matForm.post(`/tarefas/${task.id}/materiais`, {
      preserveScroll: true,
      onSuccess: () => { setAddingMat(false); matForm.reset() },
    })
  }

  function validate(action: 'validado' | 'rejeitado') {
    valForm.setData('action', action)
    if (action === 'rejeitado') { setRejectOpen(true); return }
    valForm.post(`/tarefas/${task.id}/validar`, { preserveScroll: true })
  }

  function submitReject(e: React.FormEvent) {
    e.preventDefault()
    valForm.post(`/tarefas/${task.id}/validar`, {
      preserveScroll: true,
      onSuccess: () => setRejectOpen(false),
    })
  }

  function changeStatus(s: string) {
    statusForm.setData('status', s)
    router.patch(`/tarefas/${task.id}`, { status: s }, { preserveScroll: true })
  }

  return (
    <AdminLayout title={task.title}>
      <Head title={`Tarefa — ${task.title}`} />
      <div className="p-4 md:p-6 space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/tarefas" className="hover:text-primary-600 flex items-center gap-1"><ChevronLeft size={14}/>Tarefas</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{task.title}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{task.title}</h1>
              {task.description && <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>}
            </div>
            <Link href={`/tarefas/${task.id}/edit`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-primary-300 transition-colors flex-shrink-0">
              <Edit2 size={14}/> Editar
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', st.color)}>{st.label}</span>
            <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', pri.color)}>{pri.label} prioridade</span>
            {val && (
              <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1', val.color)}>
                {val.icon && <val.icon size={11}/>}{val.label}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={14} className="text-gray-400"/>
              <span>{task.assignee?.name ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Tag size={14} className="text-gray-400"/>
              <span>{task.service_area?.name ?? task.serviceArea?.name ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={14} className="text-gray-400"/>
              <span>{task.due_date ? new Date(task.due_date).toLocaleDateString('pt-PT') : '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={14} className="text-gray-400"/>
              <span>{new Date(task.created_at).toLocaleDateString('pt-PT')}</span>
            </div>
          </div>

          {/* Recorrência */}
          {task.recurrence && task.recurrence !== 'nenhuma' && (
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Recorrente · {task.recurrence}
                {task.occurrence_number > 1 && ` · ocorrência ${task.occurrence_number}`}
              </span>
              {task.recurrence_ends_at && (
                <span className="text-xs text-gray-400">
                  até {new Date(task.recurrence_ends_at).toLocaleDateString('pt-PT')}
                </span>
              )}
              {task.parent_task_id && (
                <a href={`/tarefas/${task.parent_task_id}`}
                  className="text-xs text-primary-600 hover:underline">
                  Ver tarefa original
                </a>
              )}
            </div>
          )}

          {/* Change status */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium mr-1">Mudar estado:</span>
            {Object.entries(STATUS_LABELS).map(([key, v]) => (
              <button
                key={key}
                onClick={() => changeStatus(key)}
                className={clsx(
                  'text-xs px-3 py-1 rounded-full border transition-colors',
                  task.status === key
                    ? 'border-primary-400 bg-primary-50 text-primary-700 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                )}
              >{v.label}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* Checklist */}
            <Section
              title={`Checklist ${checklist.length ? `(${done}/${checklist.length} — ${pct}%)` : ''}`}
              action={
                <button onClick={() => setAddingItem(true)} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  <Plus size={13}/> Adicionar
                </button>
              }
            >
              {/* Progress bar */}
              {checklist.length > 0 && (
                <div className="px-5 pt-3">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }}/>
                  </div>
                </div>
              )}

              <ul className="divide-y divide-gray-50 px-1 py-1">
                {checklist.length === 0 && !addingItem && (
                  <li className="px-4 py-6 text-sm text-gray-400 text-center">Sem itens no checklist.</li>
                )}
                {checklist.map((item: any) => (
                  <li key={item.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50/50">
                    <button onClick={() => toggleItem(item.id)} className="flex-shrink-0">
                      {item.is_completed
                        ? <CheckSquare size={17} className="text-primary-600"/>
                        : <Square size={17} className="text-gray-300 hover:text-gray-400"/>
                      }
                    </button>
                    {editingItem === item.id ? (
                      <>
                        <input
                          autoFocus
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEdit(item.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          className="flex-1 text-sm border border-primary-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-400"
                        />
                        <button onClick={() => saveEdit(item.id)} className="text-green-600 hover:text-green-700 flex-shrink-0">
                          <Check size={14}/>
                        </button>
                        <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                          <X size={14}/>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={clsx('flex-1 text-sm', item.is_completed && 'line-through text-gray-400')}>
                          {item.title}
                        </span>
                        <button onClick={() => startEdit(item)} className="text-gray-300 hover:text-primary-500 flex-shrink-0 transition-colors">
                          <Edit2 size={13}/>
                        </button>
                        <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0 transition-colors">
                          <Trash2 size={13}/>
                        </button>
                      </>
                    )}
                  </li>
                ))}
                {addingItem && (
                  <li className="px-4 py-2.5 flex items-center gap-2">
                    <Square size={17} className="text-gray-200 flex-shrink-0"/>
                    <input
                      autoFocus
                      value={newItem}
                      onChange={e => setNewItem(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addChecklist(); if (e.key === 'Escape') { setAddingItem(false); setNewItem('') } }}
                      placeholder="Descrição do item..."
                      className="flex-1 text-sm border-0 outline-none focus:ring-0 bg-transparent"
                    />
                    <button onClick={addChecklist} className="text-xs bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700">Adicionar</button>
                    <button onClick={() => { setAddingItem(false); setNewItem('') }} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
                  </li>
                )}
              </ul>
            </Section>

            {/* Materials */}
            <Section
              title="Materiais utilizados"
              action={
                <button onClick={() => setAddingMat(!addingMat)} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  <Plus size={13}/> Adicionar
                </button>
              }
            >
              {addingMat && (
                <form onSubmit={submitMaterial} className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <select
                    value={matForm.data.inventory_item_id}
                    onChange={e => matForm.setData('inventory_item_id', e.target.value)}
                    className="col-span-2 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400"
                    required
                  >
                    <option value="">Selecionar item...</option>
                    {inventory.map((i: any) => (
                      <option key={i.id} value={i.id}>{i.name} ({i.current_stock} {i.unit})</option>
                    ))}
                  </select>
                  <input
                    type="number" min="0.001" step="any"
                    value={matForm.data.quantity}
                    onChange={e => matForm.setData('quantity', parseFloat(e.target.value))}
                    placeholder="Qtd."
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400"
                    required
                  />
                  <select
                    value={matForm.data.usage_type}
                    onChange={e => matForm.setData('usage_type', e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400"
                  >
                    <option value="consumido">Consumido</option>
                    <option value="utilizado">Utilizado</option>
                    <option value="alocado">Alocado</option>
                  </select>
                  <div className="col-span-2 sm:col-span-4 flex gap-2">
                    <button type="submit" disabled={matForm.processing} className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 disabled:opacity-50">Guardar</button>
                    <button type="button" onClick={() => setAddingMat(false)} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancelar</button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-gray-50">
                {materials.length === 0 && (
                  <p className="px-5 py-6 text-sm text-gray-400 text-center">Sem materiais registados.</p>
                )}
                {materials.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <Package size={15} className="text-gray-400 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{m.item?.name}</p>
                      <p className="text-xs text-gray-400">{m.usage_type}</p>
                    </div>
                    <span className="text-sm text-gray-700">{m.quantity} <span className="text-xs text-gray-400">{m.item?.unit}</span></span>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Validation */}
            {task.validation_status !== 'nao_aplicavel' && (
              <Section title="Validação">
                <div className="p-5 space-y-3">
                  {task.validation_status === 'pendente' && (
                    <>
                      <p className="text-xs text-gray-500">Esta tarefa requer validação de um supervisor.</p>
                      <div className="flex gap-2">
                        <button onClick={() => validate('validado')} className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-green-600 text-white rounded-lg px-3 py-2 hover:bg-green-700">
                          <ShieldCheck size={14}/> Validar
                        </button>
                        <button onClick={() => validate('rejeitado')} className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-red-600 text-white rounded-lg px-3 py-2 hover:bg-red-700">
                          <XCircle size={14}/> Rejeitar
                        </button>
                      </div>
                      {rejectOpen && (
                        <form onSubmit={submitReject} className="space-y-2 pt-1 border-t border-gray-100">
                          <textarea
                            value={valForm.data.rejection_reason}
                            onChange={e => valForm.setData('rejection_reason', e.target.value)}
                            placeholder="Motivo da rejeição..."
                            rows={3}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-400"
                          />
                          <div className="flex gap-2">
                            <button type="submit" disabled={valForm.processing} className="flex-1 text-sm bg-red-600 text-white rounded-lg py-1.5 hover:bg-red-700 disabled:opacity-50">Confirmar rejeição</button>
                            <button type="button" onClick={() => setRejectOpen(false)} className="text-sm text-gray-400 hover:text-gray-600 px-2">Cancelar</button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                  {task.validation_status === 'validado' && (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 size={16}/>
                      <span className="text-sm font-medium">Validado</span>
                    </div>
                  )}
                  {task.validation_status === 'rejeitado' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-red-700"><XCircle size={16}/><span className="text-sm font-medium">Rejeitado</span></div>
                      {task.rejection_reason && <p className="text-xs text-gray-500">{task.rejection_reason}</p>}
                      <button onClick={() => validate('validado')} className="w-full flex items-center justify-center gap-1 text-xs text-green-700 border border-green-200 rounded-lg py-1.5 hover:bg-green-50">
                        <RotateCcw size={12}/> Re-validar
                      </button>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Info */}
            <Section title="Informação">
              <div className="p-4 space-y-3 text-sm">
                {task.ticket && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Pedido associado</p>
                    <Link href={`/pedidos/${task.ticket.id}`} className="text-primary-600 hover:underline">{task.ticket.reference ?? `#${task.ticket.id}`}</Link>
                  </div>
                )}
                {task.plan && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Plano</p>
                    <Link href={`/planeamento/${task.plan.id}`} className="text-primary-600 hover:underline">{task.plan.title}</Link>
                  </div>
                )}
                {task.team && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Equipa</p>
                    <span className="text-gray-700">{task.team.name}</span>
                  </div>
                )}
                {task.creator && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Criada por</p>
                    <span className="text-gray-700">{task.creator.name}</span>
                  </div>
                )}
                {task.validator && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Validada por</p>
                    <span className="text-gray-700">{task.validator.name}</span>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Criada em</p>
                  <span className="text-gray-700">{new Date(task.created_at).toLocaleDateString('pt-PT')}</span>
                </div>
                {task.due_date && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Prazo</p>
                    <span className="text-gray-700">{new Date(task.due_date).toLocaleDateString('pt-PT')}</span>
                  </div>
                )}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
