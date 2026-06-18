import React from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft } from 'lucide-react'

export default function TaskCreate({ users, serviceAreas }: any) {
  const { data, setData, post, processing, errors } = useForm({
    title: '', description: '', priority: 'medium', status: 'pending',
    assigned_to: '', due_date: '', service_area_id: '',
  })

  return (
    <AdminLayout title="Nova Tarefa">
      <Head title="Nova Tarefa" />
      <div className="p-6 max-w-2xl mx-auto">
        <Link href="/tarefas" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"><ArrowLeft size={16} /> Voltar</Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Criar Tarefa</h2>
          <form onSubmit={e => { e.preventDefault(); post('/tarefas') }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <select value={data.priority} onChange={e => setData('priority', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data limite</label>
                <input type="datetime-local" value={data.due_date} onChange={e => setData('due_date', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Não atribuído</option>
                {users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={processing}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors">
                {processing ? 'A criar...' : 'Criar Tarefa'}
              </button>
              <Link href="/tarefas" className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancelar</Link>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
