import React, { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { CalendarDays, Clock, MapPin, Users, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const eventTypeColors: Record<string, string> = {
  reuniao:     'bg-blue-100 text-blue-700',
  evento:      'bg-purple-100 text-purple-700',
  manutencao:  'bg-orange-100 text-orange-700',
  feriado:     'bg-gray-100 text-gray-600',
  outro:       'bg-gray-100 text-gray-600',
}

const reservationStatusColors: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  aprovada: 'bg-green-100 text-green-700',
  rejeitada:'bg-red-100 text-red-700',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}

export default function PlaneamentoAgenda({ events, reservations }: any) {
  const [tab, setTab] = useState<'eventos'|'reservas'>('eventos')

  return (
    <AdminLayout title="Planeamento — Agenda">
      <Head title="Planeamento: Agenda — JuntaOS"/>
      <div className="p-6 max-w-5xl mx-auto space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Agenda de Planeamento</h1>
            <p className="text-sm text-gray-500 mt-0.5">Eventos e reservas de espaços agendados</p>
          </div>
          <div className="flex gap-2">
            <Link href="/agenda" className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              Ir para Agenda
            </Link>
            <Link href="/reservas" className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              Ir para Reservas
            </Link>
          </div>
        </div>

        {/* Tabs internas */}
        <div className="flex gap-1 border-b border-gray-200">
          {(['eventos', 'reservas'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={clsx('px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
                tab === t ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700')}>
              {t === 'eventos' ? `Eventos (${events.length})` : `Reservas de Espaços (${reservations.length})`}
            </button>
          ))}
        </div>

        {tab === 'eventos' && (
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
                <CalendarDays size={36} className="mx-auto mb-2 opacity-30"/>
                <p>Sem eventos agendados.</p>
              </div>
            ) : events.map((ev: any) => (
              <div key={ev.id} className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
                <div className="flex-shrink-0 text-center w-12">
                  <div className="text-2xl font-bold text-primary-600 leading-none">
                    {new Date(ev.starts_at).getDate()}
                  </div>
                  <div className="text-xs text-gray-400 uppercase">
                    {new Date(ev.starts_at).toLocaleDateString('pt-PT', { month: 'short' })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">{ev.title}</p>
                    {ev.type && (
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', eventTypeColors[ev.type] ?? 'bg-gray-100 text-gray-600')}>
                        {ev.type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                    {!ev.all_day && (
                      <span className="flex items-center gap-1">
                        <Clock size={11}/> {formatTime(ev.starts_at)} — {formatTime(ev.ends_at)}
                      </span>
                    )}
                    {ev.space && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11}/> {ev.space.name}
                      </span>
                    )}
                    {ev.location && !ev.space && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11}/> {ev.location}
                      </span>
                    )}
                    {ev.creator && (
                      <span className="flex items-center gap-1">
                        <Users size={11}/> {ev.creator.name}
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/agenda`} className="text-gray-300 hover:text-primary-500 transition-colors flex-shrink-0">
                  <ChevronRight size={16}/>
                </Link>
              </div>
            ))}
          </div>
        )}

        {tab === 'reservas' && (
          <div className="space-y-3">
            {reservations.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
                <CalendarDays size={36} className="mx-auto mb-2 opacity-30"/>
                <p>Sem reservas de espaços pendentes.</p>
              </div>
            ) : reservations.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
                <div className="flex-shrink-0 text-center w-12">
                  <div className="text-2xl font-bold text-primary-600 leading-none">
                    {new Date(r.starts_at).getDate()}
                  </div>
                  <div className="text-xs text-gray-400 uppercase">
                    {new Date(r.starts_at).toLocaleDateString('pt-PT', { month: 'short' })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">{r.title}</p>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', reservationStatusColors[r.status] ?? 'bg-gray-100 text-gray-600')}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock size={11}/> {formatDate(r.starts_at)}
                    </span>
                    {r.space && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11}/> {r.space.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users size={11}/> {r.requester}
                    </span>
                  </div>
                </div>
                <Link href={`/reservas`} className="text-gray-300 hover:text-primary-500 transition-colors flex-shrink-0">
                  <ChevronRight size={16}/>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
