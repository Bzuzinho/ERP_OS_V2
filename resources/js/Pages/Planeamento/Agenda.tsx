import React, { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { CalendarDays, Clock, MapPin, Users, CheckSquare, AlertTriangle, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const EVENT_TYPE_COLORS: Record<string,string> = {
  interno:'bg-indigo-100 text-indigo-700', público:'bg-green-100 text-green-700',
  reunião:'bg-purple-100 text-purple-700', reserva:'bg-blue-100 text-blue-700',
  planeamento:'bg-orange-100 text-orange-700',
}
const EVENT_DOT: Record<string,string> = {
  interno:'#6366f1', público:'#16a34a', reunião:'#9333ea', reserva:'#0284c7', planeamento:'#ea580c',
}
const RESERVATION_STATUS: Record<string,string> = {
  pendente:'bg-yellow-100 text-yellow-700', aprovada:'bg-green-100 text-green-700',
}
const PRIORITY_COLORS: Record<string,string> = {
  low:'bg-gray-100 text-gray-500', medium:'bg-blue-100 text-blue-600', high:'bg-red-100 text-red-600',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-PT', { weekday:'short', day:'2-digit', month:'short' })
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('pt-PT', { hour:'2-digit', minute:'2-digit' })
}
function daysFromNow(d: string) {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  return `${diff}d`
}

// Merge events, reservations, and tasks into a unified sorted timeline
function buildTimeline(events: any[], reservations: any[], tasksDue: any[]) {
  const items: any[] = [
    ...events.map(e       => ({ ...e, _type: 'event',       _date: e.starts_at })),
    ...reservations.map(r => ({ ...r, _type: 'reservation', _date: r.starts_at })),
    ...tasksDue.map(t     => ({ ...t, _type: 'task',        _date: t.due_date  })),
  ]
  return items.sort((a, b) => new Date(a._date).getTime() - new Date(b._date).getTime())
}

export default function PlaneamentoAgenda({ events = [], reservations = [], tasksDue = [] }: any) {
  const [filter, setFilter] = useState<'all'|'events'|'reservations'|'tasks'>('all')
  const timeline = buildTimeline(events, reservations, tasksDue)
  const filtered = filter === 'all' ? timeline
    : timeline.filter(i =>
        (filter === 'events'       && i._type === 'event') ||
        (filter === 'reservations' && i._type === 'reservation') ||
        (filter === 'tasks'        && i._type === 'task')
      )

  return (
    <AdminLayout title="Planeamento — Agenda">
      <Head title="Planeamento: Agenda — JuntaOS"/>
      <div className="p-6 max-w-4xl mx-auto space-y-5">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Agenda Integrada</h1>
            <p className="text-sm text-gray-500 mt-0.5">Eventos, reservas e prazos de tarefas nos próximos 30 dias</p>
          </div>
          <div className="flex gap-2">
            <Link href="/agenda" className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors">Agenda completa →</Link>
            <Link href="/reservas" className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors">Reservas →</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Eventos', value: events.length, color:'text-purple-700', bg:'bg-purple-50', type:'events' },
            { label:'Reservas', value: reservations.length, color:'text-blue-700', bg:'bg-blue-50', type:'reservations' },
            { label:'Prazos de tarefas', value: tasksDue.length, color:'text-orange-700', bg:'bg-orange-50', type:'tasks' },
          ].map(s => (
            <button key={s.type} onClick={() => setFilter(filter === s.type as any ? 'all' : s.type as any)}
              className={clsx('rounded-xl border p-3 text-left transition-all',
                filter === s.type ? 'border-primary-300 shadow-md' : 'border-gray-200 bg-white hover:shadow-sm')}>
              <div className={clsx('text-2xl font-bold', s.color)}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {(['all','events','reservations','tasks'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx('px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                filter === f ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700')}>
              {f === 'all' ? `Tudo (${timeline.length})` : f === 'events' ? `Eventos (${events.length})` : f === 'reservations' ? `Reservas (${reservations.length})` : `Tarefas (${tasksDue.length})`}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
            <CalendarDays size={36} className="mx-auto mb-3 opacity-30"/>
            <p className="text-sm">Sem itens para mostrar.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item, idx) => {
              const dateStr = formatDate(item._date)
              const prevDate = idx > 0 ? formatDate(filtered[idx-1]._date) : null
              const showDateHeader = dateStr !== prevDate

              return (
                <React.Fragment key={`${item._type}-${item.id}`}>
                  {showDateHeader && (
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{dateStr}</span>
                      <div className="flex-1 border-t border-gray-100"/>
                      <span className="text-xs text-primary-600 font-medium">{daysFromNow(item._date)}</span>
                    </div>
                  )}

                  {item._type === 'event' && (
                    <Link href={`/agenda/${item.id}`}
                      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 hover:border-purple-200 hover:shadow-md transition-all group">
                      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: item.color ?? EVENT_DOT[item.type] ?? '#0284c7' }}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700 truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                          {!item.all_day && <span className="flex items-center gap-1"><Clock size={10}/>{formatTime(item.starts_at)}</span>}
                          {item.space && <span className="flex items-center gap-1"><MapPin size={10}/>{item.space.name}</span>}
                          {item.location && !item.space && <span className="flex items-center gap-1"><MapPin size={10}/>{item.location}</span>}
                          {item.participants?.length > 0 && <span className="flex items-center gap-1"><Users size={10}/>{item.participants.length}</span>}
                        </p>
                      </div>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full flex-shrink-0', EVENT_TYPE_COLORS[item.type] ?? 'bg-gray-100 text-gray-600')}>{item.type}</span>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-primary-500 flex-shrink-0"/>
                    </Link>
                  )}

                  {item._type === 'reservation' && (
                    <Link href="/reservas"
                      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 hover:border-blue-200 hover:shadow-md transition-all group">
                      <div className="w-1 self-stretch rounded-full bg-blue-400 flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700 truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                          <Clock size={10}/>{formatTime(item.starts_at)}
                          {item.space && <span className="flex items-center gap-1"><MapPin size={10}/>{item.space.name}</span>}
                          <Users size={10}/>{item.requester ?? '—'}
                        </p>
                      </div>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full flex-shrink-0', RESERVATION_STATUS[item.status] ?? 'bg-gray-100 text-gray-600')}>{item.status}</span>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-primary-500 flex-shrink-0"/>
                    </Link>
                  )}

                  {item._type === 'task' && (
                    <Link href={`/tarefas/${item.id}`}
                      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 hover:border-orange-200 hover:shadow-md transition-all group">
                      <div className="w-1 self-stretch rounded-full bg-orange-400 flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700 truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                          <CheckSquare size={10}/>Tarefa
                          {item.assignee && <span className="flex items-center gap-1"><Users size={10}/>{item.assignee.name}</span>}
                          {item.plan && <span>{item.plan.title}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {new Date(item.due_date) < new Date() && (
                          <AlertTriangle size={14} className="text-red-500"/>
                        )}
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full', PRIORITY_COLORS[item.priority] ?? 'bg-gray-100 text-gray-500')}>{item.priority}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-primary-500 flex-shrink-0"/>
                    </Link>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
