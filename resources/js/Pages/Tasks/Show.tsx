import React, { useState, useRef } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  CheckSquare, Square, Plus, Trash2, ChevronLeft, Package,
  User, Calendar, Clock, Tag, ShieldCheck, XCircle, Edit2,
  AlertTriangle, CheckCircle2, RotateCcw, Check, X, Users,
  MapPin, ShieldAlert, ChevronDown, ChevronUp,
} from 'lucide-react'
import clsx from 'clsx'

// ── Constantes de estado ─────────────────────────────────────────────────────
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
  nao_aplicavel: { label: 'N/A',         color: 'bg-gray-100 text-gray-500',    icon: null },
  pendente:      { label: 'Por validar', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  validado:      { label: 'Validado',    color: 'bg-green-100 text-green-700',   icon: CheckCircle2 },
  rejeitado:     { label: 'Rejeitado',   color: 'bg-red-100 text-red-700',       icon: XCircle },
}

// ── Componentes auxiliares ────────────────────────────────────────────────────
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

// ── Item de checklist ─────────────────────────────────────────────────────────
function ChecklistItem({ item, taskId, onToggle, onDelete, onEdit }: {
  item: any; taskId: number
  onToggle: () => void; onDelete: () => void; onEdit: (item: any) => void
}) {
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const vs = item.validation_status   // null | pendente | aprovado | rejeitado
  const requiresVal = item.requires_validation

  function validate(action: 'aprovado' | 'rejeitado') {
    setProcessing(true)
    router.post(`/tarefas/${taskId}/checklist/${item.id}/validar`,
      { action, rejection_reason: action === 'rejeitado' ? rejectReason : undefined },
      { preserveScroll: true, onFinish: () => { setProcessing(false); setRejectOpen(false) } }
    )
  }

  // Visual state
  const isPending  = requiresVal && vs === 'pendente'
  const isApproved = requiresVal && vs === 'aprovado'
  const isRejected = requiresVal && vs === 'rejeitado'

  return (
    <li className={clsx(
      'px-4 py-2.5 hover:bg-gray-50/50 transition-colors',
      isPending  && 'bg-amber-50 border-l-2 border-amber-400',
      isRejected && 'bg-red-50/60 border-l-2 border-red-300',  // subtil: convida a re-submeter
      isApproved && 'bg-green-50/40',
    )}>
      <div className="flex items-center gap-2">
        {/* Checkbox / estado visual */}
        <button
          onClick={onToggle}
          disabled={isApproved}
          className="flex-shrink-0 disabled:opacity-40"
          title={
            isPending  ? 'A aguardar validação — clique para cancelar submissão' :
            isApproved ? 'Aprovado por validador' :
            isRejected ? 'Rejeitado — clique para re-submeter para validação' :
            requiresVal ? 'Clique para submeter para validação' : ''
          }
        >
          {isApproved ? (
            <CheckSquare size={17} className="text-green-600"/>
          ) : isPending ? (
            <Clock size={17} className="text-amber-500"/>
          ) : item.is_completed ? (
            <CheckSquare size={17} className="text-primary-600"/>
          ) : (
            /* rejeitado e normal unchecked → square clicável */
            <Square size={17} className={clsx(
              isRejected  ? 'text-red-400 hover:text-red-500' :
              requiresVal ? 'text-amber-300 hover:text-amber-400' :
                            'text-gray-300 hover:text-gray-400'
            )}/>
          )}
        </button>

        {/* Título */}
        <span className={clsx(
          'flex-1 text-sm',
          (item.is_completed || isApproved) && 'line-through text-gray-400',
          isPending  && 'text-amber-700 font-medium',
          isRejected && 'text-red-600',
        )}>
          {item.title}
        </span>

        {/* Badge validação */}
        {requiresVal && (
          <span className={clsx(
            'text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium',
            isPending  ? 'bg-amber-100 text-amber-700' :
            isApproved ? 'bg-green-100 text-green-700' :
            isRejected ? 'bg-red-100 text-red-600' :
                         'bg-gray-100 text-gray-500'
          )}>
            {isPending ? 'aguarda val.' : isApproved ? 'aprovado' : isRejected ? 'rejeitado' : 'req. val.'}
          </span>
        )}

        {/* Acções edição */}
        <button onClick={() => onEdit(item)} className="text-gray-300 hover:text-primary-500 flex-shrink-0 transition-colors">
          <Edit2 size={13}/>
        </button>
        <button onClick={onDelete} className="text-gray-300 hover:text-red-500 flex-shrink-0 transition-colors">
          <Trash2 size={13}/>
        </button>
      </div>

      {/* Painel de validação — só aparece quando item está pendente */}
      {isPending && (
        <div className="mt-2 ml-7 space-y-2">
          {!rejectOpen ? (
            <div className="flex gap-2">
              <button
                onClick={() => validate('aprovado')}
                disabled={processing}
                className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg disabled:opacity-50 transition-colors">
                <ShieldCheck size={12}/> Aprovar
              </button>
              <button
                onClick={() => setRejectOpen(true)}
                disabled={processing}
                className="flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg disabled:opacity-50 transition-colors">
                <XCircle size={12}/> Rejeitar
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <textarea
                autoFocus
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Motivo da rejeição..."
                rows={2}
                className="w-full text-xs border border-red-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => validate('rejeitado')} disabled={processing}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg disabled:opacity-50">
                  Confirmar rejeição
                </button>
                <button onClick={() => setRejectOpen(false)}
                  className="text-xs text-gray-400 hover:text-gray-600">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Motivo de rejeição + instrução para re-submeter */}
      {isRejected && (
        <div className="mt-1 ml-7 space-y-0.5">
          {item.rejection_reason && (
            <p className="text-xs text-red-500 italic">"{item.rejection_reason}"</p>
          )}
          <p className="text-xs text-red-400">Clique no quadrado para re-submeter para validação.</p>
        </div>
      )}
    </li>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function TaskShow({ task, users = [], serviceAreas = [], teams = [], inventory = [] }: any) {
  const [addingItem, setAddingItem]       = useState(false)
  const [newItem, setNewItem]             = useState('')
  const [newItemNeedsVal, setNewItemNeedsVal] = useState(false)
  const [editingItem, setEditingItem]     = useState<number|null>(null)
  const [editText, setEditText]           = useState('')
  const [addingMat, setAddingMat]         = useState(false)
  const [rejectOpen, setRejectOpen]       = useState(false)
  const [assignOpen, setAssignOpen]       = useState(false)

  const matForm    = useForm({ inventory_item_id: '', quantity: 1, usage_type: 'consumido', notes: '' })
  const valForm    = useForm({ action: 'validado', rejection_reason: '' })
  const statusForm = useForm({ status: task.status })
  const assignForm = useForm({
    service_area_id: task.service_area_id ?? '',
    team_id:         task.team_id ?? '',
    assigned_to:     task.assigned_to ?? '',
  })

  const checklist = task.checklist_items ?? task.checklistItems ?? []
  const materials  = task.materials ?? []

  // Progress: itens concluídos (is_completed = true)
  const done = checklist.filter((i: any) => i.is_completed).length
  const pct  = checklist.length ? Math.round((done / checklist.length) * 100) : 0
  // Pendentes de validação
  const pendingVal = checklist.filter((i: any) => i.validation_status === 'pendente').length

  const st  = STATUS_LABELS[task.status]  ?? { label: task.status, color: 'bg-gray-100 text-gray-600' }
  const pri = PRIORITY_LABELS[task.priority] ?? { label: task.priority, color: 'bg-gray-100 text-gray-600' }
  const val = VALIDATION_LABELS[task.validation_status ?? 'nao_aplicavel']

  function addChecklist() {
    if (!newItem.trim()) return
    router.post(`/tarefas/${task.id}/checklist`,
      { title: newItem, requires_validation: newItemNeedsVal },
      { preserveScroll: true, onSuccess: () => { setNewItem(''); setAddingItem(false); setNewItemNeedsVal(false) } }
    )
  }

  function toggleItem(itemId: number) {
    router.patch(`/tarefas/${task.id}/checklist/${itemId}/toggle`, {}, { preserveScroll: true })
  }

  function deleteItem(itemId: number) {
    if (!confirm('Remover item?')) return
    router.delete(`/tarefas/${task.id}/checklist/${itemId}`, { preserveScroll: true })
  }

  function startEdit(item: any) { setEditingItem(item.id); setEditText(item.title) }
  function cancelEdit()          { setEditingItem(null); setEditText('') }
  function saveEdit(itemId: number) {
    if (!editText.trim()) return
    router.patch(`/tarefas/${task.id}/checklist/${itemId}`, { title: editText }, {
      preserveScroll: true,
      onSuccess: () => cancelEdit(),
    })
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
    router.patch(`/tarefas/${task.id}`, { status: s }, { preserveScroll: true })
  }

  function saveAssignment() {
    assignForm.patch(`/tarefas/${task.id}/atribuicao`, {
      preserveScroll: true,
      onSuccess: () => setAssignOpen(false),
    })
  }

  return (
    <AdminLayout title={task.title}>
      <Head title={`Tarefa — ${task.title}`} />
      <div className="p-4 md:p-6 space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/tarefas" className="hover:text-primary-600 flex items-center gap-1">
            <ChevronLeft size={14}/>Tarefas
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{task.title}</span>
        </div>

        {/* Alerta de itens pendentes de validação */}
        {pendingVal > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            <ShieldAlert size={16} className="flex-shrink-0 text-amber-500"/>
            <span>
              {pendingVal === 1
                ? '1 item do checklist aguarda validação.'
                : `${pendingVal} itens do checklist aguardam validação.`}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{task.title}</h1>
              {task.description && <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>}
            </div>
            <Link href={`/tarefas/${task.id}/edit`}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-primary-300 transition-colors flex-shrink-0">
              <Edit2 size={14}/> Editar
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', st.color)}>{st.label}</span>
            <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', pri.color)}>{pri.label} prioridade</span>
            {val && val.label !== 'N/A' && (
              <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1', val.color)}>
                {val.icon && <val.icon size={11}/>}{val.label}
              </span>
            )}
          </div>

          {/* Info rápida */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={14} className="text-gray-400"/>
              <span>{task.assignee?.name ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={14} className="text-gray-400"/>
              <span>{task.service_area?.name ?? task.serviceArea?.name ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={14} className="text-gray-400"/>
              <span>{task.team?.name ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={14} className="text-gray-400"/>
              <span>{task.due_date ? new Date(task.due_date).toLocaleDateString('pt-PT') : '—'}</span>
            </div>
          </div>

          {/* Recorrência */}
          {task.recurrence && task.recurrence !== 'nenhuma' && (
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 font-medium">
                <RotateCcw size={11}/>
                Recorrente · {task.recurrence}
                {task.occurrence_number > 1 && ` · ocorrência ${task.occurrence_number}`}
              </span>
              {task.recurrence_ends_at && (
                <span className="text-xs text-gray-400">
                  até {new Date(task.recurrence_ends_at).toLocaleDateString('pt-PT')}
                </span>
              )}
              {task.parent_task_id && (
                <a href={`/tarefas/${task.parent_task_id}`} className="text-xs text-primary-600 hover:underline">
                  Ver tarefa original
                </a>
              )}
            </div>
          )}

          {/* Change status */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium mr-1">Mudar estado:</span>
            {Object.entries(STATUS_LABELS).map(([key, v]) => (
              <button key={key} onClick={() => changeStatus(key)}
                className={clsx(
                  'text-xs px-3 py-1 rounded-full border transition-colors',
                  task.status === key
                    ? 'border-primary-400 bg-primary-50 text-primary-700 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                )}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* Checklist */}
            <Section
              title={`Checklist ${checklist.length ? `(${done}/${checklist.length} — ${pct}%)` : ''}`}
              action={
                <button onClick={() => setAddingItem(true)}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  <Plus size={13}/> Adicionar
                </button>
              }
            >
              {/* Progress */}
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
                  editingItem === item.id ? (
                    <li key={item.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50/50">
                      <Square size={17} className="text-gray-200 flex-shrink-0"/>
                      <input
                        autoFocus
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(item.id); if (e.key === 'Escape') cancelEdit() }}
                        className="flex-1 text-sm border border-primary-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                      <button onClick={() => saveEdit(item.id)} className="text-green-600 hover:text-green-700">
                        <Check size={14}/>
                      </button>
                      <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                        <X size={14}/>
                      </button>
                    </li>
                  ) : (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      taskId={task.id}
                      onToggle={() => toggleItem(item.id)}
                      onDelete={() => deleteItem(item.id)}
                      onEdit={startEdit}
                    />
                  )
                ))}

                {/* Formulário novo item */}
                {addingItem && (
                  <li className="px-4 py-2.5 space-y-2 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <Square size={17} className="text-gray-200 flex-shrink-0"/>
                      <input
                        autoFocus
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addChecklist(); if (e.key === 'Escape') { setAddingItem(false); setNewItem('') } }}
                        placeholder="Descrição do item..."
                        className="flex-1 text-sm border-0 outline-none focus:ring-0 bg-transparent"
                      />
                    </div>
                    {/* Toggle validação */}
                    <div className="ml-6 flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
                        <button
                          type="button"
                          onClick={() => setNewItemNeedsVal(v => !v)}
                          className={clsx(
                            'w-8 h-4 rounded-full transition-colors relative flex-shrink-0',
                            newItemNeedsVal ? 'bg-amber-500' : 'bg-gray-200'
                          )}>
                          <span className={clsx(
                            'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform',
                            newItemNeedsVal ? 'translate-x-4' : 'translate-x-0.5'
                          )}/>
                        </button>
                        <ShieldAlert size={12} className={newItemNeedsVal ? 'text-amber-500' : 'text-gray-300'}/>
                        Requer validação
                      </label>
                      <div className="flex items-center gap-2 ml-auto">
                        <button onClick={addChecklist}
                          className="text-xs bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700">
                          Adicionar
                        </button>
                        <button onClick={() => { setAddingItem(false); setNewItem(''); setNewItemNeedsVal(false) }}
                          className="text-xs text-gray-400 hover:text-gray-600">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </Section>

            {/* Materials */}
            <Section
              title="Materiais utilizados"
              action={
                <button onClick={() => setAddingMat(!addingMat)}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  <Plus size={13}/> Adicionar
                </button>
              }
            >
              {addingMat && (
                <form onSubmit={submitMaterial}
                  className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <select value={matForm.data.inventory_item_id}
                    onChange={e => matForm.setData('inventory_item_id', e.target.value)}
                    className="col-span-2 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400" required>
                    <option value="">Selecionar item...</option>
                    {inventory.map((i: any) => (
                      <option key={i.id} value={i.id}>{i.name} ({i.current_stock} {i.unit})</option>
                    ))}
                  </select>
                  <input type="number" min="0.001" step="any"
                    value={matForm.data.quantity}
                    onChange={e => matForm.setData('quantity', parseFloat(e.target.value))}
                    placeholder="Qtd."
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400" required/>
                  <select value={matForm.data.usage_type}
                    onChange={e => matForm.setData('usage_type', e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
                    <option value="consumido">Consumido</option>
                    <option value="utilizado">Utilizado</option>
                    <option value="alocado">Alocado</option>
                  </select>
                  <div className="col-span-2 sm:col-span-4 flex gap-2">
                    <button type="submit" disabled={matForm.processing}
                      className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 disabled:opacity-50">
                      Guardar
                    </button>
                    <button type="button" onClick={() => setAddingMat(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">
                      Cancelar
                    </button>
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
                    <span className="text-sm text-gray-700">
                      {m.quantity} <span className="text-xs text-gray-400">{m.item?.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Atribuição: área funcional + equipa + responsável */}
            <Section title="Atribuição">
              <div className="p-4 space-y-3">
                {!assignOpen ? (
                  <>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Área funcional</p>
                          <p className="text-gray-700">{task.service_area?.name ?? task.serviceArea?.name ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users size={14} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Equipa</p>
                          <p className="text-gray-700">{task.team?.name ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Responsável</p>
                          <p className="text-gray-700">{task.assignee?.name ?? '—'}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setAssignOpen(true)}
                      className="w-full mt-1 text-xs text-primary-600 hover:text-primary-700 border border-primary-200 hover:border-primary-300 rounded-lg py-1.5 transition-colors">
                      Editar atribuição
                    </button>
                  </>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Área funcional</label>
                      <select value={assignForm.data.service_area_id}
                        onChange={e => assignForm.setData('service_area_id', e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
                        <option value="">Sem área</option>
                        {serviceAreas.map((sa: any) => (
                          <option key={sa.id} value={sa.id}>{sa.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Equipa</label>
                      <select value={assignForm.data.team_id}
                        onChange={e => assignForm.setData('team_id', e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
                        <option value="">Sem equipa</option>
                        {teams.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Responsável</label>
                      <select value={assignForm.data.assigned_to}
                        onChange={e => assignForm.setData('assigned_to', e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
                        <option value="">Sem responsável</option>
                        {users.map((u: any) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveAssignment} disabled={assignForm.processing}
                        className="flex-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-1.5 disabled:opacity-50 transition-colors">
                        Guardar
                      </button>
                      <button onClick={() => setAssignOpen(false)}
                        className="text-xs text-gray-400 hover:text-gray-600 px-2">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* Validação da tarefa */}
            {task.validation_status !== 'nao_aplicavel' && (
              <Section title="Validação da tarefa">
                <div className="p-5 space-y-3">
                  {task.validation_status === 'pendente' && (
                    <>
                      <p className="text-xs text-gray-500">Esta tarefa requer validação de um supervisor.</p>
                      <div className="flex gap-2">
                        <button onClick={() => validate('validado')}
                          className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-green-600 text-white rounded-lg px-3 py-2 hover:bg-green-700">
                          <ShieldCheck size={14}/> Validar
                        </button>
                        <button onClick={() => validate('rejeitado')}
                          className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-red-600 text-white rounded-lg px-3 py-2 hover:bg-red-700">
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
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-400"/>
                          <div className="flex gap-2">
                            <button type="submit" disabled={valForm.processing}
                              className="flex-1 text-sm bg-red-600 text-white rounded-lg py-1.5 hover:bg-red-700 disabled:opacity-50">
                              Confirmar rejeição
                            </button>
                            <button type="button" onClick={() => setRejectOpen(false)}
                              className="text-sm text-gray-400 hover:text-gray-600 px-2">
                              Cancelar
                            </button>
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
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle size={16}/>
                        <span className="text-sm font-medium">Rejeitado</span>
                      </div>
                      {task.rejection_reason && <p className="text-xs text-gray-500">{task.rejection_reason}</p>}
                      <button onClick={() => validate('validado')}
                        className="w-full flex items-center justify-center gap-1 text-xs text-green-700 border border-green-200 rounded-lg py-1.5 hover:bg-green-50">
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
                    <Link href={`/pedidos/${task.ticket.id}`} className="text-primary-600 hover:underline">
                      {task.ticket.reference ?? `#${task.ticket.id}`}
                    </Link>
                  </div>
                )}
                {task.plan && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Plano</p>
                    <Link href={`/planeamento/${task.plan.id}`} className="text-primary-600 hover:underline">
                      {task.plan.title}
                    </Link>
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
