import React, { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  ChevronLeft, MapPin, Clock, CalendarDays, Users, CheckSquare,
  Edit2, Trash2, UserPlus, X, AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react'
import clsx from 'clsx'

const TYPE_COLORS: Record<string,string> = {
  interno:'#6366f1', público:'#16a34a', reunião:'#9333ea', reserva:'#0284c7', planeamento:'#ea580c',
}
const TYPE_BADGES: Record<string,string> = {
  interno:'bg-indigo-100 text-indigo-700', público:'bg-green-100 text-green-700',
  reunião:'bg-purple-100 text-purple-700', reserva:'bg-blue-100 text-blue-700',
  planeamento:'bg-orange-100 text-orange-700',
}
const TASK_STATUS: Record<string,string> = {
  pending:'bg-yellow-100 text-yellow-700', in_progress:'bg-blue-100 text-blue-700',
  completed:'bg-green-100 text-green-700', cancelled:'bg-gray-100 text-gray-500',
}
const STATUS_BADGES: Record<string,string> = {
  confirmado:'bg-green-100 text-green-700', pendente:'bg-yellow-100 text-yellow-700', recusado:'bg-red-100 text-red-700',
}
const STATUS_ICONS: Record<string, any> = {
  confirmado: CheckCircle2, pendente: Clock, recusado: XCircle,
}

function formatDt(dt: string, allDay: boolean) {
  const d = new Date(dt)
  if (allDay) return d.toLocaleDateString('pt-PT', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })
  return d.toLocaleString('pt-PT', { weekday:'long', day:'2-digit', month:'long', hour:'2-digit', minute:'2-digit' })
}

function Section({ title, icon: Icon, children, action }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          {Icon && <Icon size={14} className="text-gray-400"/>}{title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  )
}

export default function EventShow({ event, users = [], contacts = [], spaces = [] }: any) {
  const [editMode, setEditMode]   = useState(false)
  const [addingP, setAddingP]     = useState(false)

  const participants = event.participants ?? []
  const tasks        = event.tasks ?? []

  const color = event.color ?? TYPE_COLORS[event.type] ?? '#0284c7'

  const eForm = useForm({
    title:       event.title,
    description: event.description ?? '',
    starts_at:   event.starts_at?.slice(0,16) ?? '',
    ends_at:     event.ends_at?.slice(0,16) ?? '',
    type:        event.type,
    visibility:  event.visibility,
    color:       event.color ?? '#0284c7',
    location:    event.location ?? '',
    space_id:    event.space_id ? String(event.space_id) : '',
  })

  const pForm = useForm({ user_id: '', contact_id: '', role: 'participante', status: 'pendente' })

  function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    eForm.patch(`/agenda/${event.id}`, { onSuccess: () => setEditMode(false) })
  }

  function addParticipant(e: React.FormEvent) {
    e.preventDefault()
    pForm.post(`/agenda/${event.id}/participantes`, {
      preserveScroll: true,
      onSuccess: () => { pForm.reset(); setAddingP(false) },
    })
  }

  function removeParticipant(pid: number) {
    if (!confirm('Remover participante?')) return
    router.delete(`/agenda/${event.id}/participantes/${pid}`, { preserveScroll: true })
  }

  function deleteEvent() {
    if (!confirm(`Eliminar "${event.title}"?`)) return
    router.delete(`/agenda/${event.id}`, { onSuccess: () => router.visit('/agenda') })
  }

  return (
    <AdminLayout title={event.title}>
      <Head title={`${event.title} — JuntaOS`}/>
      <div className="p-6 max-w-5xl mx-auto space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/agenda" className="hover:text-primary-600 flex items-center gap-1"><ChevronLeft size={14}/>Agenda</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{event.title}</span>
        </div>

        {/* Header card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1.5" style={{ backgroundColor: color }}/>
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', TYPE_BADGES[event.type] ?? 'bg-gray-100 text-gray-600')}>{event.type}</span>
                  <span className={clsx('text-xs px-2.5 py-1 rounded-full', event.visibility === 'público' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>{event.visibility}</span>
                </div>
                <h1 className="mt-2 text-xl font-bold text-gray-900">{event.title}</h1>
                {event.description && <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setEditMode(!editMode)} className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors">
                  <Edit2 size={14}/> Editar
                </button>
                <button onClick={deleteEvent} className="flex items-center gap-1.5 text-sm border border-red-200 rounded-lg px-3 py-1.5 text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 size={14}/> Eliminar
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <Clock size={14} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                <div>
                  <p>{formatDt(event.starts_at, event.all_day)}</p>
                  {!event.all_day && <p className="text-gray-400 text-xs mt-0.5">até {formatDt(event.ends_at, false)}</p>}
                </div>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400 flex-shrink-0"/>
                  <span>{event.location}</span>
                </div>
              )}
              {event.space && (
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-gray-400 flex-shrink-0"/>
                  <span>{event.space.name}</span>
                </div>
              )}
            </div>

            {event.creator && (
              <p className="mt-3 text-xs text-gray-400">Criado por <span className="text-gray-600">{event.creator.name}</span></p>
            )}
          </div>

          {/* Edit form */}
          {editMode && (
            <form onSubmit={saveEdit} className="px-5 pb-5 pt-0 border-t border-gray-100 mt-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-4 mb-3">Editar evento</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={eForm.data.title} onChange={e => eForm.setData('title', e.target.value)} required
                  placeholder="Título" className="sm:col-span-2 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                <textarea value={eForm.data.description} onChange={e => eForm.setData('description', e.target.value)}
                  rows={2} placeholder="Descrição" className="sm:col-span-2 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Início</label>
                  <input type="datetime-local" value={eForm.data.starts_at} onChange={e => eForm.setData('starts_at', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fim</label>
                  <input type="datetime-local" value={eForm.data.ends_at} onChange={e => eForm.setData('ends_at', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                </div>
                <select value={eForm.data.type} onChange={e => eForm.setData('type', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                  {['interno','público','reunião','reserva','planeamento'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={eForm.data.visibility} onChange={e => eForm.setData('visibility', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                  <option value="interno">Interno</option>
                  <option value="público">Público</option>
                </select>
                <input value={eForm.data.location} onChange={e => eForm.setData('location', e.target.value)}
                  placeholder="Local" className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                <select value={eForm.data.space_id} onChange={e => eForm.setData('space_id', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                  <option value="">Sem espaço</option>
                  {spaces.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Cor:</label>
                  <input type="color" value={eForm.data.color} onChange={e => eForm.setData('color', e.target.value)}
                    className="h-9 w-14 border border-gray-200 rounded-lg px-1 cursor-pointer"/>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button type="submit" disabled={eForm.processing} className="text-sm bg-primary-600 text-white rounded-lg px-4 py-2 hover:bg-primary-700 disabled:opacity-50">Guardar alterações</button>
                <button type="button" onClick={() => setEditMode(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancelar</button>
              </div>
            </form>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: participants + tasks */}
          <div className="lg:col-span-2 space-y-5">

            {/* Participants */}
            <Section
              title={`Participantes (${participants.length})`}
              icon={Users}
              action={
                <button onClick={() => setAddingP(!addingP)} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  <UserPlus size={13}/> Adicionar
                </button>
              }
            >
              {addingP && (
                <form onSubmit={addParticipant} className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Utilizador interno</label>
                      <select value={pForm.data.user_id}
                        onChange={e => { pForm.setData('user_id', e.target.value); if (e.target.value) pForm.setData('contact_id', '') }}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                        <option value="">Selecionar...</option>
                        {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Contacto externo</label>
                      <select value={pForm.data.contact_id}
                        onChange={e => { pForm.setData('contact_id', e.target.value); if (e.target.value) pForm.setData('user_id', '') }}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                        <option value="">Selecionar...</option>
                        {contacts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <select value={pForm.data.role} onChange={e => pForm.setData('role', e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                      <option value="participante">Participante</option>
                      <option value="organizador">Organizador</option>
                      <option value="convidado">Convidado</option>
                    </select>
                    <select value={pForm.data.status} onChange={e => pForm.setData('status', e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                      <option value="pendente">Pendente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="recusado">Recusado</option>
                    </select>
                  </div>
                  {pForm.errors.participant && <p className="text-xs text-red-500">{pForm.errors.participant}</p>}
                  <div className="flex gap-2">
                    <button type="submit" disabled={pForm.processing} className="text-sm bg-primary-600 text-white rounded-lg px-4 py-2 hover:bg-primary-700 disabled:opacity-50">Adicionar</button>
                    <button type="button" onClick={() => setAddingP(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
                  </div>
                </form>
              )}

              {participants.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">Sem participantes ainda.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {participants.map((p: any) => {
                    const name     = p.user?.name ?? p.contact?.name ?? '—'
                    const initials = name.split(' ').map((n: string) => n[0]).slice(0,2).join('').toUpperCase()
                    const SIcon    = STATUS_ICONS[p.status]
                    return (
                      <div key={p.id} className="flex items-center gap-3 px-5 py-3 group">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex items-center justify-center flex-shrink-0">{initials}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{name}</p>
                          <p className="text-xs text-gray-400">{p.role} · {p.contact ? 'Externo' : 'Interno'}</p>
                        </div>
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full flex items-center gap-1', STATUS_BADGES[p.status] ?? 'bg-gray-100 text-gray-600')}>
                          {SIcon && <SIcon size={10}/>}{p.status}
                        </span>
                        <button onClick={() => removeParticipant(p.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition-all">
                          <X size={14}/>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Summary */}
              {participants.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 flex gap-4 text-xs text-gray-500">
                  <span className="text-green-600 font-medium">{participants.filter((p:any) => p.status==='confirmado').length} confirmados</span>
                  <span className="text-yellow-600">{participants.filter((p:any) => p.status==='pendente').length} pendentes</span>
                  <span className="text-red-500">{participants.filter((p:any) => p.status==='recusado').length} recusados</span>
                </div>
              )}
            </Section>

            {/* Tasks */}
            <Section title={`Tarefas associadas (${tasks.length})`} icon={CheckSquare}>
              {tasks.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-gray-400 mb-2">Sem tarefas associadas.</p>
                  <Link href={`/tarefas/nova`} className="text-xs text-primary-600 hover:underline">Criar tarefa</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {tasks.map((t: any) => (
                    <Link key={t.id} href={`/tarefas/${t.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group">
                      <CheckSquare size={15} className={t.status === 'completed' ? 'text-green-500 flex-shrink-0' : 'text-gray-300 flex-shrink-0'}/>
                      <div className="flex-1 min-w-0">
                        <p className={clsx('text-sm font-medium', t.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800 group-hover:text-primary-700')}>{t.title}</p>
                        {t.assignee && <p className="text-xs text-gray-400 mt-0.5">{t.assignee.name}</p>}
                      </div>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full', TASK_STATUS[t.status] ?? 'bg-gray-100 text-gray-600')}>
                        {t.status?.replace('_',' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Reservation link */}
            {event.reservation && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-1">Reserva associada</p>
                <Link href={`/reservas`} className="text-sm text-blue-700 hover:underline">{event.reservation.title ?? `Reserva #${event.reservation.id}`}</Link>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resumo</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">{participants.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Participantes</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tarefas</p>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Zona de perigo</p>
              <button onClick={deleteEvent} className="w-full flex items-center justify-center gap-2 text-sm text-red-600 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors">
                <AlertTriangle size={14}/> Eliminar evento
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
