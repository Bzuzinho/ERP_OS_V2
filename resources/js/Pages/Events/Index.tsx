import React, { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  Plus, X, ChevronLeft, ChevronRight, MapPin, Users,
  Clock, CalendarDays, Trash2, CheckSquare, UserPlus, ExternalLink,
} from 'lucide-react'
import clsx from 'clsx'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const TYPE_COLORS: Record<string,string> = {
  interno:     '#6366f1',
  público:     '#16a34a',
  reunião:     '#9333ea',
  reserva:     '#0284c7',
  planeamento: '#ea580c',
}
const TYPE_BADGES: Record<string,string> = {
  interno:     'bg-indigo-100 text-indigo-700',
  público:     'bg-green-100 text-green-700',
  reunião:     'bg-purple-100 text-purple-700',
  reserva:     'bg-blue-100 text-blue-700',
  planeamento: 'bg-orange-100 text-orange-700',
}
const STATUS_BADGES: Record<string,string> = {
  confirmado: 'bg-green-100 text-green-700',
  pendente:   'bg-yellow-100 text-yellow-700',
  recusado:   'bg-red-100 text-red-700',
}

function formatDt(dt: string, allDay: boolean) {
  const d = new Date(dt)
  if (allDay) return d.toLocaleDateString('pt-PT', { weekday:'short', day:'2-digit', month:'long' })
  return d.toLocaleString('pt-PT', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
}

// ── Slide-over de detalhe ─────────────────────────────────────────────────────
function EventPanel({ event, users, contacts, plans, onClose }: any) {
  const [addingP, setAddingP] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const pForm = useForm({ user_id: '', contact_id: '', role: 'participante', status: 'pendente' })
  const eForm = useForm({
    title:       event.title,
    description: event.description ?? '',
    starts_at:   event.starts_at?.replace('T',' ').slice(0,16) ?? '',
    ends_at:     event.ends_at?.replace('T',' ').slice(0,16) ?? '',
    type:        event.type,
    visibility:  event.visibility,
    color:       event.color ?? '#0284c7',
    location:    event.location ?? '',
    plan_id:     event.plan_id ? String(event.plan_id) : '',
  })

  const participants = event.participants ?? []
  const tasks        = event.tasks ?? []

  function addParticipant(e: React.FormEvent) {
    e.preventDefault()
    pForm.post(`/agenda/${event.id}/participantes`, {
      preserveScroll: true,
      onSuccess: () => { pForm.reset(); setAddingP(false) },
    })
  }

  function removeParticipant(pid: number) {
    router.delete(`/agenda/${event.id}/participantes/${pid}`, { preserveScroll: true })
  }

  function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    eForm.patch(`/agenda/${event.id}`, { preserveScroll: true, onSuccess: () => setEditMode(false) })
  }

  function deleteEvent() {
    if (!confirm(`Eliminar "${event.title}"?`)) return
    router.delete(`/agenda/${event.id}`, { onSuccess: onClose })
  }

  const color = event.color ?? TYPE_COLORS[event.type] ?? '#0284c7'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-5 border-b border-gray-100" style={{ borderTop: `4px solid ${color}` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', TYPE_BADGES[event.type] ?? 'bg-gray-100 text-gray-600')}>
              {event.type}
            </span>
            <h2 className="mt-1.5 text-base font-bold text-gray-900 leading-tight">{event.title}</h2>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Link href={`/agenda/${event.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100 text-xs" title="Ver página completa">
              ↗
            </Link>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <X size={16}/>
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-gray-400"/>
            <span>{formatDt(event.starts_at, event.all_day)}</span>
            {!event.all_day && <span className="text-gray-400">→ {formatDt(event.ends_at, false)}</span>}
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-gray-400"/>
              <span>{event.location}</span>
            </div>
          )}
          {event.space && (
            <div className="flex items-center gap-2">
              <CalendarDays size={13} className="text-gray-400"/>
              <span>{event.space.name}</span>
            </div>
          )}
          {event.reservation && (
            <div className="flex items-center gap-2">
              <ExternalLink size={13} className="text-gray-400"/>
              <Link href={`/reservas/${event.reservation.id}`} className="text-primary-600 hover:underline text-sm">
                Ver reserva
              </Link>
            </div>
          )}
          {event.plan && (
            <div className="flex items-center gap-2">
              <ExternalLink size={13} className="text-gray-400"/>
              <Link href={`/planeamento/${event.plan.id}`} className="text-primary-600 hover:underline text-sm">
                Plano: {event.plan.title}
              </Link>
            </div>
          )}
        </div>

        {event.description && (
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">{event.description}</p>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">

        {/* Edit form */}
        {editMode ? (
          <form onSubmit={saveEdit} className="p-5 space-y-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Editar evento</p>
            <input value={eForm.data.title} onChange={e => eForm.setData('title', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400" placeholder="Título"/>
            <textarea value={eForm.data.description} onChange={e => eForm.setData('description', e.target.value)}
              rows={2} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400" placeholder="Descrição"/>
            <div className="grid grid-cols-2 gap-2">
              <input type="datetime-local" value={eForm.data.starts_at} onChange={e => eForm.setData('starts_at', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
              <input type="datetime-local" value={eForm.data.ends_at} onChange={e => eForm.setData('ends_at', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={eForm.data.type} onChange={e => eForm.setData('type', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
                {['interno','público','reunião','reserva','planeamento'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input value={eForm.data.location} onChange={e => eForm.setData('location', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400" placeholder="Local"/>
            </div>
            <select value={eForm.data.plan_id} onChange={e => eForm.setData('plan_id', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
              <option value="">Sem plano</option>
              {plans.map((p: any) => <option key={p.id} value={String(p.id)}>{p.title}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="submit" disabled={eForm.processing} className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 disabled:opacity-50">Guardar</button>
              <button type="button" onClick={() => setEditMode(false)} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">Cancelar</button>
            </div>
          </form>
        ) : (
          <div className="px-5 pt-4 pb-2 flex gap-2">
            <button onClick={() => setEditMode(true)} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors">
              Editar
            </button>
            <button onClick={deleteEvent} className="text-xs border border-red-200 rounded-lg px-3 py-1.5 text-red-600 hover:bg-red-50 transition-colors">
              Eliminar
            </button>
          </div>
        )}

        {/* Participants */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <Users size={12}/> Participantes ({participants.length})
            </p>
            <button onClick={() => setAddingP(!addingP)} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
              <UserPlus size={12}/> Adicionar
            </button>
          </div>

          {addingP && (
            <form onSubmit={addParticipant} className="mb-3 space-y-2 bg-gray-50 rounded-lg p-3">
              <select value={pForm.data.user_id} onChange={e => { pForm.setData('user_id', e.target.value); if (e.target.value) pForm.setData('contact_id', '') }}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
                <option value="">Utilizador interno...</option>
                {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <p className="text-xs text-center text-gray-400">ou</p>
              <select value={pForm.data.contact_id} onChange={e => { pForm.setData('contact_id', e.target.value); if (e.target.value) pForm.setData('user_id', '') }}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
                <option value="">Contacto externo...</option>
                {contacts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <select value={pForm.data.role} onChange={e => pForm.setData('role', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
                  <option value="participante">Participante</option>
                  <option value="organizador">Organizador</option>
                  <option value="convidado">Convidado</option>
                </select>
                <select value={pForm.data.status} onChange={e => pForm.setData('status', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-400">
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="recusado">Recusado</option>
                </select>
              </div>
              {pForm.errors.participant && <p className="text-xs text-red-500">{pForm.errors.participant}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={pForm.processing} className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 disabled:opacity-50">Adicionar</button>
                <button type="button" onClick={() => setAddingP(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
              </div>
            </form>
          )}

          {participants.length === 0 ? (
            <p className="text-xs text-gray-400">Sem participantes.</p>
          ) : (
            <ul className="space-y-1.5">
              {participants.map((p: any) => {
                const name = p.user?.name ?? p.contact?.name ?? '—'
                const initials = name.split(' ').map((n: string) => n[0]).slice(0,2).join('').toUpperCase()
                return (
                  <li key={p.id} className="flex items-center gap-2.5 group">
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{name}</p>
                      <p className="text-xs text-gray-400">{p.role}</p>
                    </div>
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded-full', STATUS_BADGES[p.status] ?? 'bg-gray-100 text-gray-600')}>{p.status}</span>
                    <button onClick={() => removeParticipant(p.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all">
                      <X size={12}/>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Associated tasks */}
        {tasks.length > 0 && (
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-3">
              <CheckSquare size={12}/> Tarefas ({tasks.length})
            </p>
            <ul className="space-y-1.5">
              {tasks.map((t: any) => (
                <li key={t.id}>
                  <Link href={`/tarefas/${t.id}`} className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                    <CheckSquare size={13} className={t.status === 'completed' ? 'text-green-500' : 'text-gray-300'}/>
                    <span className={clsx(t.status === 'completed' && 'line-through text-gray-400')}>{t.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function EventsIndex({ events = [], spaces = [], users = [], contacts = [], plans = [], month, year }: any) {
  const now = new Date()
  const [m, setM] = useState<number>(month ?? now.getMonth() + 1)
  const [y, setY] = useState<number>(year  ?? now.getFullYear())
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<'month'|'list'>('month')

  const { data, setData, post, processing, reset } = useForm({
    title:'', description:'', starts_at:'', ends_at:'',
    all_day: false, type:'interno', visibility:'interno',
    space_id:'', location:'', color:'#0284c7', plan_id:'',
  })

  function navigate(dir: number) {
    let nm = m + dir, ny = y
    if (nm > 12) { nm = 1; ny++ }
    if (nm < 1)  { nm = 12; ny-- }
    setM(nm); setY(ny)
    setSelectedEvent(null)
    router.get('/agenda', { month: nm, year: ny }, { preserveState: true, replace: true })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/agenda', { onSuccess: () => { reset(); setShowForm(false) } })
  }

  // Build calendar cells
  const daysInMonth  = new Date(y, m, 0).getDate()
  const firstDow     = new Date(y, m - 1, 1).getDay()
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDow + 1
    return (day >= 1 && day <= daysInMonth) ? day : null
  })

  const eventsByDay: Record<number, any[]> = {}
  events.forEach((e: any) => {
    const d = new Date(e.starts_at).getDate()
    if (!eventsByDay[d]) eventsByDay[d] = []
    eventsByDay[d].push(e)
  })

  const today = now.getDate()
  const isCurrentMonth = m === now.getMonth() + 1 && y === now.getFullYear()

  return (
    <AdminLayout title="Agenda">
      <Head title="Agenda — JuntaOS"/>
      <div className={clsx('flex h-[calc(100vh-7.5rem)]', selectedEvent && 'overflow-hidden')}>

        {/* Main calendar area */}
        <div className={clsx('flex-1 flex flex-col min-w-0 overflow-hidden transition-all', selectedEvent ? 'mr-0' : '')}>
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft size={18} className="text-gray-600"/></button>
              <h2 className="text-base font-semibold text-gray-800 min-w-[160px] text-center">{MONTHS[m-1]} {y}</h2>
              <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><ChevronRight size={18} className="text-gray-600"/></button>
              <button onClick={() => { setM(now.getMonth()+1); setY(now.getFullYear()); router.get('/agenda', {}, { preserveState: true, replace: true }) }}
                className="text-xs text-primary-600 hover:text-primary-700 ml-1">Hoje</button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button onClick={() => setView('month')} className={clsx('px-3 py-1.5 text-xs font-medium', view==='month' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50')}>Mês</button>
                <button onClick={() => setView('list')}  className={clsx('px-3 py-1.5 text-xs font-medium', view==='list'  ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50')}>Lista</button>
              </div>
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1.5 text-sm bg-primary-600 text-white rounded-xl px-4 py-2 hover:bg-primary-700 transition-colors">
                <Plus size={15}/> Novo evento
              </button>
            </div>
          </div>

          {/* Create form */}
          {showForm && (
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
              <form onSubmit={submit} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="Título *"
                  className="sm:col-span-2 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                <input type="datetime-local" value={data.starts_at} onChange={e => setData('starts_at', e.target.value)} required
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                <input type="datetime-local" value={data.ends_at} onChange={e => setData('ends_at', e.target.value)} required
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                <select value={data.type} onChange={e => setData('type', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                  {['interno','público','reunião','reserva','planeamento'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={data.space_id} onChange={e => setData('space_id', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                  <option value="">Sem espaço</option>
                  {spaces.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={data.plan_id} onChange={e => setData('plan_id', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                  <option value="">Sem plano</option>
                  {plans.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                <input value={data.location} onChange={e => setData('location', e.target.value)} placeholder="Local"
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                <div className="flex items-center gap-2">
                  <input type="color" value={data.color} onChange={e => setData('color', e.target.value)} className="h-9 w-12 border border-gray-200 rounded-lg px-1 cursor-pointer"/>
                  <button type="submit" disabled={processing} className="flex-1 text-sm bg-primary-600 text-white rounded-lg py-2 hover:bg-primary-700 disabled:opacity-50">Criar</button>
                  <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-2">✕</button>
                </div>
              </form>
            </div>
          )}

          {/* Calendar body */}
          <div className="flex-1 overflow-auto bg-white">
            {view === 'month' ? (
              <div className="min-h-full">
                {/* Day headers */}
                <div className="grid grid-cols-7 sticky top-0 z-10 bg-white border-b border-gray-100">
                  {DAYS.map(d => (
                    <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">{d}</div>
                  ))}
                </div>
                {/* Cells */}
                <div className="grid grid-cols-7 flex-1">
                  {cells.map((day, i) => {
                    const dayEvents = day ? (eventsByDay[day] ?? []) : []
                    const isToday   = isCurrentMonth && day === today
                    return (
                      <div key={i} className={clsx(
                        'min-h-[110px] p-1.5 border-b border-r border-gray-50 relative',
                        !day && 'bg-gray-50/60',
                        day && 'hover:bg-gray-50/50',
                      )}>
                        {day && (
                          <>
                            <span className={clsx(
                              'text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1',
                              isToday ? 'bg-primary-600 text-white' : 'text-gray-600'
                            )}>{day}</span>
                            <div className="space-y-0.5">
                              {dayEvents.slice(0,3).map((e: any) => (
                                <button
                                  key={e.id}
                                  onClick={() => setSelectedEvent(selectedEvent?.id === e.id ? null : e)}
                                  className={clsx(
                                    'w-full text-left text-[11px] px-1.5 py-0.5 rounded font-medium text-white truncate transition-opacity hover:opacity-80',
                                    selectedEvent?.id === e.id && 'ring-2 ring-offset-1 ring-white/60'
                                  )}
                                  style={{ backgroundColor: e.color ?? TYPE_COLORS[e.type] ?? '#0284c7' }}
                                >
                                  {e.title}
                                </button>
                              ))}
                              {dayEvents.length > 3 && (
                                <p className="text-[10px] text-gray-400 px-1">+{dayEvents.length - 3} mais</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* List view */
              <div className="divide-y divide-gray-50">
                {events.length === 0 && (
                  <div className="py-16 text-center">
                    <CalendarDays size={36} className="mx-auto text-gray-200 mb-3"/>
                    <p className="text-gray-400 text-sm">Sem eventos em {MONTHS[m-1]} {y}.</p>
                  </div>
                )}
                {events.map((e: any) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEvent(selectedEvent?.id === e.id ? null : e)}
                    className={clsx(
                      'w-full flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left',
                      selectedEvent?.id === e.id && 'bg-primary-50'
                    )}
                  >
                    <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: e.color ?? TYPE_COLORS[e.type] ?? '#0284c7' }}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{e.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDt(e.starts_at, e.all_day)}</p>
                      {e.location && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10}/>{e.location}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(e.participants?.length > 0) && (
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Users size={11}/>{e.participants.length}</span>
                      )}
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full', TYPE_BADGES[e.type] ?? 'bg-gray-100 text-gray-600')}>{e.type}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Slide-over panel */}
        {selectedEvent && (
          <div className="flex-shrink-0 w-80 xl:w-96 border-l border-gray-200 bg-white overflow-hidden flex flex-col">
            <EventPanel
              event={selectedEvent}
              users={users}
              contacts={contacts}
              plans={plans}
              onClose={() => setSelectedEvent(null)}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
