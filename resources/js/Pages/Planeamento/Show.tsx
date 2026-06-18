import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft, CheckSquare, Clock, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const statusColors: Record<string, string> = {
  pending:    'bg-gray-100 text-gray-600',
  in_progress:'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
}

export default function PlaneamentoShow({ plan }: any) {
  const completed = plan.tasks?.filter((t: any) => t.status === 'completed').length ?? 0
  const total = plan.tasks?.length ?? 0
  const pct = total > 0 ? Math.round((completed / total) * 100) : (plan.progress ?? 0)

  return (
    <AdminLayout title={plan.title}>
      <Head title={`${plan.title} — JuntaOS`}/>
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/planeamento" className="p-1.5 rounded-lg hover:bg-gray-100"><ArrowLeft size={18} className="text-gray-600"/></Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{plan.title}</h1>
              <p className="text-sm text-gray-500">{plan.year} · {plan.starts_at ? new Date(plan.starts_at).toLocaleDateString('pt-PT') : '—'} → {plan.ends_at ? new Date(plan.ends_at).toLocaleDateString('pt-PT') : '—'}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Progresso</h2>
            <span className="text-2xl font-bold text-primary-600">{pct}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{width:`${pct}%`}}/>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{completed} concluídas</span>
            <span>{total - completed} em aberto</span>
          </div>
          {plan.description && <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">{plan.description}</p>}
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Tarefas do Plano ({total})</h2>
            <Link href={`/tarefas/nova`} className="text-sm text-primary-600 hover:underline">+ Nova Tarefa</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {total === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">Sem tarefas associadas a este plano.</p>
            ) : plan.tasks?.map((t: any) => (
              <Link key={t.id} href={`/tarefas/${t.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <CheckSquare size={15} className={t.status === 'completed' ? 'text-green-500' : 'text-gray-300'}/>
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm font-medium truncate', t.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800')}>
                    {t.title}
                  </p>
                  {t.due_date && (
                    <p className={clsx('text-xs mt-0.5 flex items-center gap-1',
                      new Date(t.due_date) < new Date() && t.status !== 'completed' ? 'text-red-500' : 'text-gray-400')}>
                      {new Date(t.due_date) < new Date() && t.status !== 'completed' && <AlertTriangle size={10}/>}
                      <Clock size={10}/> {new Date(t.due_date).toLocaleDateString('pt-PT')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {t.assignee && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                      {t.assignee.name[0]}
                    </div>
                  )}
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[t.status] ?? 'bg-gray-100 text-gray-600')}>
                    {t.status?.replace('_',' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
