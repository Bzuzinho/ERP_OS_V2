import React, { useState } from 'react'
import { Head, Link, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft, CheckCircle2, Edit2, Save, X, Trash2, CheckSquare, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const statusColor: Record<string, string> = {
  pendente: 'bg-gray-100 text-gray-600', em_progresso: 'bg-blue-100 text-blue-700',
  concluida: 'bg-green-100 text-green-700', cancelada: 'bg-red-100 text-red-700',
}
const statusLabel: Record<string, string> = {
  pendente:'Pendente', em_progresso:'Em progresso', concluida:'Concluída', cancelada:'Cancelada'
}
const taskStatusColor: Record<string, string> = {
  pending:'bg-gray-100 text-gray-600', in_progress:'bg-blue-100 text-blue-700',
  completed:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700',
}

export default function ManutençãoShow({ maintenance, spaces, teams, users }: any) {
  const [editing, setEditing] = useState(false)
  const { data, setData, patch, processing } = useForm({
    title:            maintenance.title ?? '',
    description:      maintenance.description ?? '',
    type:             maintenance.type ?? 'corretiva',
    priority:         maintenance.priority ?? 'normal',
    status:           maintenance.status ?? 'pendente',
    space_id:         maintenance.space?.id ?? '',
    assigned_team_id: maintenance.assigned_team?.id ?? '',
    assigned_to:      maintenance.assignee?.id ?? '',
    scheduled_at:     maintenance.scheduled_at ? maintenance.scheduled_at.slice(0,16) : '',
    completed_at:     maintenance.completed_at ? maintenance.completed_at.slice(0,16) : '',
    estimated_cost:   maintenance.estimated_cost ?? '',
    actual_cost:      maintenance.actual_cost ?? '',
    notes:            maintenance.notes ?? '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    patch(`/manutencoes/${maintenance.id}`, { onSuccess: () => setEditing(false) })
  }

  function destroy() {
    if (confirm('Eliminar esta manutenção?')) router.delete(`/manutencoes/${maintenance.id}`)
  }

  function markDone() {
    router.patch(`/manutencoes/${maintenance.id}`, {
      ...data, status: 'concluida', completed_at: new Date().toISOString().slice(0,16)
    })
  }

  return (
    <AdminLayout title="Manutenção">
      <Head title={`${maintenance.title} — JuntaOS`}/>
      <div className="p-4 md:p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/manutencoes" className="p-1.5 rounded-lg hover:bg-gray-100">
              <ArrowLeft size={18} className="text-gray-600"/>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{maintenance.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={clsx('text-xs px-2.5 py-0.5 rounded-full font-medium', statusColor[maintenance.status])}>
                  {statusLabel[maintenance.status]}
                </span>
                {maintenance.space && <span className="text-xs text-gray-500">{maintenance.space.name}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {maintenance.status !== 'concluida' && maintenance.status !== 'cancelada' && !editing && (
              <button onClick={markDone}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                <CheckCircle2 size={14}/> Concluir
              </button>
            )}
            <button onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              {editing ? <X size={14}/> : <Edit2 size={14}/>} {editing ? 'Cancelar' : 'Editar'}
            </button>
            <button onClick={destroy} className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
              <Trash2 size={16}/>
            </button>
          </div>
        </div>

        {/* Editar */}
        {editing ? (
          <form onSubmit={submit} className="bg-white rounded-xl border border-primary-200 p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input value={data.title} onChange={e => setData('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select value={data.status} onChange={e => setData('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="pendente">Pendente</option>
                  <option value="em_progresso">Em progresso</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={data.type} onChange={e => setData('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="preventiva">Preventiva</option>
                  <option value="corretiva">Corretiva</option>
                  <option value="urgente">Urgente</option>
                  <option value="periodica">Periódica</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <select value={data.priority} onChange={e => setData('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="baixa">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Espaço</label>
                <select value={data.space_id} onChange={e => setData('space_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— sem espaço —</option>
                  {spaces.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipa</label>
                <select value={data.assigned_team_id} onChange={e => setData('assigned_team_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— sem equipa —</option>
                  {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— sem responsável —</option>
                  {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Prevista</label>
                <input type="datetime-local" value={data.scheduled_at} onChange={e => setData('scheduled_at', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Conclusão</label>
                <input type="datetime-local" value={data.completed_at} onChange={e => setData('completed_at', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custo Estimado (€)</label>
                <input type="number" step="0.01" min="0" value={data.estimated_cost} onChange={e => setData('estimated_cost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custo Real (€)</label>
                <input type="number" step="0.01" min="0" value={data.actual_cost} onChange={e => setData('actual_cost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" disabled={processing}
                className="flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
                <Save size={14}/> {processing ? 'A guardar…' : 'Guardar'}
              </button>
            </div>
          </form>
        ) : (
          /* Detalhe */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 space-y-4">
              {/* Info principal */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div><dt className="text-gray-400 text-xs">Tipo</dt><dd className="font-medium text-gray-800 capitalize">{maintenance.type}</dd></div>
                  <div><dt className="text-gray-400 text-xs">Prioridade</dt>
                    <dd className={clsx('font-medium capitalize',
                      maintenance.priority === 'urgente' ? 'text-red-600' : maintenance.priority === 'alta' ? 'text-orange-500' : 'text-gray-800')}>
                      {maintenance.priority}
                    </dd>
                  </div>
                  {maintenance.scheduled_at && (
                    <div><dt className="text-gray-400 text-xs">Data Prevista</dt>
                      <dd className="font-medium text-gray-800">{new Date(maintenance.scheduled_at).toLocaleString('pt-PT')}</dd>
                    </div>
                  )}
                  {maintenance.completed_at && (
                    <div><dt className="text-gray-400 text-xs">Concluída em</dt>
                      <dd className="font-medium text-green-700">{new Date(maintenance.completed_at).toLocaleString('pt-PT')}</dd>
                    </div>
                  )}
                  {maintenance.estimated_cost && (
                    <div><dt className="text-gray-400 text-xs">Custo Estimado</dt>
                      <dd className="font-medium text-gray-800">{parseFloat(maintenance.estimated_cost).toFixed(2)} €</dd>
                    </div>
                  )}
                  {maintenance.actual_cost && (
                    <div><dt className="text-gray-400 text-xs">Custo Real</dt>
                      <dd className="font-medium text-gray-800">{parseFloat(maintenance.actual_cost).toFixed(2)} €</dd>
                    </div>
                  )}
                </dl>
                {maintenance.description && (
                  <p className="text-sm text-gray-600 pt-3 border-t border-gray-100">{maintenance.description}</p>
                )}
                {maintenance.notes && (
                  <p className="text-sm text-gray-500 italic pt-2">{maintenance.notes}</p>
                )}
              </div>

              {/* Tarefas geradas */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-5 py-3.5 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">Tarefas Geradas ({maintenance.tasks?.length ?? 0})</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {(maintenance.tasks ?? []).length === 0 ? (
                    <p className="px-5 py-8 text-sm text-gray-400 text-center">Sem tarefas associadas.</p>
                  ) : maintenance.tasks.map((t: any) => (
                    <Link key={t.id} href={`/tarefas/${t.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <CheckSquare size={15} className={t.status === 'completed' ? 'text-green-500' : 'text-gray-300'}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                        {t.assignee && <p className="text-xs text-gray-400">{t.assignee.name}</p>}
                      </div>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', taskStatusColor[t.status] ?? 'bg-gray-100 text-gray-600')}>
                        {t.status?.replace('_',' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3 text-sm">
                <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wide text-gray-500">Atribuição</h3>
                {maintenance.space && (
                  <div><p className="text-xs text-gray-400">Espaço</p><p className="font-medium">{maintenance.space.name}</p></div>
                )}
                {maintenance.assigned_team && (
                  <div><p className="text-xs text-gray-400">Equipa</p><p className="font-medium">{maintenance.assigned_team.name}</p></div>
                )}
                {maintenance.assignee && (
                  <div><p className="text-xs text-gray-400">Responsável</p><p className="font-medium">{maintenance.assignee.name}</p></div>
                )}
                {!maintenance.space && !maintenance.assigned_team && !maintenance.assignee && (
                  <p className="text-gray-400 text-xs">Sem atribuição definida.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
