import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft, CheckCircle2, Clock, Circle } from 'lucide-react'
import clsx from 'clsx'

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Circle size={16} className="text-gray-400" />,
  in_progress: <Clock size={16} className="text-blue-500" />,
  completed: <CheckCircle2 size={16} className="text-green-500" />,
  cancelled: <Circle size={16} className="text-red-400" />,
}

export default function TaskShow({ task }: any) {
  return (
    <AdminLayout title="Tarefa">
      <Head title={`${task.title} — JuntaOS`} />
      <div className="p-6 max-w-2xl mx-auto">
        <Link href="/tarefas" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"><ArrowLeft size={16} /> Tarefas</Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-3 mb-6">
            {statusIcon[task.status]}
            <h1 className="text-xl font-semibold text-gray-800">{task.title}</h1>
          </div>
          {task.description && <p className="text-sm text-gray-600 mb-6 leading-relaxed">{task.description}</p>}
          <div className="space-y-3 text-sm">
            {[
              { l:'Estado', v: task.status?.replace('_',' ') },
              { l:'Prioridade', v: task.priority },
              { l:'Responsável', v: task.assignee?.name },
              { l:'Área', v: task.service_area?.name },
              { l:'Pedido associado', v: task.ticket?.reference },
              { l:'Data limite', v: task.due_date ? new Date(task.due_date).toLocaleDateString('pt-PT') : null },
            ].map(({ l, v }) => v ? (
              <div key={l} className="flex justify-between">
                <span className="text-gray-500">{l}</span>
                <span className="font-medium text-gray-800">{v}</span>
              </div>
            ) : null)}
          </div>
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            <Link href={`/tarefas/${task.id}/edit`} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">Editar</Link>
            <button onClick={() => { if(confirm('Eliminar tarefa?')) router.delete(`/tarefas/${task.id}`) }}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors">Eliminar</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
