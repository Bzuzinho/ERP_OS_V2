import React, { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, Package, AlertTriangle, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

const movColors: Record<string, string> = {
  entrada: 'text-green-600', reposição: 'text-green-600', devolução: 'text-green-600',
  saída: 'text-red-600', empréstimo: 'text-orange-600', quebra: 'text-red-700',
}

export default function InventoryIndex({ items, categories, filters, low_stock_count }: any) {
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number|null>(null)

  const { data, setData, post, processing, reset, errors } = useForm({
    name: '', reference: '', inventory_category_id: '', unit: 'un', min_stock: '0', location: '', description: '',
  })

  const movForm = useForm({ type: 'entrada', quantity: '', notes: '', occurred_at: '' })

  const applyFilter = (key: string, value: string) =>
    router.get('/inventario', { ...filters, [key]: value || undefined }, { preserveState: true })

  return (
    <AdminLayout title="Inventário">
      <Head title="Inventário — JuntaOS" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {low_stock_count > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800"><strong>{low_stock_count}</strong> {low_stock_count === 1 ? 'item' : 'itens'} com stock abaixo do mínimo.</p>
            <button onClick={() => applyFilter('low_stock', '1')} className="ml-auto text-xs text-amber-700 underline">Ver</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <select value={filters?.category ?? ''} onChange={e => applyFilter('category', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todas categorias</option>
              {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {filters?.low_stock && (
              <button onClick={() => applyFilter('low_stock', '')} className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg">Stock baixo ✕</button>
            )}
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Novo item
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Novo Item</h3>
            <form onSubmit={e => { e.preventDefault(); post('/inventario', { onSuccess: () => { reset(); setShowForm(false) } }) }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referência</label>
                <input type="text" value={data.reference} onChange={e => setData('reference', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select value={data.inventory_category_id} onChange={e => setData('inventory_category_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Sem categoria</option>
                  {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                <input type="text" value={data.unit} onChange={e => setData('unit', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
                <input type="number" value={data.min_stock} onChange={e => setData('min_stock', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                <input type="text" value={data.location} onChange={e => setData('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
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
          {(items?.data ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Sem itens no inventário.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(items?.data ?? []).map((item: any) => (
                <div key={item.id}>
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.current_stock <= item.min_stock && (
                          <AlertTriangle size={14} className="text-amber-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{item.category?.name ?? 'Sem categoria'} {item.reference ? `· ${item.reference}` : ''}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={clsx('text-lg font-bold', item.current_stock <= item.min_stock ? 'text-amber-600' : 'text-gray-800')}>
                        {item.current_stock} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                      </p>
                      <p className="text-xs text-gray-400">mín. {item.min_stock}</p>
                    </div>
                    <ChevronDown size={16} className={clsx('text-gray-400 transition-transform', expandedId === item.id && 'rotate-180')} />
                  </div>
                  {expandedId === item.id && (
                    <div className="px-5 pb-4 bg-gray-50">
                      <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase">Registar Movimento</h4>
                      <form onSubmit={e => { e.preventDefault(); movForm.post(`/inventario/${item.id}/movimentos`, { onSuccess: () => movForm.reset() }) }}
                        className="flex flex-wrap gap-3">
                        <select value={movForm.data.type} onChange={e => movForm.setData('type', e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                          {['entrada','saída','empréstimo','devolução','quebra','reposição'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input type="number" step="0.01" min="0.01" value={movForm.data.quantity} onChange={e => movForm.setData('quantity', e.target.value)}
                          placeholder="Qtd." className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <input type="text" value={movForm.data.notes} onChange={e => movForm.setData('notes', e.target.value)}
                          placeholder="Notas (opcional)" className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <button type="submit" disabled={movForm.processing}
                          className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors">
                          Registar
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
