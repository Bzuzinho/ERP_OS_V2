import React from 'react'
import { Head, Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { FileText, CheckSquare, Calendar, AlertTriangle, ChevronRight, Clock } from 'lucide-react'
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

export default function Dashboard({ stats = {}, recentTickets = [], upcomingEvents = [], pendingReservations = [] }: any) {
  return (
    <AdminLayout title="Dashboard">
      <Head title="Dashboard — JuntaOS" />
      <div className="p-4 md:p-6 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Pedidos abertos"    value={stats.tickets?.aberto ?? 0}       sub={`${stats.tickets?.total ?? 0} total`}            icon={FileText}      color="text-blue-600"    href="/pedidos" />
          <StatCard label="Tarefas pendentes"  value={stats.tasks?.pending ?? 0}         sub={`${stats.tasks?.total ?? 0} total`}              icon={CheckSquare}   color="text-indigo-600"  href="/tarefas" />
          <StatCard label="Reservas pendentes" value={stats.reservations?.pendente ?? 0} sub={`${stats.reservations?.aprovada ?? 0} aprovadas`} icon={Calendar}     color="text-emerald-600" href="/reservas" />
          <StatCard label="Stock baixo"        value={stats.inventory?.low_stock ?? 0}   sub="itens abaixo do minimo"                           icon={AlertTriangle} color="text-amber-600"   href="/inventario" />
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
      </div>
    </AdminLayout>
  )
}
