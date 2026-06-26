import React, { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import clsx from 'clsx'
import { AlertTriangle, ArrowDown, ArrowUp, Package, TrendingDown, TrendingUp, X, Plus } from 'lucide-react'

interface StockItem {
  id: number; name: string; unit: string; item_type: string
  current_stock: number; min_stock: number; max_stock?: number
  location?: string; quality_grade?: string
  category?: { name: string }
}
interface Movement {
  id: number; type: string; quantity: number; notes?: string; occurred_at: string
  item: { name: string; unit: string }
  registered_by?: { name: string }
}
interface Summary { total: number; low: number; out: number; ok: number }

const MOV_ICONS: Record<string, React.ReactNode> = {
  'entrada':    <ArrowDown size={13} className="text-green-600"/>,
  'saída':      <ArrowUp   size={13} className="text-red-500"/>,
  'empréstimo': <ArrowUp   size={13} className="text-amber-500"/>,
  'devolução':  <ArrowDown size={13} className="text-blue-500"/>,
  'quebra':     <TrendingDown size={13} className="text-red-600"/>,
  'reposição':  <TrendingUp  size={13} className="text-green-500"/>,
}
const MOV_COLORS: Record<string,string> = {
  'entrada':'bg-green-50 text-green-700','saída':'bg-red-50 text-red-700',
  'empréstimo':'bg-amber-50 text-amber-700','devolução':'bg-blue-50 text-blue-700',
  'quebra':'bg-red-50 text-red-700','reposição':'bg-green-50 text-green-700',
}

function MovementModal({ item, onClose }: { item: StockItem; onClose: () => void }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    type:     'entrada',
    quantity: '',
    notes:    '',
  })
  function submit(e: React.FormEvent) {
    e.preventDefault()
    post(`/inventario/${item.id}/movimentos`, { onSuccess: () => { reset(); onClose() } })
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">Movimento — {item.name}</h3>
          <button onClick={onClose}><X size={16} className="text-gray-400"/></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de movimento</label>
            <div className="grid grid-cols-2 gap-2">
              {[['entrada','Entrada'],['saída','Saída'],['reposição','Reposição'],['quebra','Quebra/Perda']].map(([v,l]) => (
                <button key={v} type="button" onClick={() => setData('type', v)}
                  className={clsx('px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
                    data.type === v ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Quantidade ({item.unit}) — stock actual: <strong>{item.current_stock}</strong>
            </label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              type="number" min="0.01" step="0.01" value={data.quantity}
              onChange={e => setData('quantity', e.target.value)} required/>
            {errors.quantity && <p className="text-xs text-red-500 mt-0.5">{errors.quantity}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)}/>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={processing} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-60">
              {processing ? 'A registar…' : 'Registar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StockBar({ item }: { item: StockItem }) {
  const pct = item.max_stock ? Math.min(100, (item.current_stock / item.max_stock) * 100) : null
  const isOut  = item.current_stock <= 0
  const isLow  = !isOut && item.current_stock <= item.min_stock
  const color  = isOut ? 'bg-red-500' : isLow ? 'bg-amber-400' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <span className={clsx('text-sm font-semibold tabular-nums', isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-800')}>
        {item.current_stock}
      </span>
      {pct !== null && (
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
          <div className={clsx('h-full rounded-full', color)} style={{ width: `${pct}%` }}/>
        </div>
      )}
      <span className="text-xs text-gray-400 tabular-nums">
        {item.min_stock > 0 && `min:${item.min_stock}`}{item.max_stock ? ` max:${item.max_stock}` : ''}
      </span>
    </div>
  )
}

export default function InventoryStock({ items, recentMovements, summary }: {
  items: StockItem[]; recentMovements: Movement[]; summary: Summary
}) {
  const [movItem, setMovItem] = useState<StockItem | null>(null)
  const [filter, setFilter] = useState<'all'|'low'|'out'>('all')

  const filtered = items.filter(i => {
    if (filter === 'out') return i.current_stock <= 0
    if (filter === 'low') return i.current_stock <= i.min_stock && i.current_stock > 0
    return true
  })

  return (
    <>
      <Head title="Stock — Recursos"/>
      <AdminLayout title="Recursos">
        <div className="p-4 md:p-6 space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:'Total de itens', value: summary.total, color:'text-gray-700', bg:'bg-white', onClick: () => setFilter('all') },
              { label:'Stock OK',       value: summary.ok,    color:'text-green-700', bg: filter==='all'?'bg-green-50':'bg-white', onClick: () => setFilter('all') },
              { label:'Stock baixo',    value: summary.low,   color:'text-amber-700', bg: filter==='low'?'bg-amber-50':'bg-white', onClick: () => setFilter('low') },
              { label:'Esgotados',      value: summary.out,   color:'text-red-700',   bg: filter==='out'?'bg-red-50':'bg-white',   onClick: () => setFilter('out') },
            ].map(k => (
              <button key={k.label} onClick={k.onClick}
                className={clsx('rounded-2xl border border-gray-200 p-4 text-left transition-all hover:shadow-sm', k.bg)}>
                <p className="text-xs font-medium text-gray-500 mb-1">{k.label}</p>
                <p className={clsx('text-2xl font-bold', k.color)}>{k.value}</p>
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Lista de stock */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Package size={15}/>
                  {filter === 'all' ? 'Todos os itens' : filter === 'low' ? 'Stock baixo' : 'Esgotados'}
                  <span className="ml-1 text-xs font-normal text-gray-400">({filtered.length})</span>
                </h3>
                {filter !== 'all' && (
                  <button onClick={() => setFilter('all')} className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1"><X size={12}/>Limpar filtro</button>
                )}
              </div>
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {filtered.length === 0 && (
                  <p className="text-center py-10 text-gray-400 text-sm">Nenhum item nesta categoria</p>
                )}
                {filtered.map(item => {
                  const isOut = item.current_stock <= 0
                  const isLow = !isOut && item.current_stock <= item.min_stock
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50">
                      <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', isOut ? 'bg-red-500' : isLow ? 'bg-amber-400' : 'bg-green-400')}/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                          <button onClick={() => setMovItem(item)}
                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium flex-shrink-0">
                            <Plus size={12}/> Movimento
                          </button>
                        </div>
                        <div className="mt-1">
                          <StockBar item={item}/>
                        </div>
                        {(item.location || item.quality_grade) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {[item.location, item.quality_grade ? `Grau ${item.quality_grade}` : ''].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Movimentos recentes */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Movimentos recentes</h3>
              </div>
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {recentMovements.length === 0 && (
                  <p className="text-center py-10 text-gray-400 text-sm">Sem movimentos</p>
                )}
                {recentMovements.map(m => (
                  <div key={m.id} className="flex items-start gap-3 px-4 py-3">
                    <div className={clsx('mt-0.5 p-1 rounded-full', MOV_COLORS[m.type] ?? 'bg-gray-50')}>
                      {MOV_ICONS[m.type] ?? <Package size={13}/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{m.item?.name}</p>
                      <p className="text-xs text-gray-500">
                        <span className={clsx('font-medium', m.type === 'entrada' || m.type === 'reposição' || m.type === 'devolução' ? 'text-green-600' : 'text-red-600')}>
                          {['entrada','reposição','devolução'].includes(m.type) ? '+' : '-'}{m.quantity} {m.item?.unit}
                        </span>
                        {' · '}{m.type}
                      </p>
                      {m.notes && <p className="text-xs text-gray-400 truncate">{m.notes}</p>}
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        {new Date(m.occurred_at).toLocaleString('pt-PT', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                        {m.registered_by ? ` · ${m.registered_by.name}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {movItem && <MovementModal item={movItem} onClose={() => setMovItem(null)}/>}
      </AdminLayout>
    </>
  )
}
