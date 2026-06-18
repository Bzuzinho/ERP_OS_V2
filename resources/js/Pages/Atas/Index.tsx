import React, { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, Search, ScrollText, CheckCircle2, Clock, ChevronRight, X } from 'lucide-react'
import clsx from 'clsx'

export default function AtasIndex({ atas, filters }: any) {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState(filters?.search ?? '')
  const { data, setData, post, processing, reset } = useForm({
    title: '', meeting_date: '', visibility: 'interno', description: '', content: '',
  })

  function doSearch(e: React.FormEvent) {
    e.preventDefault()
    router.get('/atas', { search }, { preserveState: true })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/atas', { onSuccess: () => { reset(); setShowForm(false) } })
  }

  return (
    <AdminLayout title="Atas">
      <Head title="Atas — JuntaOS" />
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Atas de Reunião</h1>
            <p className="text-sm text-gray-500 mt-0.5">{atas?.total ?? 0} atas registadas</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16}/> Nova Ata
          </button>
        </div>

        {/* Form inline */}
        {showForm && (
          <form onSubmit={submit} className="bg-white rounded-xl border border-primary-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-gray-800">Nova Ata</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={16} className="text-gray-400 hover:text-gray-600"/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input value={data.title} onChange={e => setData('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Reunião Ordinária de Janeiro" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data da Reunião *</label>
                <input type="date" value={data.meeting_date} onChange={e => setData('meeting_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibilidade</label>
                <select value={data.visibility} onChange={e => setData('visibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="público">Público</option>
                  <option value="interno">Interno</option>
                  <option value="restrito">Restrito</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sumário</label>
                <input value={data.description} onChange={e => setData('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Breve descrição dos assuntos tratados" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <textarea value={data.content} onChange={e => setData('content', e.target.value)} rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  placeholder="Texto completo da ata…" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" disabled={processing}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
                {processing ? 'A guardar…' : 'Criar Ata'}
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <form onSubmit={doSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar atas…"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <button type="submit" className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded-lg">Filtrar</button>
          </form>
          <div className="flex gap-2">
            {[{k:'aprovada',l:'Aprovadas'},{k:'pendente',l:'Pendentes'}].map(({k,l}) => (
              <button key={k} onClick={() => router.get('/atas', { ...filters, status: filters?.status === k ? '' : k }, {preserveState:true})}
                className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  filters?.status === k ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400')}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {atas?.data?.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
              <ScrollText size={40} className="mx-auto mb-2 opacity-30"/>
              <p>Nenhuma ata encontrada.</p>
            </div>
          ) : atas?.data?.map((a: any) => (
            <Link key={a.id} href={`/atas/${a.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 hover:border-primary-300 hover:shadow-md transition-all">
              <div className="flex-shrink-0">
                {a.is_approved
                  ? <CheckCircle2 size={20} className="text-green-500"/>
                  : <Clock size={20} className="text-amber-400"/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{a.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {a.meeting_date ? new Date(a.meeting_date).toLocaleDateString('pt-PT', {day:'2-digit',month:'long',year:'numeric'}) : '—'}
                  {a.description && ` · ${a.description}`}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                  a.visibility === 'público' ? 'bg-green-100 text-green-700' : a.visibility === 'restrito' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600')}>
                  {a.visibility}
                </span>
                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                  a.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                  {a.is_approved ? 'Aprovada' : 'Pendente'}
                </span>
                <ChevronRight size={16} className="text-gray-400"/>
              </div>
            </Link>
          ))}
        </div>

        {atas?.last_page > 1 && (
          <div className="flex justify-center gap-2">
            {atas?.links?.map((link: any, i: number) => (
              <button key={i} onClick={() => link.url && router.get(link.url)}
                disabled={!link.url}
                className={clsx('px-3 py-1.5 rounded text-sm border',
                  link.active ? 'bg-primary-600 text-white border-primary-600' : link.url ? 'bg-white hover:bg-gray-50 border-gray-200' : 'text-gray-300 border-gray-100 cursor-not-allowed')}
                dangerouslySetInnerHTML={{ __html: link.label }}/>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
