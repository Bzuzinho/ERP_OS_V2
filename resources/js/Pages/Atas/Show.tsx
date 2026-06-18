import React, { useState } from 'react'
import { Head, Link, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft, CheckCircle2, Clock, Edit2, Save, X, Trash2 } from 'lucide-react'
import clsx from 'clsx'

export default function AtasShow({ ata }: any) {
  const [editing, setEditing] = useState(false)
  const { data, setData, patch, processing } = useForm({
    title: ata.title ?? '', meeting_date: ata.meeting_date?.slice(0,10) ?? '',
    visibility: ata.visibility ?? 'interno', description: ata.description ?? '',
    content: ata.content ?? '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    patch(`/atas/${ata.id}`, { onSuccess: () => setEditing(false) })
  }

  function approve() {
    router.post(`/documentos/${ata.id}/aprovar`)
  }

  function destroy() {
    if (confirm('Eliminar esta ata?')) router.delete(`/atas/${ata.id}`)
  }

  return (
    <AdminLayout title="Ata">
      <Head title={`${ata.title} — JuntaOS`}/>
      <div className="p-6 max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/atas" className="p-1.5 rounded-lg hover:bg-gray-100"><ArrowLeft size={18} className="text-gray-600"/></Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{ata.title}</h1>
              <p className="text-sm text-gray-500">
                {ata.meeting_date ? new Date(ata.meeting_date).toLocaleDateString('pt-PT',{day:'2-digit',month:'long',year:'numeric'}) : '—'}
                {ata.creator && ` · por ${ata.creator.name}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!ata.is_approved && (
              <button onClick={approve}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                <CheckCircle2 size={14}/> Aprovar
              </button>
            )}
            <button onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              {editing ? <X size={14}/> : <Edit2 size={14}/>} {editing ? 'Cancelar' : 'Editar'}
            </button>
            <button onClick={destroy} className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={16}/>
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <span className={clsx('text-xs px-2.5 py-0.5 rounded-full font-medium',
            ata.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
            {ata.is_approved ? 'Aprovada' : 'Pendente de aprovação'}
          </span>
          <span className={clsx('text-xs px-2.5 py-0.5 rounded-full font-medium',
            ata.visibility === 'público' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600')}>
            {ata.visibility}
          </span>
        </div>

        {editing ? (
          <form onSubmit={submit} className="bg-white rounded-xl border border-primary-200 p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input value={data.title} onChange={e => setData('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data da Reunião</label>
                <input type="date" value={data.meeting_date} onChange={e => setData('meeting_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required/>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo da Ata</label>
                <textarea value={data.content} onChange={e => setData('content', e.target.value)} rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"/>
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {ata.description && (
              <p className="text-sm text-gray-500 italic mb-6 pb-5 border-b border-gray-100">{ata.description}</p>
            )}
            {ata.content ? (
              <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {ata.content}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">Sem conteúdo. Clique em Editar para adicionar o texto da ata.</p>
            )}
            {ata.is_approved && ata.approver && (
              <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
                Aprovada por {ata.approver.name} em {new Date(ata.approved_at).toLocaleDateString('pt-PT')}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
