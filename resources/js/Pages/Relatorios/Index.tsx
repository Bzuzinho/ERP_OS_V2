import React from 'react'
import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { FileText, CheckSquare, Calendar, Package, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

function StatBlock({ label, value, sub, color = 'text-gray-900' }: any) {
  return (
    <div className="text-center">
      <p className={clsx('text-3xl font-bold', color)}>{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function Card({ title, icon: Icon, children, color = 'text-gray-600' }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Icon size={18} className={color}/>
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Bar({ label, value, max, color = 'bg-primary-500' }: any) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28 truncate capitalize">{label?.replace('_',' ')}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full', color)} style={{width:`${pct}%`}}/>
      </div>
      <span className="text-sm font-semibold text-gray-800 w-8 text-right">{value}</span>
    </div>
  )
}

export default function RelatoriosIndex({ tickets, tasks, reservations, inventory, hr, period }: any) {
  const periods = [
    { label: '7 dias', value: '7' },
    { label: '30 dias', value: '30' },
    { label: '90 dias', value: '90' },
    { label: '1 ano', value: '365' },
  ]

  const ticketMax = Math.max(...Object.values(tickets?.by_status ?? {}).map(Number))
  const taskMax   = Math.max(...Object.values(tasks?.by_status ?? {}).map(Number))

  const ticketStatusLabels: Record<string,string> = {
    aberto:'Aberto', em_analise:'Em análise', em_progresso:'Em progresso',
    aguarda_resposta:'Aguarda resposta', resolvido:'Resolvido', encerrado:'Encerrado',
  }

  return (
    <AdminLayout title="Relatórios">
      <Head title="Relatórios — JuntaOS"/>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-sm text-gray-500 mt-0.5">Visão geral do desempenho operacional</p>
          </div>
          <div className="flex gap-2">
            {periods.map(p => (
              <button key={p.value} onClick={() => router.get('/relatorios', { period: p.value }, { preserveState: true })}
                className={clsx('px-3 py-1.5 rounded-lg text-sm border transition-colors',
                  period === p.value ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400')}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <StatBlock label="Pedidos Totais" value={tickets?.total} sub={`+${tickets?.period} neste período`} color="text-blue-600"/>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <StatBlock label="Tarefas Concluídas" value={tasks?.completed} sub={`de ${tasks?.total} total`} color="text-green-600"/>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <StatBlock label="Reservas Aprovadas" value={reservations?.approved} sub={`${reservations?.pending} pendentes`} color="text-emerald-600"/>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <StatBlock label="Stock Crítico" value={inventory?.low_stock} sub={`${inventory?.out_of_stock} em rutura`} color={inventory?.low_stock > 0 ? 'text-red-600' : 'text-gray-900'}/>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pedidos por estado */}
          <Card title="Pedidos por Estado" icon={FileText} color="text-blue-500">
            <div className="space-y-3">
              {Object.entries(tickets?.by_status ?? {}).map(([status, count]: any) => (
                <Bar key={status} label={ticketStatusLabels[status] ?? status} value={count} max={ticketMax}
                  color={status === 'resolvido' || status === 'encerrado' ? 'bg-green-400' : status === 'em_progresso' ? 'bg-blue-400' : 'bg-gray-300'}/>
              ))}
              {Object.keys(tickets?.by_status ?? {}).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>}
            </div>
          </Card>

          {/* Pedidos por prioridade */}
          <Card title="Pedidos por Prioridade" icon={AlertTriangle} color="text-amber-500">
            <div className="space-y-3">
              {Object.entries(tickets?.by_priority ?? {}).map(([prio, count]: any) => (
                <Bar key={prio} label={prio} value={count} max={ticketMax}
                  color={prio === 'urgente' ? 'bg-red-400' : prio === 'alta' ? 'bg-orange-400' : prio === 'normal' ? 'bg-blue-400' : 'bg-gray-300'}/>
              ))}
              {Object.keys(tickets?.by_priority ?? {}).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>}
            </div>
          </Card>

          {/* Tarefas por estado */}
          <Card title="Tarefas por Estado" icon={CheckSquare} color="text-indigo-500">
            <div className="space-y-3">
              {Object.entries(tasks?.by_status ?? {}).map(([status, count]: any) => (
                <Bar key={status} label={status.replace('_',' ')} value={count} max={taskMax}
                  color={status === 'completed' ? 'bg-green-400' : status === 'in_progress' ? 'bg-blue-400' : 'bg-gray-300'}/>
              ))}
              {Object.keys(tasks?.by_status ?? {}).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>}
              {tasks?.overdue > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle size={14}/> {tasks.overdue} tarefa{tasks.overdue !== 1 ? 's' : ''} em atraso
                </div>
              )}
            </div>
          </Card>

          {/* RH e Inventário */}
          <Card title="Resumo Operacional" icon={TrendingUp} color="text-emerald-500">
            <div className="grid grid-cols-2 gap-5">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users size={20} className="mx-auto text-indigo-500 mb-2"/>
                <p className="text-2xl font-bold text-gray-900">{hr?.active}</p>
                <p className="text-xs text-gray-500 mt-1">Colaboradores Ativos</p>
                <p className="text-xs text-gray-400">{hr?.total_employees} total</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Package size={20} className="mx-auto text-amber-500 mb-2"/>
                <p className="text-2xl font-bold text-gray-900">{inventory?.total_items}</p>
                <p className="text-xs text-gray-500 mt-1">Itens em Inventário</p>
                <p className={clsx('text-xs', inventory?.low_stock > 0 ? 'text-red-500' : 'text-gray-400')}>
                  {inventory?.low_stock} em stock crítico
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar size={20} className="mx-auto text-emerald-500 mb-2"/>
                <p className="text-2xl font-bold text-gray-900">{reservations?.total}</p>
                <p className="text-xs text-gray-500 mt-1">Reservas Total</p>
                <p className="text-xs text-gray-400">{reservations?.period} neste período</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <FileText size={20} className="mx-auto text-blue-500 mb-2"/>
                <p className="text-2xl font-bold text-gray-900">{tickets?.resolved_period}</p>
                <p className="text-xs text-gray-500 mt-1">Pedidos Resolvidos</p>
                <p className="text-xs text-gray-400">neste período</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
