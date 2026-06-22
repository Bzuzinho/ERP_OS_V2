import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Inbox, CheckSquare, MapPin, Clock, AlertTriangle, ChevronRight, Package } from 'lucide-react'
import clsx from 'clsx'

const priorityColors: Record<string, string> = {
  low:    'bg-gray-100 text-gray-500',
  medium: 'bg-blue-100 text-blue-600',
  high:   'bg-orange-100 text-orange-700',
}
const priorityLabels: Record<string, string> = {
  low: 'Baixa', medium: 'Média', high: 'Alta',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })
}

export default function PlaneamentoRequisicoes({ spacePending, tasksPendingValidation }: any) {
  const [tab, setTab] = useState<'espacos'|'tarefas'>('espacos')

  function approveReservation(id: number) {
    router.post(`/reservas/${id}/aprovar`, {})
  }
  function rejectReservation(id: number) {
    router.post(`/reservas/${id}/rejeitar`, { rejection_reason: 'Rejeitado via Planeamento' })
  }
  function validateTask(id: number) {
    router.post(`/tarefas/${id}/validar`, { action: 'validado' })
  }

  return (
    <AdminLayout title="Planeamento — Requisições">
      <Head title="Planeamento: Requisições — JuntaOS"/>
      <div className="p-4 md:p-6 space-y-5">

        <div>
          <h1 className="text-xl font-bold text-gray-900">Requisições Pendentes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pedidos de espaços e tarefas a aguardar validação</p>
        </div>

        {/* Resumo rápido */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-yellow-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <MapPin size={20} className="text-yellow-600"/>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{spacePending.length}</p>
                <p className="text-sm text-gray-500">Reservas de espaço</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <CheckSquare size={20} className="text-blue-600"/>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{tasksPendingValidation.length}</p>
                <p className="text-sm text-gray-500">Tarefas a validar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs internas */}
        <div className="flex gap-1 border-b border-gray-200">
          {([['espacos','Espaços'], ['tarefas','Tarefas']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={clsx('px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === key ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700')}>
              {label === 'Espaços' ? `Reservas de Espaços (${spacePending.length})` : `Tarefas para Validar (${tasksPendingValidation.length})`}
            </button>
          ))}
        </div>

        {tab === 'espacos' && (
          <div className="space-y-3">
            {spacePending.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
                <Inbox size={36} className="mx-auto mb-2 opacity-30"/>
                <p>Sem reservas pendentes de aprovação.</p>
              </div>
            ) : spacePending.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl border border-yellow-200 shadow-sm px-5 py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{r.title}</p>
                    {r.purpose && <p className="text-sm text-gray-500 mt-0.5">{r.purpose}</p>}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2 flex-wrap">
                      <span className="flex items-center gap-1"><Clock size={11}/> {formatDate(r.starts_at)}</span>
                      {r.space && <span className="flex items-center gap-1"><MapPin size={11}/> {r.space.name}</span>}
                      <span>Pedido por: <strong className="text-gray-600">{r.requester}</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => rejectReservation(r.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                      Rejeitar
                    </button>
                    <button onClick={() => approveReservation(r.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                      Aprovar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'tarefas' && (
          <div className="space-y-3">
            {tasksPendingValidation.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
                <CheckSquare size={36} className="mx-auto mb-2 opacity-30"/>
                <p>Sem tarefas a aguardar validação.</p>
              </div>
            ) : tasksPendingValidation.map((t: any) => (
              <div key={t.id} className="bg-white rounded-xl border border-blue-100 shadow-sm px-5 py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 truncate">{t.title}</p>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', priorityColors[t.priority] ?? 'bg-gray-100 text-gray-500')}>
                        {priorityLabels[t.priority] ?? t.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1 flex-wrap">
                      {t.due_date && (
                        <span className={clsx('flex items-center gap-1', new Date(t.due_date) < new Date() ? 'text-red-500' : '')}>
                          {new Date(t.due_date) < new Date() && <AlertTriangle size={10}/>}
                          <Clock size={11}/> {formatDate(t.due_date)}
                        </span>
                      )}
                      {t.assignee && <span>Responsável: <strong className="text-gray-600">{t.assignee.name}</strong></span>}
                      {t.team && <span>Equipa: <strong className="text-gray-600">{t.team.name}</strong></span>}
                      {t.materials_count > 0 && (
                        <span className="flex items-center gap-1 text-orange-500">
                          <Package size={11}/> {t.materials_count} material{t.materials_count > 1 ? 'is' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 items-center">
                    <Link href={`/tarefas/${t.id}`} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Ver
                    </Link>
                    <button onClick={() => validateTask(t.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                      Validar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
