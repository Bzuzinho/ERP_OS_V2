import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { FileText, CheckSquare, Calendar, AlertTriangle, ChevronRight, Clock, Bell, Check, X } from 'lucide-react'
import clsx from 'clsx'

const statusColors: Record<string, string> = {
  aberto: 'bg-blue-100 text-blue-700',
  em_analise: 'bg-yellow-100 text-yellow-700',
  em_progresso: 'bg-indigo-100 text-indigo-700',
  aguarda_resposta: 'bg-orange-100 text-orange-700',
  resolvido: 'bg-green-100 text-green-700',
  encerrado: 'bg-gray-100 text-gray-700',
  pendente: 'bg-yellow-100 text-yellow-700',
  aprovada: 'bg-green-100 text-green-700',
  rejeitada: 'bg-red-100 text-red-700',
  cancelada: 'bg-gray-100 text-gray-700',
}

const priorityColors: Record<string, string> = {
  baixa: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-600',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
}

const ABSENCE_TYPE_LABELS: Record<string, string> = {
  'férias':              'Férias',
  falta_justificada:          'Falta justificada',
  falta_injustificada:        'Falta injustificada',
  'doença':              'Doença',
  'licença_parental':    'Lic. parental',
  'licença_paternidade': 'Lic. paternidade',
  outro:                      'Outro',
}

function StatCard({ label, value, sub, icon: Icon, color, href }: any) {
  const inner = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className={clsx('text-3xl font-bold', color)}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={clsx('p-2.5 rounded-lg', color?.replace('text-','bg-')?.replace('-700','-100') ?? 'bg-gray-100')}>
        <Icon size={22} className={color ?? 'text-gray-500'} />
      </div>
    </div>
  )
  if (href) {
    return (
      <Link href={href} className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all">
        {inner}
      </Link>
    )
  }
  return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">{inner}</div>
}

export default function Dashboard({
  stats = {}, recentTickets = [], upcomingEvents = [],
  pendingReservations = [], pendingAbsences = [], canApproveAbsences = false,
}: any) {

  function approve(id: number) {
    router.patch(`/ausencias/${id}/aprovar`, {}, { preserveScroll: true })
  }
  function reject(id: number) {
    router.patch(`/ausencias/${id}/rejeitar`, {}, { preserveScroll: true })
  }

  return (
    <AdminLayout title="Dashboard">
      <Head title="Dashboard — JuntaOS" />
      <div className="p-4 md:p-6 space-y-8">

        {/* Stats */}
        <div className={clsx('grid gap-4 grid-cols-1 sm:grid-cols-2', canApproveAbsences ? 'lg:grid-cols-5' : 'lg:grid-cols-4')}>
          <StatCard label="Pedidos abertos"    value={stats.tickets?.aberto ?? 0}       sub={`${stats.tickets?.total ?? 0} total`}            icon={FileText}      color="text-blue-600"    href="/pedidos" />
          <StatCard label="Tarefas pendentes"  value={stats.tasks?.pending ?? 0}         sub={`${stats.tasks?.total ?? 0} total`}              icon={CheckSquare}   color="text-indigo-600"  href="/tarefas" />
          <StatCard label="Reservas pendentes" value={stats.reservations?.pendente ?? 0} sub={`${stats.reservations?.aprovada ?? 0} aprovadas`} icon={Calendar}     color="text-emerald-600" href="/reservas" />
          <StatCard label="Stock baixo"        value={stats.inventory?.low_stock ?? 0}   sub="itens abaixo do mínimo"                           icon={AlertTriangle} color="text-amber-600"   href="/inventario" />
          {canApproveAbsences && (
            <StatCard label="Aprovações Pendentes" value={pendingAbsences.length} sub="ausências de RH" icon={Bell} color="text-orange-600" href="#aprovacoes-pendentes" />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tickets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Pedidos Recentes</h2>
              <Link href="/pedidos" className="text-sm text-primary-600 hover:underline flex items-center gap-1">Ver todos <ChevronRight size={14}/></Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentTickets.length === 0 && (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">Sem pedidos ainda.</p>
              )}
              {recentTickets.map((t: any) => (
                <Link key={t.id} href={`/pedidos/${t.id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.reference} · {t.contact?.name ?? 'Sem contacto'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[t.status])}>{t.status?.replace('_',' ')}</span>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', priorityColors[t.priority])}>{t.priority}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Proximos Eventos</h2>
              <Link href="/agenda" className="text-sm text-primary-600 hover:underline flex items-center gap-1">Ver agenda <ChevronRight size={14}/></Link>
            </div>
            <div className="divide-y divide-gray-50">
              {upcomingEvents.length === 0 && (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">Sem eventos proximos.</p>
              )}
              {upcomingEvents.map((e: any) => (
                <div key={e.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: e.color ?? '#0284c7' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{e.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={11} /> {new Date(e.starts_at).toLocaleString('pt-PT', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                      {e.space && ` · ${e.space.name}`}
                    </p>
                  </div>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full capitalize', e.visibility === 'publico' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>{e.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Reservations */}
        {pendingReservations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Reservas a Aprovar</h2>
              <Link href="/reservas" className="text-sm text-primary-600 hover:underline flex items-center gap-1">Ver todas <ChevronRight size={14}/></Link>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingReservations.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.space?.name} · {r.contact?.name}</p>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(r.starts_at).toLocaleDateString('pt-PT')}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">pendente</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending HR Absences */}
        {canApproveAbsences && pendingAbsences.length > 0 && (
          <div id="aprovacoes-pendentes" className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-orange-500" />
                <h2 className="font-semibold text-gray-800">Aprovações Pendentes</h2>
                <span className="text-xs text-gray-400 font-normal">ausências e férias</span>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                  {pendingAbsences.length}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Funcionário</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Período</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Dias</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Notas</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingAbsences.map((a: any) => (
                    <tr key={a.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/pessoas/${a.contact_id}`} className="hover:underline">
                          <p className="font-medium text-gray-800">{a.contact?.name}</p>
                          {a.contact?.department && (
                            <p className="text-xs text-gray-400">{a.contact.department.name}</p>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                          {ABSENCE_TYPE_LABELS[a.type] ?? a.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                        {a.start_date} → {a.end_date}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                        {a.days ? `${a.days}d` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate hidden lg:table-cell">
                        {a.notes || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => approve(a.id)}
                            title="Aprovar"
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                            <Check size={12}/> Aprovar
                          </button>
                          <button onClick={() => reject(a.id)}
                            title="Rejeitar"
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                            <X size={12}/> Rejeitar
                          </button>
                          <Link href={`/pessoas/${a.contact_id}`}
                            className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Ver perfil">
                            <ChevronRight size={14}/>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
