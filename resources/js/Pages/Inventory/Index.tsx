import React, { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import clsx from 'clsx'
import {
  Package, Plus, Search, X, Edit2, Trash2, ChevronDown, ChevronUp,
  Tag, Truck, AlertTriangle, CheckCircle, Filter,
} from 'lucide-react'

interface Category { id: number; name: string }
interface Supplier  { id: number; name: string; email?: string; phone?: string }
interface Item {
  id: number; name: string; reference?: string; barcode?: string
  description?: string; subcategory?: string; item_type: string; unit: string
  current_stock: number; min_stock: number; max_stock?: number
  location?: string; serial_number?: string
  purchase_date?: string; purchase_price?: number
  condition?: string; quality_grade?: string; quality_notes?: string
  is_active: boolean
  inventory_category_id?: number; category?: Category
  supplier_id?: number; supplier?: Supplier
}

const TYPE_LABELS: Record<string,string> = {
  consumivel: 'Consumível', reutilizavel: 'Reutilizável',
  equipamento: 'Equipamento', epi: 'EPI',
}
const TYPE_COLORS: Record<string,string> = {
  consumivel:  'bg-blue-100 text-blue-800',
  reutilizavel:'bg-purple-100 text-purple-800',
  equipamento: 'bg-amber-100 text-amber-800',
  epi:         'bg-green-100 text-green-800',
}

function StockBadge({ item }: { item: Item }) {
  if (item.current_stock <= 0)
    return <span className="text-xs font-semibold text-red-600">Esgotado</span>
  if (item.current_stock <= item.min_stock)
    return <span className="text-xs font-semibold text-amber-600 flex items-center gap-1"><AlertTriangle size={11}/> Stock baixo</span>
  return <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><CheckCircle size={11}/> {item.current_stock} {item.unit}</span>
}

function ItemForm({ categories, suppliers, subcategories, initial, onClose }: {
  categories: Category[]; suppliers: Supplier[]; subcategories: string[]
  initial?: Item; onClose: () => void
}) {
  const isEdit = !!initial
  const { data, setData, post, patch, processing, errors } = useForm({
    name:                  initial?.name ?? '',
    reference:             initial?.reference ?? '',
    barcode:               initial?.barcode ?? '',
    inventory_category_id: initial?.inventory_category_id?.toString() ?? '',
    supplier_id:           initial?.supplier_id?.toString() ?? '',
    subcategory:           initial?.subcategory ?? '',
    item_type:             initial?.item_type ?? 'consumivel',
    description:           initial?.description ?? '',
    unit:                  initial?.unit ?? 'un',
    current_stock:         initial?.current_stock?.toString() ?? '0',
    min_stock:             initial?.min_stock?.toString() ?? '0',
    max_stock:             initial?.max_stock?.toString() ?? '',
    location:              initial?.location ?? '',
    serial_number:         initial?.serial_number ?? '',
    purchase_date:         initial?.purchase_date ?? '',
    purchase_price:        initial?.purchase_price?.toString() ?? '',
    condition:             initial?.condition ?? '',
    quality_grade:         initial?.quality_grade ?? '',
    quality_notes:         initial?.quality_notes ?? '',
  })

  const [subcatInput, setSubcatInput] = useState(data.subcategory)
  const [showSubcatList, setShowSubcatList] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const opts = { onSuccess: onClose }
    if (isEdit) patch(`/inventario/${initial!.id}`, opts)
    else        post('/inventario', opts)
  }

  const F = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
  const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">{isEdit ? 'Editar material' : 'Novo material'}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-700"/></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-5">

          {/* Identificação */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <F label="Nome *" error={errors.name}>
                <input className={inp} value={data.name} onChange={e => setData('name', e.target.value)} required/>
              </F>
            </div>
            <F label="Referência" error={errors.reference}>
              <input className={inp} value={data.reference} onChange={e => setData('reference', e.target.value)} placeholder="REF-001"/>
            </F>
            <F label="Código de barras" error={errors.barcode}>
              <input className={inp} value={data.barcode} onChange={e => setData('barcode', e.target.value)}/>
            </F>
          </div>

          {/* Classificação */}
          <div className="grid grid-cols-2 gap-4">
            <F label="Tipo *" error={errors.item_type}>
              <select className={inp} value={data.item_type} onChange={e => setData('item_type', e.target.value)}>
                {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </F>
            <F label="Categoria" error={errors.inventory_category_id}>
              <select className={inp} value={data.inventory_category_id} onChange={e => setData('inventory_category_id', e.target.value)}>
                <option value="">— sem categoria —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </F>
            <div className="relative">
              <F label="Género / Subcategoria" error={errors.subcategory}>
                <input className={inp} value={subcatInput}
                  onChange={e => { setSubcatInput(e.target.value); setData('subcategory', e.target.value); setShowSubcatList(true) }}
                  onFocus={() => setShowSubcatList(true)}
                  onBlur={() => setTimeout(() => setShowSubcatList(false), 150)}
                  placeholder="ex: Elétrica, Limpeza…"/>
                {showSubcatList && subcategories.filter(s => s.toLowerCase().includes(subcatInput.toLowerCase())).length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {subcategories.filter(s => s.toLowerCase().includes(subcatInput.toLowerCase())).map(s => (
                      <li key={s} className="px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50"
                        onMouseDown={() => { setSubcatInput(s); setData('subcategory', s) }}>{s}</li>
                    ))}
                  </ul>
                )}
              </F>
            </div>
            <F label="Fornecedor (entidade)" error={errors.supplier_id}>
              <select className={inp} value={data.supplier_id} onChange={e => setData('supplier_id', e.target.value)}>
                <option value="">— sem fornecedor —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </F>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-4 gap-3">
            <F label="Unidade *" error={errors.unit}>
              <select className={inp} value={data.unit} onChange={e => setData('unit', e.target.value)}>
                {['un','kg','g','l','ml','m','m²','m³','cx','pct','par','rolo','h'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </F>
            {!isEdit && (
              <F label="Stock inicial" error={errors.current_stock}>
                <input className={inp} type="number" min="0" step="0.01" value={data.current_stock} onChange={e => setData('current_stock', e.target.value)}/>
              </F>
            )}
            <F label="Stock mínimo" error={errors.min_stock}>
              <input className={inp} type="number" min="0" step="0.01" value={data.min_stock} onChange={e => setData('min_stock', e.target.value)}/>
            </F>
            <F label="Stock máximo" error={errors.max_stock}>
              <input className={inp} type="number" min="0" step="0.01" value={data.max_stock} onChange={e => setData('max_stock', e.target.value)} placeholder="—"/>
            </F>
          </div>

          {/* Localização & condição */}
          <div className="grid grid-cols-2 gap-4">
            <F label="Localização" error={errors.location}>
              <input className={inp} value={data.location} onChange={e => setData('location', e.target.value)} placeholder="Armazém A, Prateleira 3…"/>
            </F>
            <F label="Nº série" error={errors.serial_number}>
              <input className={inp} value={data.serial_number} onChange={e => setData('serial_number', e.target.value)}/>
            </F>
            <F label="Condição" error={errors.condition}>
              <select className={inp} value={data.condition} onChange={e => setData('condition', e.target.value)}>
                <option value="">—</option>
                {['Novo','Bom','Razoável','Degradado','Para abate'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </F>
            <F label="Grau de qualidade" error={errors.quality_grade}>
              <select className={inp} value={data.quality_grade} onChange={e => setData('quality_grade', e.target.value)}>
                <option value="">—</option>
                {['A','B','C'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </F>
          </div>

          {/* Compra */}
          <div className="grid grid-cols-2 gap-4">
            <F label="Data de compra" error={errors.purchase_date}>
              <input className={inp} type="date" value={data.purchase_date} onChange={e => setData('purchase_date', e.target.value)}/>
            </F>
            <F label="Preço de compra (€)" error={errors.purchase_price}>
              <input className={inp} type="number" min="0" step="0.01" value={data.purchase_price} onChange={e => setData('purchase_price', e.target.value)}/>
            </F>
          </div>

          <F label="Descrição" error={errors.description}>
            <textarea className={inp} rows={2} value={data.description} onChange={e => setData('description', e.target.value)}/>
          </F>
          <F label="Notas de qualidade" error={errors.quality_notes}>
            <textarea className={inp} rows={2} value={data.quality_notes} onChange={e => setData('quality_notes', e.target.value)}/>
          </F>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={processing} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
              {processing ? 'A guardar…' : isEdit ? 'Guardar' : 'Criar material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function InventoryIndex({ items, categories, suppliers, subcategories, filters }: {
  items: any; categories: Category[]; suppliers: Supplier[]; subcategories: string[]
  filters: Record<string,string>
}) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)
  const [showCatForm, setShowCatForm] = useState(false)
  const [catName, setCatName] = useState('')
  const [localFilters, setLocalFilters] = useState(filters)

  function applyFilter(k: string, v: string) {
    const f = { ...localFilters, [k]: v }
    if (!v) delete f[k]
    setLocalFilters(f)
    router.get('/inventario', f, { preserveState: true, replace: true })
  }

  function createCategory(e: React.FormEvent) {
    e.preventDefault()
    router.post('/inventario/categorias', { name: catName }, {
      onSuccess: () => { setCatName(''); setShowCatForm(false) }
    })
  }

  function deactivate(item: Item) {
    if (confirm(`Desativar "${item.name}"?`))
      router.delete(`/inventario/${item.id}`)
  }

  return (
    <>
      <Head title="Catálogo de Recursos"/>
      <AdminLayout title="Recursos">
        <div className="p-4 md:p-6 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Pesquisar nome, referência, código…"
                value={localFilters.search ?? ''}
                onChange={e => applyFilter('search', e.target.value)}
              />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none"
              value={localFilters.type ?? ''} onChange={e => applyFilter('type', e.target.value)}>
              <option value="">Todos os tipos</option>
              {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none"
              value={localFilters.category ?? ''} onChange={e => applyFilter('category', e.target.value)}>
              <option value="">Todas as categorias</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {subcategories.length > 0 && (
              <select className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none"
                value={localFilters.subcategory ?? ''} onChange={e => applyFilter('subcategory', e.target.value)}>
                <option value="">Todos os géneros</option>
                {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            <button onClick={() => setShowCatForm(!showCatForm)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              <Tag size={14}/> Categorias
            </button>
            <button onClick={() => { setEditing(null); setShowForm(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl">
              <Plus size={15}/> Novo material
            </button>
          </div>

          {/* Nova categoria inline */}
          {showCatForm && (
            <form onSubmit={createCategory} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <Tag size={14} className="text-gray-400 flex-shrink-0"/>
              <input className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Nome da nova categoria…" value={catName} onChange={e => setCatName(e.target.value)} required/>
              <button type="submit" className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg">Criar</button>
              <button type="button" onClick={() => setShowCatForm(false)} className="text-gray-400 hover:text-gray-700"><X size={15}/></button>
            </form>
          )}

          {/* Tabela */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Material</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Tipo / Categoria</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Fornecedor</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Localização</th>
                  <th className="px-4 py-3.5"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.data?.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Nenhum material encontrado</td></tr>
                )}
                {items.data?.map((item: Item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {(item.reference || item.barcode) && (
                        <p className="text-xs text-gray-400">{[item.reference, item.barcode].filter(Boolean).join(' · ')}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', TYPE_COLORS[item.item_type])}>
                        {TYPE_LABELS[item.item_type]}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">{[item.category?.name, item.subcategory].filter(Boolean).join(' › ') || '—'}</p>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      {item.supplier
                        ? <span className="flex items-center gap-1 text-xs text-gray-600"><Truck size={11}/>{item.supplier.name}</span>
                        : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <StockBadge item={item}/>
                      {item.max_stock && (
                        <div className="mt-1 h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                          <div className={clsx('h-full rounded-full', item.isLowStock ? 'bg-amber-400' : 'bg-green-400')}
                            style={{ width: `${Math.min(100,(item.current_stock/(item.max_stock||1))*100)}%` }}/>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500 hidden xl:table-cell">{item.location || '—'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => { setEditing(item); setShowForm(true) }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                          <Edit2 size={14}/>
                        </button>
                        <button onClick={() => deactivate(item)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Paginação */}
            {items.last_page > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
                <span>{items.total} materiais</span>
                <div className="flex gap-1">
                  {items.links?.map((l: any, i: number) => (
                    <button key={i} onClick={() => l.url && router.get(l.url)}
                      disabled={!l.url || l.active}
                      className={clsx('px-3 py-1 rounded-lg text-xs',
                        l.active ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 disabled:opacity-40')}
                      dangerouslySetInnerHTML={{ __html: l.label }}/>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {showForm && (
          <ItemForm
            categories={categories} suppliers={suppliers} subcategories={subcategories}
            initial={editing ?? undefined}
            onClose={() => { setShowForm(false); setEditing(null) }}
          />
        )}
      </AdminLayout>
    </>
  )
}
