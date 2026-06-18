import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, ClipboardCheck, Calendar, ChevronRight, X } from 'lucide-react'
import clsx from 'clsx'

const statusColors: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  ativo:    'bg-blue-100 text-blue-700',
  'concluído': 'bg-green-100 text-green-700',
  cancelado:'bg-red-100 text-red-700',
}

export default function PlaneamentoIndex({ plans }: any) {
  const [showForm, setShowForm] = useState(false)
  const { data, setData, post, processing, reset } = useForm({
    title: '', description: '', year: new Date().getFullYear(),
    starts_at: '', ends_at: '', status: 'rascunho',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/planeamento', { onSuccess: () => { reset(); setShowForm(false) } })
  }

  return (
    <AdminLayout title="Planeamento">
      <Head title="Planeamento — JuntaOS"/>
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Planos Operacionais</h1>
            <p className="text-sm text-gray-500 mt-0.5">{plans?.length ?? 0} planos registados</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16}/> Novo Plano
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} className="bg-white rounded-xl border border-primary-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Novo Plano</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={16} className="text-gray-400"/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input value={data.title} onChange={e => setData('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Plano de Atividades 2025" required/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano *</label>
                <input type="number" value={data.year} onChange={e => setData('year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Início *</label>
                <input type="date" value={data.starts_at} onChange={e => setData('starts_at', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim *</label>
                <input type="date" value={data.ends_at} onChange={e => setData('ends_at', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select value={data.status} onChange={e => setData('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="rascunho">Rascunho</option>
                  <option value="ativo">Ativo</option>
                  <option value="concluído">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Objetivos gerais do plano…"/>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" disabled={processing}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
                {processing ? 'A criar…' : 'Criar Plano'}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {plans?.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
              <ClipboardCheck size={40} className="mx-auto mb-2 opacity-30"/>
              <p>Nenhum plano operacional criado.</p>
            </div>
          ) : plans?.map((p: any) => (
            <Link key={p.id} href={`/planeamento/${p.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 hover:border-primary-300 hover:shadow-md transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{p.title}</p>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[p.status] ?? 'bg-gray-100 text-gray-600')}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={11}/> {p.year}</span>
                  {p.starts_at && <span>{new Date(p.starts_at).toLocaleDateString('pt-PT')} → {new Date(p.ends_at).toLocaleDateString('pt-PT')}</span>}
                  <span>{p.tasks_count} tarefa{p.tasks_count !== 1 ? 's' : ''}</span>
                </div>
                {p.description && <p className="text-xs text-gray-500 mt-1 truncate">{p.description}</p>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {p.progress != null && (
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{width:`${p.progress}%`}}/>
                    </div>
                    <span className="text-xs text-gray-500">{p.progress}%</span>
                  </div>
                )}
                <ChevronRight size={16} className="text-gray-400"/>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
