import React, { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, BookOpen, CheckCircle, Trash2, Search } from 'lucide-react'
import clsx from 'clsx'

const visColors: Record<string, string> = {
  público: 'bg-green-100 text-green-700',
  interno: 'bg-gray-100 text-gray-600',
  restrito: 'bg-red-100 text-red-700',
}

export default function DocumentsIndex({ documents, filters }: any) {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState(filters?.search ?? '')
  const { data, setData, post, processing, reset } = useForm({
    title: '', description: '', type: 'documento', visibility: 'interno', meeting_date: '',
  })

  const applyFilter = (key: string, value: string) =>
    router.get('/documentos', { ...filters, [key]: value || undefined }, { preserveState: true })

  return (
    <AdminLayout title="Documentos">
      <Head title="Documentos — JuntaOS" />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={e => { e.preventDefault(); applyFilter('search', search) }} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </form>
          <div className="flex gap-2">
            <select value={filters?.type ?? ''} onChange={e => applyFilter('type', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todos os tipos</option>
              {['documento','ata','regulamento','formulário','outro'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus size={16} /> Novo documento
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Novo Documento</h3>
            <form onSubmit={e => { e.preventDefault(); post('/documentos', { onSuccess: () => { reset(); setShowForm(false) } }) }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={data.type} onChange={e => setData('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {['documento','ata','regulamento','formulário','outro'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibilidade</label>
                <select value={data.visibility} onChange={e => setData('visibility', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {['público','interno','restrito'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              {data.type === 'ata' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data da reunião</label>
                  <input type="date" value={data.meeting_date} onChange={e => setData('meeting_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              )}
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={processing}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors">
                  {processing ? 'A criar...' : 'Criar'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {(documents?.data ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <BookOpen size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Sem documentos encontrados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Título','Tipo','Visibilidade','Criado por','Data','Aprovado','Ações'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(documents?.data ?? []).map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{d.title}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{d.type}</td>
                    <td className="px-4 py-3"><span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', visColors[d.visibility])}>{d.visibility}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{d.creator?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(d.created_at).toLocaleDateString('pt-PT')}</td>
                    <td className="px-4 py-3">
                      {d.is_approved
                        ? <CheckCircle size={16} className="text-green-500" />
                        : <button onClick={() => router.post(`/documentos/${d.id}/aprovar`)} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors">Aprovar</button>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => router.delete(`/documentos/${d.id}`)} className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
