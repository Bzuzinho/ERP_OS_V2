import React, { useRef, useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  ChevronRight, Globe, Lock, CheckCircle2, AlertTriangle,
  ArrowRightLeft, ClipboardList, Paperclip, X, Upload,
  FileText, Trash2, Edit2, UserCheck, MessageSquare,
  StickyNote, AlertCircle, RefreshCw, CheckSquare,
} from 'lucide-react'
import clsx from 'clsx'

const STATUS_LABELS: Record<string,string> = {
  aberto:'Aberto', em_analise:'Em análise', em_progresso:'Em progresso',
  com_tarefas:'Com tarefas', aguarda_resposta:'Aguarda resposta',
  resolvido:'Resolvido', encerrado:'Encerrado', cancelado:'Cancelado',
}
const statusColors: Record<string,string> = {
  aberto:'bg-blue-100 text-blue-700', em_analise:'bg-yellow-100 text-yellow-700',
  em_progresso:'bg-indigo-100 text-indigo-700', com_tarefas:'bg-purple-100 text-purple-700',
  aguarda_resposta:'bg-orange-100 text-orange-700', resolvido:'bg-green-100 text-green-700',
  encerrado:'bg-gray-100 text-gray-600', cancelado:'bg-red-100 text-red-700',
}
const priorityColors: Record<string,string> = {
  baixa:'bg-gray-100 text-gray-600', normal:'bg-blue-100 text-blue-700',
  alta:'bg-orange-100 text-orange-700', urgente:'bg-red-100 text-red-700',
}
const taskStatusColors: Record<string,string> = {
  pending:'bg-gray-100 text-gray-600', in_progress:'bg-blue-100 text-blue-700',
  completed:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700',
}
const taskStatusLabels: Record<string,string> = {
  pending:'Pendente', in_progress:'Em progresso', completed:'Concluída', cancelled:'Cancelada',
}
const historyIcon: Record<string,React.ReactNode> = {
  criado:        <CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5"/>,
  estado:        <ArrowRightLeft size={14} className="text-blue-500 flex-shrink-0 mt-0.5"/>,
  tecnico:       <AlertTriangle size={14} className="text-gray-400 flex-shrink-0 mt-0.5"/>,
  encaminhamento:<ArrowRightLeft size={14} className="text-purple-500 flex-shrink-0 mt-0.5"/>,
  tarefa_criada: <ClipboardList size={14} className="text-indigo-500 flex-shrink-0 mt-0.5"/>,
  anexo:         <Paperclip size={14} className="text-gray-400 flex-shrink-0 mt-0.5"/>,
}

function fmt(d: string) {
  return new Date(d).toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).replace(',','')
}
function fmtBytes(b: number) {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB'
  return (b/1048576).toFixed(1) + ' MB'
}

function Card({ title, color, children, id, badge }: { title: string; color?: string; children: React.ReactNode; id?: string; badge?: React.ReactNode }) {
  return (
    <div id={id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={clsx('flex items-center justify-between px-5 py-3 border-b',
        color ? `border-${color}-100 bg-${color}-50` : 'border-gray-100')}>
        <h2 className={clsx('font-semibold text-sm', color ? `text-${color}-800` : 'text-gray-800')}>{title}</h2>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function TicketShow({ ticket, users, serviceAreas, teams, contacts }: any) {
  const isClosed = ['resolvido','encerrado','cancelado'].includes(ticket.status)

  const statusForm   = useForm({ status: ticket.status, note: '' })
  const routeForm    = useForm({ service_area_id: ticket.service_area_id ?? '', assigned_to: ticket.assigned_to ?? '' })
  const assignForm   = useForm({ assigned_to: ticket.assigned_to ?? '' })
  const cancelForm   = useForm({ cancellation_reason: '' })
  const taskForm     = useForm({ title: `Tarefa de ${ticket.reference}`, description: ticket.title })
  const publicForm   = useForm({ body: '', type: 'public' })
  const internalForm = useForm({ body: '', type: 'internal' })
  const contactForm  = useForm({ contact_id: ticket.contact_id ?? '' })
  const attachForm   = useForm({ file: null as File|null })

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [editContact, setEditContact]         = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const publicComments   = (ticket.comments ?? []).filter((c: any) => c.type === 'public')
  const internalComments = (ticket.comments ?? []).filter((c: any) => c.type === 'internal')
  const tasks            = ticket.tasks ?? []
  const attachments      = ticket.attachments ?? []

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function submitCancel() {
    cancelForm.post(`/pedidos/${ticket.id}/cancelar`, {
      onSuccess: () => { setShowCancelModal(false); cancelForm.reset() }
    })
  }

  function submitContact() {
    contactForm.patch(`/pedidos/${ticket.id}/contacto`, {
      onSuccess: () => setEditContact(false)
    })
  }

  function removeContact() {
    if (!confirm('Remover o contacto associado?')) return
    router.patch(`/pedidos/${ticket.id}/contacto`, { contact_id: null })
  }

  function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    router.post(`/pedidos/${ticket.id}/anexos`, fd as any, { forceFormData: true })
  }

  return (
    <AdminLayout title={`Pedido ${ticket.reference}`}>
      <Head title={`${ticket.reference} — JuntaOS`}/>
      <div className="p-4 md:p-6 space-y-4">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <a href="/pedidos" className="hover:text-primary-600">Pedidos</a>
          <ChevronRight size={14}/>
          <span className="text-primary-600 font-medium font-mono">{ticket.reference}</span>
        </nav>

        {/* ── AÇÕES RÁPIDAS ── */}
        {!isClosed && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Ações rápidas</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => scrollTo('estado')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 transition-colors">
                <RefreshCw size={13}/> Mudar estado
              </button>
              <button onClick={() => scrollTo('encaminhar')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-700 transition-colors">
                <ArrowRightLeft size={13}/> Encaminhamento interno
              </button>
              <button onClick={() => scrollTo('atribuir')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-green-300 hover:text-green-700 transition-colors">
                <UserCheck size={13}/> Atribuir responsável
              </button>
              <button onClick={() => scrollTo('municipe')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 transition-colors">
                <MessageSquare size={13}/> Responder ao munícipe
              </button>
              <button onClick={() => scrollTo('nota')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-amber-300 hover:text-amber-700 transition-colors">
                <StickyNote size={13}/> Adicionar nota interna
              </button>
              <button onClick={() => scrollTo('anexos')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors">
                <Paperclip size={13}/> Anexar ficheiro
              </button>
              <button onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors ml-auto">
                <AlertCircle size={13}/> Cancelar pedido
              </button>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-primary-600 mb-1">{ticket.reference}</p>
              <h1 className="text-xl font-bold text-gray-900 mb-3">{ticket.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-medium border', statusColors[ticket.status])}>
                  {STATUS_LABELS[ticket.status] ?? ticket.status}
                </span>
                <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-medium', priorityColors[ticket.priority])}>
                  {ticket.priority}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                <p><span className="font-semibold text-gray-700">Tipo:</span> <span className="text-gray-600">{ticket.ticket_type ?? '—'}</span></p>
                <p><span className="font-semibold text-gray-700">Organização:</span> <span className="text-gray-600">Junta de Freguesia</span></p>
                <p><span className="font-semibold text-gray-700">Responsável:</span> <span className="text-gray-600">{ticket.assignee?.name ?? 'Não definido'}</span></p>
                <p><span className="font-semibold text-gray-700">Tema:</span> <span className="text-gray-600">{ticket.tema || '—'}</span></p>
                <p><span className="font-semibold text-gray-700">Departamento:</span> <span className="text-gray-600">{ticket.department || '—'}</span></p>
                <p><span className="font-semibold text-gray-700">Equipa:</span> <span className="text-gray-600">{ticket.team?.name ?? '—'}</span></p>
              </div>
            </div>

            {/* Contacto associado */}
            <div className="sm:w-60 flex-shrink-0">
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacto associado</p>
                  {!editContact && (
                    <div className="flex gap-1">
                      <button onClick={() => setEditContact(true)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors" title="Alterar contacto">
                        <Edit2 size={12}/>
                      </button>
                      {ticket.contact && (
                        <button onClick={removeContact}
                          className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors" title="Remover contacto">
                          <X size={12}/>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {editContact ? (
                  <div className="space-y-2">
                    <select value={contactForm.data.contact_id}
                      onChange={e => contactForm.setData('contact_id', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent">
                      <option value="">— Sem contacto —</option>
                      {contacts?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={submitContact} disabled={contactForm.processing}
                        className="flex-1 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                        Guardar
                      </button>
                      <button onClick={() => setEditContact(false)}
                        className="flex-1 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : ticket.contact ? (
                  <>
                    <a href={`/municipes/${ticket.contact.id}`} className="text-sm font-medium text-primary-700 hover:underline block">{ticket.contact.name}</a>
                    {ticket.contact.email && <p className="text-xs text-gray-500 mt-0.5">{ticket.contact.email}</p>}
                    {ticket.contact.phone && <p className="text-xs text-gray-500">{ticket.contact.phone}</p>}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">Sem contacto associado</p>
                )}
              </div>
              {ticket.cancellation_reason && (
                <div className="mt-3 px-3 py-2 bg-red-50 rounded-lg border border-red-100 text-xs text-red-700">
                  <span className="font-semibold">Motivo cancelamento:</span> {ticket.cancellation_reason}
                </div>
              )}
            </div>
          </div>
          {ticket.validation_status && ticket.validation_status !== 'nao_aplicavel' && (
            <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 text-sm">
              <span className="font-semibold text-gray-700">Validação:</span>{' '}
              <span className="capitalize text-gray-600">{ticket.validation_status}</span>
            </div>
          )}
        </div>

        {/* ── DESCRIÇÃO ── */}
        {ticket.description && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Descrição</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{ticket.description}</p>
          </div>
        )}

        {/* ── PROGRESSO OPERACIONAL ── */}
        <Card title="Progresso operacional" id="progresso">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-500">{ticket.tasks_done}/{ticket.tasks_total} tarefas concluídas</p>
            <span className="text-sm font-bold text-primary-600">{ticket.progress ?? 0}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{width:`${ticket.progress ?? 0}%`}}/>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="font-bold text-gray-800">{ticket.tasks_total ?? 0}</p>
              <p className="text-xs text-gray-500">Totais</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <p className="font-bold text-green-700">{ticket.tasks_done ?? 0}</p>
              <p className="text-xs text-green-600">Concluídas</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="font-bold text-blue-700">{(ticket.tasks_total ?? 0) - (ticket.tasks_done ?? 0)}</p>
              <p className="text-xs text-blue-600">Abertas</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="font-bold text-gray-500">{tasks.filter((t: any) => t.status === 'cancelled').length}</p>
              <p className="text-xs text-gray-400">Canceladas</p>
            </div>
          </div>
        </Card>

        {/* ── AÇÕES (apenas se não fechado) ── */}
        {!isClosed && (<>

          {/* Encaminhamento + Mudar estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Card title="Encaminhamento interno" color="blue" id="encaminhar">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3 text-xs text-blue-700 space-y-0.5">
                <p><strong>Área funcional:</strong> {ticket.service_area?.name ?? 'Sem área funcional'}</p>
                <p><strong>Responsável:</strong> {ticket.assignee?.name ?? 'Não definido'}</p>
              </div>
              <div className="space-y-2 mb-3">
                <select value={routeForm.data.service_area_id}
                  onChange={e => routeForm.setData('service_area_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent">
                  <option value="">Sem área funcional</option>
                  {serviceAreas?.map((sa: any) => <option key={sa.id} value={sa.id}>{sa.name}</option>)}
                </select>
                <select value={routeForm.data.assigned_to}
                  onChange={e => routeForm.setData('assigned_to', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent">
                  <option value="">Sem responsável</option>
                  {users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              {!ticket.service_area_id && (
                <p className="text-xs text-red-500 mb-2">Este pedido está sem área funcional definida.</p>
              )}
              <button onClick={() => routeForm.post(`/pedidos/${ticket.id}/encaminhar`)}
                disabled={routeForm.processing}
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                Guardar encaminhamento
              </button>
            </Card>

            <Card title="Mudar estado" id="estado">
              <div className="space-y-2 mb-3">
                <select value={statusForm.data.status}
                  onChange={e => statusForm.setData('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent">
                  {Object.entries(STATUS_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <textarea value={statusForm.data.note}
                  onChange={e => statusForm.setData('note', e.target.value)}
                  rows={4} placeholder="Notas da atualização..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"/>
              </div>
              <button onClick={() => statusForm.patch(`/pedidos/${ticket.id}`)}
                disabled={statusForm.processing}
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                Atualizar estado
              </button>
            </Card>
          </div>

          {/* Atribuir responsável */}
          <Card title="Atribuir responsável" id="atribuir">
            <div className="flex flex-col sm:flex-row gap-2">
              <select value={assignForm.data.assigned_to}
                onChange={e => assignForm.setData('assigned_to', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent">
                <option value="">Sem responsável</option>
                {users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <button onClick={() => assignForm.patch(`/pedidos/${ticket.id}/atribuir`)}
                disabled={assignForm.processing}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 whitespace-nowrap">
                Guardar
              </button>
            </div>
          </Card>

          {/* Criar tarefa */}
          <Card title="Tarefas" color="indigo" id="tarefa"
            badge={<span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{tasks.length}</span>}>
            <div className="space-y-2 mb-4">
              <input value={taskForm.data.title}
                onChange={e => taskForm.setData('title', e.target.value)}
                placeholder="Título da tarefa"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent"/>
              <textarea value={taskForm.data.description}
                onChange={e => taskForm.setData('description', e.target.value)}
                rows={3} placeholder="Descrição (opcional)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"/>
              <button onClick={() => taskForm.post(`/pedidos/${ticket.id}/gerar-tarefa`)}
                disabled={taskForm.processing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                <CheckSquare size={14}/> Gerar tarefa
              </button>
            </div>
            {tasks.length > 0 && (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Tarefa</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Responsável</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tasks.map((t: any) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <a href={`/tarefas/${t.id}`} className="font-medium text-primary-700 hover:underline">{t.title}</a>
                        </td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{t.assignee?.name ?? '—'}</td>
                        <td className="px-3 py-2">
                          <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', taskStatusColors[t.status])}>
                            {taskStatusLabels[t.status] ?? t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {tasks.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sem tarefas geradas ainda.</p>
            )}
          </Card>
        </>)}

        {/* Tarefas (read-only, quando fechado) */}
        {isClosed && tasks.length > 0 && (
          <Card title="Tarefas" color="indigo"
            badge={<span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{tasks.length}</span>}>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Tarefa</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Responsável</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <a href={`/tarefas/${t.id}`} className="font-medium text-primary-700 hover:underline">{t.title}</a>
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{t.assignee?.name ?? '—'}</td>
                      <td className="px-3 py-2">
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', taskStatusColors[t.status])}>
                          {taskStatusLabels[t.status] ?? t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ── COMUNICAÇÃO + NOTAS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Comunicação com o munícipe */}
          <Card title="Comunicação com o munícipe" id="municipe">
            <p className="text-xs text-gray-400 mb-3">Visível no Portal do Munícipe.</p>
            <textarea value={publicForm.data.body}
              onChange={e => publicForm.setData('body', e.target.value)}
              rows={3} placeholder="Escreva a resposta..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none mb-3 focus:ring-2 focus:ring-primary-400 focus:border-transparent"/>
            <button onClick={() => publicForm.post(`/pedidos/${ticket.id}/comentarios`, { onSuccess: () => publicForm.reset() })}
              disabled={publicForm.processing || !publicForm.data.body}
              className="flex items-center gap-2 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 mb-5">
              <Globe size={13}/> Enviar resposta pública
            </button>
            {publicComments.length === 0 ? (
              <p className="text-sm text-gray-400">Sem respostas públicas.</p>
            ) : (
              <div className="space-y-3">
                {publicComments.map((c: any) => (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                      {(c.user?.name ?? c.contact?.name ?? '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-gray-700">{c.user?.name ?? c.contact?.name}</span>
                        <span className="text-xs text-gray-400">{fmt(c.created_at)}</span>
                        <span className="flex items-center gap-1 text-xs text-blue-600"><Globe size={9}/> Público</span>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Notas internas */}
          <Card title="Notas internas" id="nota">
            <p className="text-xs text-gray-400 mb-3">Nunca visíveis no Portal do Munícipe.</p>
            <textarea value={internalForm.data.body}
              onChange={e => internalForm.setData('body', e.target.value)}
              rows={3} placeholder="Escreva a nota..."
              className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm resize-none mb-3 focus:ring-2 focus:ring-amber-300 focus:border-transparent bg-amber-50"/>
            <button onClick={() => {
              internalForm.setData('type','internal')
              internalForm.post(`/pedidos/${ticket.id}/comentarios`, { onSuccess: () => internalForm.reset() })
            }}
              disabled={internalForm.processing || !internalForm.data.body}
              className="flex items-center gap-2 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 mb-5">
              <Lock size={13}/> Guardar nota interna
            </button>
            {internalComments.length === 0 ? (
              <p className="text-sm text-gray-400">Sem notas internas.</p>
            ) : (
              <div className="space-y-3">
                {internalComments.map((c: any) => (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 flex-shrink-0">
                      {(c.user?.name ?? '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-gray-700">{c.user?.name}</span>
                        <span className="text-xs text-gray-400">{fmt(c.created_at)}</span>
                        <span className="flex items-center gap-1 text-xs text-amber-600"><Lock size={9}/> Interno</span>
                      </div>
                      <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── ANEXOS ── */}
        <Card title="Anexos" id="anexos"
          badge={attachments.length > 0 ? <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{attachments.length}</span> : undefined}>
          <div className="mb-4">
            <input ref={fileRef} type="file" className="hidden" onChange={uploadFile}/>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors w-full justify-center">
              <Upload size={15}/> Clique para anexar ficheiro (máx. 20 MB)
            </button>
          </div>
          {attachments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">Sem anexos.</p>
          ) : (
            <div className="space-y-2">
              {attachments.map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <FileText size={18} className="text-gray-400 flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{a.original_name}</p>
                    <p className="text-xs text-gray-400">{fmtBytes(a.size)} · {a.user?.name} · {fmt(a.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={a.url ?? `/storage/${a.filename}`} target="_blank" rel="noreferrer"
                      className="text-xs text-primary-600 hover:underline">Abrir</a>
                    <button onClick={() => router.delete(`/pedidos/${ticket.id}/anexos/${a.id}`)}
                      className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── HISTÓRICO ── */}
        <Card title="Histórico">
          {(ticket.status_history ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">Sem histórico.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {(ticket.status_history ?? []).map((h: any) => {
                let label = ''
                if (h.event_type === 'criado')             label = 'Pedido criado'
                else if (h.event_type === 'tecnico')       label = 'Evento técnico'
                else if (h.event_type === 'encaminhamento')label = 'Encaminhamento interno'
                else if (h.event_type === 'tarefa_criada') label = 'Tarefa criada'
                else if (h.event_type === 'anexo')         label = 'Ficheiro anexado'
                else if (h.from_status)                    label = `Estado: ${STATUS_LABELS[h.from_status]??h.from_status} → ${STATUS_LABELS[h.to_status]??h.to_status}`
                else                                       label = `Estado inicial: ${STATUS_LABELS[h.to_status]??h.to_status}`
                return (
                  <div key={h.id} className="py-3 flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">{historyIcon[h.event_type] ?? <span className="w-3.5 h-3.5 inline-block"/>}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {h.user?.name ?? h.contact?.name ?? 'Sistema'} · {fmt(h.created_at)}
                      </p>
                      {h.note && <p className="text-sm text-gray-600 mt-1">{h.note}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

      </div>

      {/* ── MODAL CANCELAR ── */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Cancelar pedido</h3>
              <button onClick={() => setShowCancelModal(false)} className="p-1 rounded hover:bg-gray-100 text-gray-400">
                <X size={18}/>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Esta ação é irreversível. Indique o motivo do cancelamento.</p>
              <textarea value={cancelForm.data.cancellation_reason}
                onChange={e => cancelForm.setData('cancellation_reason', e.target.value)}
                rows={4} placeholder="Motivo do cancelamento..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-red-300 focus:border-transparent mb-4"/>
              <div className="flex gap-3">
                <button onClick={submitCancel} disabled={cancelForm.processing}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  Confirmar cancelamento
                </button>
                <button onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
