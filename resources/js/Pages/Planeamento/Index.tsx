import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  Plus, ClipboardList, Calendar, CheckSquare, AlertTriangle,
  Clock, X, ChevronRight, TrendingUp,
} from 'lucide-react'
import clsx from 'clsx'

const STATUS_COLORS: Record<string,string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  ativo:    'bg-blue-100 text-blue-700',
  concluido:'bg-green-100 text-green-700',
  cancelado:'bg-red-100 text-red-700',
}
const STATUS_LABELS: Record<string,string> = {
  rascunho:'Rascunho', ativo:'Ativo', concluido:'Concluído', cancelado:'Cancelado',
}
const TASK_STATUS_COLORS: Record<string,string> = {
  pending:'bg-yellow-400', in_progress:'bg-blue-500', completed:'bg-green-500', cancelled:'bg-gray-300',
}

function StatCard({ label, value, icon: Icon, color, href }: any) {
  const inner = (
    <div className="flex items-center gap-3">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', color.bg)}>
        <Icon size={18} className={color.icon}/>
      </div>
      <div>
        <p className={clsx('text-2xl font-bold', color.text)}>{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
  if (href) return <Link href={href} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow block">{inner}</Link>
  return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">{inner}</div>
}

export default function PlaneamentoIndex({ plans = [], stats = {} }: any) {
  const [showForm, setShowForm] = useState(false)
  const { data, setData, post, processing, reset } = useForm({
    title:'', description:'', year: new Date().getFullYear(),
    starts_at:'', ends_at:'', status:'rascunho',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/planeamento', { onSuccess: () => { reset(); setShowForm(false) } })
  }

  return (
    <AdminLayout title="Planeamento">
      <Head title="Planeamento — JuntaOS"/>
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard label="Planos ativos"      value={stats.plans_active ?? 0}       icon={ClipboardList}  color={{ bg:'bg-blue-50',   icon:'text-blue-600',   text:'text-blue-700'   }} />
          <StatCard label="Tarefas em aberto"  value={stats.tasks_pending ?? 0}       icon={CheckSquare}    color={{ bg:'bg-indigo-50', icon:'text-indigo-600', text:'text-indigo-700' }} href="/tarefas" />
          <StatCard label="A validar"          value={stats.pending_validation ?? 0}  icon={AlertTriangle}  color={{ bg:'bg-orange-50', icon:'text-orange-600', text:'text-orange-700' }} href="/planeamento/requisicoes" />
          <StatCard label="Reservas pendentes" value={stats.space_pending ?? 0}        icon={Clock}          color={{ bg:'bg-yellow-50', icon:'text-yellow-600', text:'text-yellow-700' }} href="/planeamento/requisicoes" />
          <StatCard label="Eventos esta semana" value={stats.events_this_week ?? 0}   icon={Calendar}       color={{ bg:'bg-green-50',  icon:'text-green-600',  text:'text-green-700'  }} href="/planeamento/agenda" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Planos Operacionais</h1>
            <p className="text-sm text-gray-500 mt-0.5">{plans.length} plano{plans.length !== 1 ? 's' : ''} registado{plans.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors">
            <Plus size={15}/> Novo Plano
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={submit} className="bg-white rounded-xl border border-primary-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Novo Plano Operacional</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={16} className="text-gray-400"/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Título *</label>
                <input value={data.title} onChange={e => setData('title', e.target.value)} required
                  placeholder="Ex: Plano de Atividades 2025"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"/>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ano *</label>
                <input type="number" value={data.year} onChange={e => setData('year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" required/>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Data Início *</label>
                <input type="date" value={data.starts_at} onChange={e => setData('starts_at', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" required/>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Data Fim *</label>
                <input type="date" value={data.ends_at} onChange={e => setData('ends_at', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" required/>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Estado</label>
                <select value={data.status} onChange={e => setData('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="rascunho">Rascunho</option>
                  <option value="ativo">Ativo</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="text-xs text-gray-500 mb-1 block">Descrição</label>
                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2}
                  placeholder="Objetivos gerais do plano…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"/>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={processing}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
                {processing ? 'A criar…' : 'Criar Plano'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            </div>
          </form>
        )}

        {/* Plans list */}
        <div className="space-y-3">
          {plans.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="text-sm">Nenhum plano operacional criado.</p>
              <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-primary-600 hover:underline flex items-center gap-1 mx-auto">
                <Plus size={13}/> Criar primeiro plano
              </button>
            </div>
          ) : plans.map((p: any) => {
            const byStatus: Record<string,number> = p.tasks_by_status ?? {}
            return (
              <Link key={p.id} href={`/planeamento/${p.id}`}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 hover:border-primary-300 hover:shadow-md transition-all group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{p.title}</p>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600')}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar size={11}/> {p.year}</span>
                    {p.starts_at && <span>{new Date(p.starts_at).toLocaleDateString('pt-PT')} → {p.ends_at ? new Date(p.ends_at).toLocaleDateString('pt-PT') : '—'}</span>}
                    <span>{p.tasks_count} tarefa{p.tasks_count !== 1 ? 's' : ''}</span>
                  </div>
                  {p.description && <p className="text-xs text-gray-500 mt-1.5 truncate">{p.description}</p>}

                  {/* Mini stacked progress by status */}
                  {p.tasks_count > 0 && (
                    <div className="mt-2 flex rounded-full overflow-hidden h-1.5 gap-px">
                      {Object.entries(TASK_STATUS_COLORS).map(([st, col]) => {
                        const w = Math.round(((byStatus[st] ?? 0) / p.tasks_count) * 100)
                        return w > 0 ? <div key={st} className={col} style={{ width: `${w}%` }}/> : null
                      })}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {p.tasks_count > 0 && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={13} className="text-gray-400"/>
                      <span className="text-sm font-semibold text-gray-700">{p.progress}%</span>
                    </div>
                  )}
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors"/>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}
