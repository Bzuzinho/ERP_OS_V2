import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, Wrench, Calendar, ChevronRight, X, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const typeLabel: Record<string, string> = {
  preventiva: 'Preventiva', corretiva: 'Corretiva', urgente: 'Urgente', periodica: 'Periódica'
}
const typeColor: Record<string, string> = {
  preventiva: 'bg-blue-100 text-blue-700', corretiva: 'bg-amber-100 text-amber-700',
  urgente: 'bg-red-100 text-red-700',       periodica: 'bg-green-100 text-green-700',
}
const statusColor: Record<string, string> = {
  pendente: 'bg-gray-100 text-gray-600', em_progresso: 'bg-blue-100 text-blue-700',
  concluida: 'bg-green-100 text-green-700', cancelada: 'bg-red-100 text-red-700',
}
const statusLabel: Record<string, string> = {
  pendente: 'Pendente', em_progresso: 'Em progresso', concluida: 'Concluída', cancelada: 'Cancelada'
}
const prioLabel: Record<string, string> = { baixa:'Baixa', normal:'Normal', alta:'Alta', urgente:'Urgente' }
const prioColor: Record<string, string> = {
  baixa:'text-gray-500', normal:'text-blue-600', alta:'text-orange-600', urgente:'text-red-600'
}

export default function ManutençõesIndex({ maintenances, spaces, teams, users }: any) {
  const [showForm, setShowForm] = useState(false)
  const { data, setData, post, processing, reset, errors } = useForm({
    title: '', description: '', type: 'corretiva', priority: 'normal',
    space_id: '', assigned_team_id: '', assigned_to: '',
    scheduled_at: '', estimated_cost: '', notes: '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/manutencoes', { onSuccess: () => { reset(); setShowForm(false) } })
  }

  const pendentes = maintenances.filter((m: any) => m.status === 'pendente').length
  const urgentes  = maintenances.filter((m: any) => m.priority === 'urgente' && m.status !== 'concluida').length

  return (
    <AdminLayout title="Manutenções">
      <Head title="Manutenções — JuntaOS"/>
      <div className="p-6 max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manutenções</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-sm text-gray-500">{maintenances.length} registo{maintenances.length !== 1 ? 's' : ''}</p>
              {urgentes > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertTriangle size={12}/> {urgentes} urgente{urgentes !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16}/> Nova Manutenção
          </button>
        </div>

        {/* Alertas de pendentes */}
        {pendentes > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <Wrench size={16}/>
            <span><strong>{pendentes}</strong> manutenção{pendentes !== 1 ? 'ões' : ''} pendente{pendentes !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Formulário */}
        {showForm && (
          <form onSubmit={submit} className="bg-white rounded-xl border border-primary-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Nova Manutenção</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={16} className="text-gray-400"/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input value={data.title} onChange={e => setData('title', e.target.value)}
                  placeholder="Ex: Revisão do sistema elétrico da Sala Principal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Espaço</label>
                <select value={data.space_id} onChange={e => setData('space_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— Geral (sem espaço) —</option>
                  {spaces.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select value={data.type} onChange={e => setData('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="preventiva">Preventiva</option>
                  <option value="corretiva">Corretiva</option>
                  <option value="urgente">Urgente</option>
                  <option value="periodica">Periódica</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade *</label>
                <select value={data.priority} onChange={e => setData('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="baixa">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Prevista</label>
                <input type="datetime-local" value={data.scheduled_at} onChange={e => setData('scheduled_at', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipa Responsável</label>
                <select value={data.assigned_team_id} onChange={e => setData('assigned_team_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— sem equipa —</option>
                  {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável Individual</label>
                <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">— sem responsável —</option>
                  {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custo Estimado (€)</label>
                <input type="number" min="0" step="0.01" value={data.estimated_cost}
                  onChange={e => setData('estimated_cost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
            </div>
            <p className="text-xs text-gray-400">Uma tarefa operacional será criada automaticamente e ficará pendente de validação.</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" disabled={processing}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
                {processing ? 'A criar…' : 'Criar Manutenção'}
              </button>
            </div>
          </form>
        )}

        {/* Lista */}
        <div className="space-y-2">
          {maintenances.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
              <Wrench size={40} className="mx-auto mb-2 opacity-30"/>
              <p>Nenhuma manutenção registada.</p>
            </div>
          ) : maintenances.map((m: any) => (
            <Link key={m.id} href={`/manutencoes/${m.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3.5 hover:border-primary-300 hover:shadow-md transition-all">
              <div className={clsx('w-2 h-10 rounded-full flex-shrink-0',
                m.priority === 'urgente' ? 'bg-red-500' : m.priority === 'alta' ? 'bg-orange-400' : 'bg-gray-200')}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{m.title}</p>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', typeColor[m.type])}>{typeLabel[m.type]}</span>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusColor[m.status])}>{statusLabel[m.status]}</span>
                </div>
                <div className="flex items-center gap-4 mt-0.5 text-xs text-gray-400">
                  {m.space && <span>{m.space.name}</span>}
                  {m.assigned_team && <span>Equipa: {m.assigned_team.name}</span>}
                  {m.assignee && <span>Resp.: {m.assignee.name}</span>}
                  {m.scheduled_at && (
                    <span className="flex items-center gap-1">
                      <Calendar size={10}/>
                      {new Date(m.scheduled_at).toLocaleDateString('pt-PT')}
                    </span>
                  )}
                  {m.estimated_cost && <span>Est.: {parseFloat(m.estimated_cost).toFixed(2)} €</span>}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-400 flex-shrink-0"/>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
