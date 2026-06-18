import React, { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  Calendar, MapPin, User, Clock, Users, Check, X,
  ChevronRight, ClipboardList, ExternalLink, AlertCircle, Trash2
} from 'lucide-react'
import clsx from 'clsx'

const statusColors: Record<string,string> = {
  pendente:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  aprovada:  'bg-green-100 text-green-700 border-green-200',
  rejeitada: 'bg-red-100 text-red-700 border-red-200',
  cancelada: 'bg-gray-100 text-gray-600 border-gray-200',
}
const statusLabels: Record<string,string> = {
  pendente: 'Pendente', aprovada: 'Aprovada', rejeitada: 'Rejeitada', cancelada: 'Cancelada',
}

const taskStatusColors: Record<string,string> = {
  pending:     'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-gray-100 text-gray-500',
}
const taskStatusLabels: Record<string,string> = {
  pending: 'Pendente', in_progress: 'Em progresso', completed: 'Concluída', cancelled: 'Cancelada',
}

function fmt(d: string | null, opts?: Intl.DateTimeFormatOptions) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-PT', opts ?? {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function duration(starts: string, ends: string) {
  const mins = Math.round((new Date(ends).getTime() - new Date(starts).getTime()) / 60000)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export default function ReservationsShow({ reservation }: any) {
  const [rejecting, setRejecting] = useState(false)
  const rejectForm = useForm({ rejection_reason: '' })

  function approve() {
    if (confirm('Aprovar esta reserva?'))
      router.post(`/reservas/${reservation.id}/aprovar`)
  }

  function reject() {
    rejectForm.post(`/reservas/${reservation.id}/rejeitar`, {
      onSuccess: () => setRejecting(false),
    })
  }

  function destroy() {
    if (confirm('Cancelar esta reserva? Esta acção não pode ser desfeita.')) {
      router.delete(`/reservas/${reservation.id}`)
    }
  }

  const isPending  = reservation.status === 'pendente'
  const isApproved = reservation.status === 'aprovada'

  return (
    <AdminLayout title={reservation.title}>
      <Head title={`${reservation.title} — JuntaOS`}/>
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <a href="/reservas" className="hover:text-primary-600">Reservas</a>
          <ChevronRight size={14}/>
          <span className="text-gray-900 font-medium truncate max-w-xs">{reservation.title}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{reservation.title}</h1>
                <span className={clsx('px-3 py-1 rounded-full text-sm font-medium border', statusColors[reservation.status])}>
                  {statusLabels[reservation.status]}
                </span>
              </div>
              {reservation.purpose && (
                <p className="text-gray-500 text-sm mt-1">{reservation.purpose}</p>
              )}
            </div>
            {isPending && (
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={approve}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                  <Check size={15}/> Aprovar
                </button>
                <button onClick={() => setRejecting(true)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium">
                  <X size={15}/> Rejeitar
                </button>
              </div>
            )}
          </div>

          {/* Rejection reason */}
          {reservation.status === 'rejeitada' && reservation.rejection_reason && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-2">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="text-sm font-medium text-red-700">Motivo da rejeição</p>
                <p className="text-sm text-red-600 mt-0.5">{reservation.rejection_reason}</p>
              </div>
            </div>
          )}

          {/* Reject inline form */}
          {rejecting && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Motivo da rejeição (opcional)</p>
              <textarea value={rejectForm.data.rejection_reason}
                onChange={e => rejectForm.setData('rejection_reason', e.target.value)}
                rows={3} placeholder="Descreva o motivo..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 resize-none mb-3"/>
              <div className="flex gap-2">
                <button onClick={reject} disabled={rejectForm.processing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  Confirmar Rejeição
                </button>
                <button onClick={() => setRejecting(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Details */}
          <div className="md:col-span-2 space-y-5">

            {/* Date/time */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-primary-600"/> Data e Hora
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Início</p>
                  <p className="text-sm font-semibold text-gray-800">{fmt(reservation.starts_at)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Fim</p>
                  <p className="text-sm font-semibold text-gray-800">{fmt(reservation.ends_at)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <Clock size={14}/>
                Duração: <span className="font-medium text-gray-700">{duration(reservation.starts_at, reservation.ends_at)}</span>
                {reservation.expected_attendees && (
                  <>
                    <span className="mx-2">·</span>
                    <Users size={14}/>
                    <span className="font-medium text-gray-700">{reservation.expected_attendees} participantes previstos</span>
                  </>
                )}
              </div>
            </div>

            {/* Linked event */}
            {reservation.event && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h2 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-green-600"/> Evento Criado
                </h2>
                <a href={`/agenda/${reservation.event.id}`}
                  className="flex items-center gap-2 text-sm text-green-700 hover:text-green-900 font-medium">
                  <ExternalLink size={14}/>
                  {reservation.event.title}
                </a>
              </div>
            )}

            {/* Tasks */}
            {reservation.tasks && reservation.tasks.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ClipboardList size={16} className="text-blue-600"/>
                  Tarefas associadas
                </h2>
                <div className="divide-y divide-gray-100">
                  {reservation.tasks.map((t: any) => (
                    <a key={t.id} href={`/tarefas/${t.id}`}
                      className="flex items-center gap-3 py-2.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg group transition-colors">
                      <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0', taskStatusColors[t.status] ?? 'bg-gray-100 text-gray-500')}>
                        {taskStatusLabels[t.status] ?? t.status}
                      </span>
                      <span className="flex-1 text-sm text-gray-700 truncate group-hover:text-primary-600">{t.title}</span>
                      {t.assignee && <span className="text-xs text-gray-400">{t.assignee.name}</span>}
                      <ChevronRight size={14} className="text-gray-300 flex-shrink-0"/>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Space */}
            {reservation.space && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <MapPin size={15} className="text-primary-600"/> Espaço
                </h2>
                <p className="font-medium text-gray-900">{reservation.space.name}</p>
                {reservation.space.location && (
                  <p className="text-sm text-gray-500 mt-0.5">{reservation.space.location}</p>
                )}
                <a href="/espacos" className="text-xs text-primary-600 hover:underline mt-2 inline-block">
                  Ver espaços →
                </a>
              </div>
            )}

            {/* Requester */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                <User size={15} className="text-primary-600"/> Requerente
              </h2>
              {reservation.contact ? (
                <div>
                  <p className="font-medium text-gray-900">{reservation.contact.name}</p>
                  {reservation.contact.email && (
                    <a href={`mailto:${reservation.contact.email}`} className="text-sm text-primary-600 hover:underline">
                      {reservation.contact.email}
                    </a>
                  )}
                  <a href={`/municipes`} className="text-xs text-gray-400 hover:text-primary-600 mt-1 block">
                    Munícipe →
                  </a>
                </div>
              ) : reservation.user ? (
                <div>
                  <p className="font-medium text-gray-900">{reservation.user.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Utilizador interno</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </div>

            {/* Review info */}
            {reservation.reviewer && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-800 mb-3 text-sm">Revisão</h2>
                <p className="text-sm text-gray-700">
                  <span className="text-gray-500">Por:</span> {reservation.reviewer.name}
                </p>
                {reservation.reviewed_at && (
                  <p className="text-sm text-gray-500 mt-1">
                    {fmt(reservation.reviewed_at, { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </p>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-3 text-sm">Informação</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Criada</dt>
                  <dd className="text-gray-700">
                    {fmt(reservation.created_at, { day:'2-digit', month:'short', year:'numeric' })}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">ID</dt>
                  <dd className="text-gray-400">#{reservation.id}</dd>
                </div>
              </dl>
            </div>

            {/* Danger */}
            {(isPending || isApproved) && (
              <div className="bg-white rounded-xl border border-red-100 p-5">
                <h2 className="font-semibold text-red-700 mb-3 text-sm">Zona de Perigo</h2>
                <button onClick={destroy}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                  <Trash2 size={14}/> Cancelar Reserva
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
