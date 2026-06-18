import React, { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, CheckSquare, ChevronRight, Circle, CheckCircle2, Clock } from 'lucide-react'
import clsx from 'clsx'

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Circle size={16} className="text-gray-400" />,
  in_progress: <Clock size={16} className="text-blue-500" />,
  completed: <CheckCircle2 size={16} className="text-green-500" />,
  cancelled: <Circle size={16} className="text-red-400" />,
}
const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-600', high: 'bg-red-100 text-red-700',
}

export default function TasksIndex({ tasks, filters, users }: any) {
  const applyFilter = (key: string, value: string) =>
    router.get('/tarefas', { ...filters, [key]: value || undefined }, { preserveState: true })

  return (
    <AdminLayout title="Tarefas">
      <Head title="Tarefas — JuntaOS" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {['','pending','in_progress','completed'].map(s => (
              <button key={s} onClick={() => applyFilter('status', s)}
                className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  (filters?.status ?? '') === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200')}>
                {s === '' ? 'Todas' : s === 'pending' ? 'Pendentes' : s === 'in_progress' ? 'Em progresso' : 'Concluídas'}
              </button>
            ))}
          </div>
          <Link href="/tarefas/nova" className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Nova tarefa
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {(tasks?.data ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckSquare size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Sem tarefas encontradas.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(tasks?.data ?? []).map((t: any) => (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <button onClick={() => router.patch(`/tarefas/${t.id}`, { status: t.status === 'completed' ? 'pending' : 'completed' })}>
                    {statusIcon[t.status]}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={clsx('text-sm font-medium', t.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800')}>{t.title}</p>
                    {t.description && <p className="text-xs text-gray-400 truncate mt-0.5">{t.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full', priorityColors[t.priority])}>{t.priority}</span>
                    {t.assignee && <span className="text-xs text-gray-500">{t.assignee.name}</span>}
                    {t.due_date && <span className="text-xs text-gray-400">{new Date(t.due_date).toLocaleDateString('pt-PT')}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tasks?.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Página {tasks.current_page} de {tasks.last_page}</p>
              <div className="flex gap-2">
                {tasks.prev_page_url && <Link href={tasks.prev_page_url} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Anterior</Link>}
                {tasks.next_page_url && <Link href={tasks.next_page_url} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Próxima</Link>}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
