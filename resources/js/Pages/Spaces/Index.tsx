import React, { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react'
import clsx from 'clsx'

export default function SpacesIndex({ spaces }: any) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const { data, setData, post, patch, processing, reset, errors } = useForm({
    name: '', type: 'outro', description: '', capacity: '', location: '', is_public: true,
  })

  const openEdit = (s: any) => {
    setEditing(s)
    setData({ name: s.name, type: s.type, description: s.description??'', capacity: s.capacity??'', location: s.location??'', is_public: s.is_public })
    setShowForm(true)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      router.patch(`/espacos/${editing.id}`, data, { onSuccess: () => { reset(); setEditing(null); setShowForm(false) } })
    } else {
      post('/espacos', { onSuccess: () => { reset(); setShowForm(false) } })
    }
  }

  const spaceTypes = ['salão','auditório','sala_reuniões','pavilhão','campo','espaço_público','outro']

  return (
    <AdminLayout title="Espaços">
      <Head title="Espaços — JuntaOS" />
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-end">
          <button onClick={() => { setShowForm(!showForm); setEditing(null); reset() }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Novo espaço
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Editar Espaço' : 'Novo Espaço'}</h3>
            <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={data.type} onChange={e => setData('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {spaceTypes.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade</label>
                <input type="number" value={data.capacity} onChange={e => setData('capacity', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                <input type="text" value={data.location} onChange={e => setData('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_public" checked={data.is_public} onChange={e => setData('is_public', e.target.checked)} className="rounded" />
                <label htmlFor="is_public" className="text-sm text-gray-700">Espaço público (visível no portal)</label>
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={processing}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors">
                  {processing ? 'A guardar...' : editing ? 'Guardar' : 'Criar'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); reset() }}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(spaces?.data ?? []).length === 0 ? (
            <div className="col-span-3 flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
              <Building2 size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Sem espaços cadastrados.</p>
            </div>
          ) : (
            (spaces?.data ?? []).map((s: any) => (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{s.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{s.type?.replace('_',' ')}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"><Pencil size={14}/></button>
                    <button onClick={() => router.delete(`/espacos/${s.id}`)} className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors"><Trash2 size={14}/></button>
                  </div>
                </div>
                {s.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{s.description}</p>}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {s.capacity && <span>👥 {s.capacity} lugares</span>}
                  {s.location && <span>📍 {s.location}</span>}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full', s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{s.is_active ? 'Ativo' : 'Inativo'}</span>
                  {s.is_public && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Portal</span>}
                  <span className="text-xs text-gray-400 ml-auto">{s.reservations_count} reservas</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
