import React, { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, Edit3, Trash2, Tag } from 'lucide-react'
import clsx from 'clsx'

const COLORS = [
  '#2563eb','#7c3aed','#0891b2','#d97706','#059669',
  '#dc2626','#db2777','#9333ea','#16a34a','#6b7280',
]

const CATEGORIES = [
  { value: 'externo', label: 'Externo' },
  { value: 'interno', label: 'Interno' },
  { value: 'misto',   label: 'Misto' },
]

function TypeForm({ initial, onSave, onCancel }: any) {
  const { data, setData, processing } = useForm(initial ?? {
    name: '', category: 'externo', color: '#2563eb', sort_order: 0,
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave(data)
  }

  return (
    <form onSubmit={submit} className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
          <input value={data.name} onChange={e => setData('name', e.target.value)} required
            placeholder="Ex: Associação, Empresa..."
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
          <select value={data.category} onChange={e => setData('category', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Ordem</label>
          <input type="number" value={data.sort_order} onChange={e => setData('sort_order', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Cor</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setData('color', c)}
              className={clsx('w-7 h-7 rounded-full border-2 transition-all', data.color === c ? 'border-gray-800 scale-110' : 'border-transparent')}
              style={{ backgroundColor: c }}/>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={processing}
          className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60">
          Guardar
        </button>
      </div>
    </form>
  )
}

export default function PersonTypesPage({ types }: any) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  function handleCreate(data: any) {
    router.post('/configuracoes/tipos-pessoa', data, {
      onSuccess: () => setCreating(false),
    })
  }

  function handleUpdate(id: number, data: any) {
    router.patch(`/configuracoes/tipos-pessoa/${id}`, data, {
      onSuccess: () => setEditingId(null),
    })
  }

  function handleDelete(id: number, name: string) {
    if (confirm(`Eliminar tipo "${name}"?`)) {
      router.delete(`/configuracoes/tipos-pessoa/${id}`)
    }
  }

  return (
    <AdminLayout title="Configurações — Tipos de Pessoa">
      <Head title="Tipos de Pessoa — JuntaOS"/>
      <div className="p-6 max-w-3xl mx-auto space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tipos de Pessoa</h1>
            <p className="text-sm text-gray-500 mt-0.5">Classifique os contactos externos por tipo</p>
          </div>
          {!creating && (
            <button onClick={() => setCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              <Plus size={15}/> Novo Tipo
            </button>
          )}
        </div>

        {creating && (
          <TypeForm onSave={handleCreate} onCancel={() => setCreating(false)}/>
        )}

        <div className="space-y-2">
          {types.length === 0 && !creating && (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
              <Tag size={36} className="mx-auto mb-2 opacity-25"/>
              <p>Sem tipos configurados.</p>
            </div>
          )}
          {types.map((t: any) => (
            <div key={t.id}>
              {editingId === t.id ? (
                <TypeForm
                  initial={{ name: t.name, category: t.category, color: t.color, sort_order: t.sort_order, is_active: t.is_active }}
                  onSave={(data: any) => handleUpdate(t.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                      {t.is_system && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">sistema</span>
                      )}
                      {!t.is_active && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">inativo</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 capitalize">{t.category} · ordem {t.sort_order}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setEditingId(t.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit3 size={14}/>
                    </button>
                    {!t.is_system && (
                      <button onClick={() => handleDelete(t.id, t.name)}
                        className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
