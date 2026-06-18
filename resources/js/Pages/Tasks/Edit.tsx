import React from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ChevronLeft } from 'lucide-react'

export default function TaskEdit({ task, users = [], teams = [], serviceAreas = [], plans = [] }: any) {
  const { data, setData, patch, processing, errors } = useForm({
    title:             task.title,
    description:       task.description ?? '',
    priority:          task.priority,
    status:            task.status,
    assigned_to:       task.assigned_to ? String(task.assigned_to) : '',
    team_id:           task.team_id ? String(task.team_id) : '',
    plan_id:           task.plan_id ? String(task.plan_id) : '',
    service_area_id:   task.service_area_id ? String(task.service_area_id) : '',
    due_date:          task.due_date ? new Date(task.due_date).toISOString().slice(0,10) : '',
    validation_status: task.validation_status ?? 'nao_aplicavel',
    rejection_reason:  task.rejection_reason ?? '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    patch(`/tarefas/${task.id}`)
  }

  return (
    <AdminLayout title="Editar Tarefa">
      <Head title="Editar Tarefa — JuntaOS"/>
      <div className="p-6 max-w-3xl mx-auto space-y-5">

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href={`/tarefas/${task.id}`} className="hover:text-primary-600 flex items-center gap-1"><ChevronLeft size={14}/>Tarefa</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Editar</span>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Detalhes da tarefa</h2>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Título *</label>
              <input value={data.title} onChange={e => setData('title', e.target.value)} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"/>
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Descrição</label>
              <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"/>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Estado</label>
                <select value={data.status} onChange={e => setData('status', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em progresso</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Prioridade</label>
                <select value={data.priority} onChange={e => setData('priority', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Data limite</label>
                <input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"/>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Responsável</label>
                <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Não atribuído</option>
                  {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Equipa</label>
                <select value={data.team_id} onChange={e => setData('team_id', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Sem equipa</option>
                  {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Área de serviço</label>
                <select value={data.service_area_id} onChange={e => setData('service_area_id', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Sem área</option>
                  {serviceAreas.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Plano operacional</label>
                <select value={data.plan_id} onChange={e => setData('plan_id', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Sem plano</option>
                  {plans.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Estado de validação</label>
                <select value={data.validation_status} onChange={e => setData('validation_status', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="nao_aplicavel">Não aplicável</option>
                  <option value="pendente">Pendente de validação</option>
                  <option value="validado">Validado</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
              </div>
              {data.validation_status === 'rejeitado' && (
                <div className="sm:col-span-3">
                  <label className="text-xs text-gray-500 mb-1 block">Motivo da rejeição</label>
                  <input value={data.rejection_reason} onChange={e => setData('rejection_reason', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="Descreva o motivo..."/>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={processing}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl disabled:opacity-60 transition-colors">
              {processing ? 'A guardar…' : 'Guardar alterações'}
            </button>
            <Link href={`/tarefas/${task.id}`} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
