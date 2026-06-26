import React, { useState } from 'react'
import { Head, useForm, router, usePage } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import clsx from 'clsx'
import { Plus, X, Check, XCircle, Package, ChevronDown, Clock, AlertTriangle, Truck } from 'lucide-react'

interface ReqItem { id: number; name: string; unit: string; current_stock: number; item_type: string }
interface Team    { id: number; name: string }
interface Req {
  id: number; quantity_requested: number; quantity_delivered?: number; purpose?: string
  status: string; rejection_reason?: string
  approved_at?: string; delivered_at?: string; created_at: string
  item: { name: string; unit: string; current_stock: number }
  requester: { name: string }
  approver?: { name: string }
  team?: { name: string }
}

const STATUS: Record<string,{ label:string; color:string; icon: React.ReactNode }> = {
  pendente:  { label:'Pendente',  color:'bg-amber-100 text-amber-800',  icon:<Clock size={11}/> },
  aprovada:  { label:'Aprovada',  color:'bg-blue-100 text-blue-800',   icon:<Check size={11}/> },
  rejeitada: { label:'Rejeitada', color:'bg-red-100 text-red-800',     icon:<XCircle size={11}/> },
  entregue:  { label:'Entregue',  color:'bg-green-100 text-green-800', icon:<Truck size={11}/> },
  cancelada: { label:'Cancelada', color:'bg-gray-100 text-gray-500',   icon:<X size={11}/> },
}

function ReqForm({ items, teams, onClose }: { items: ReqItem[]; teams: Team[]; onClose: () => void }) {
  const { data, setData, post, processing, errors } = useForm({
    inventory_item_id:  '',
    team_id:            '',
    quantity_requested: '1',
    purpose:            '',
  })

  const selected = items.find(i => i.id === Number(data.inventory_item_id))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/inventario/requisicoes', { onSuccess: onClose })
  }

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Nova requisição de material</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400"/></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Material *</label>
            <select className={inp} value={data.inventory_item_id} onChange={e => setData('inventory_item_id', e.target.value)} required>
              <option value="">Selecionar material…</option>
              {items.map(i => (
                <option key={i.id} value={i.id}>
                  {i.name} (disponível: {i.current_stock} {i.unit})
                </option>
              ))}
            </select>
            {errors.inventory_item_id && <p className="text-xs text-red-500 mt-0.5">{errors.inventory_item_id}</p>}
            {selected && selected.current_stock <= 0 && (
              <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1"><AlertTriangle size={11}/> Stock esgotado — a requisição ficará pendente de reposição</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade * {selected && `(${selected.unit})`}</label>
              <input className={inp} type="number" min="0.01" step="0.01" value={data.quantity_requested}
                onChange={e => setData('quantity_requested', e.target.value)} required/>
              {errors.quantity_requested && <p className="text-xs text-red-500 mt-0.5">{errors.quantity_requested}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Equipa</label>
              <select className={inp} value={data.team_id} onChange={e => setData('team_id', e.target.value)}>
                <option value="">— sem equipa —</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Finalidade / Justificação</label>
            <textarea className={inp} rows={3} value={data.purpose}
              onChange={e => setData('purpose', e.target.value)}
              placeholder="Para que vai ser usado, onde, quando…"/>
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={processing} className="px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg disabled:opacity-60">
              {processing ? 'A submeter…' : 'Submeter requisição'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RejectModal({ req, onClose }: { req: Req; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    router.patch(`/inventario/requisicoes/${req.id}/rejeitar`, { rejection_reason: reason }, {
      onFinish: () => { setLoading(false); onClose() }
    })
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Rejeitar requisição</h3>
          <button onClick={onClose}><X size={16} className="text-gray-400"/></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <p className="text-sm text-gray-600"><strong>{req.item.name}</strong> — {req.quantity_requested} {req.item.unit} pedido por <strong>{req.requester.name}</strong></p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Motivo de rejeição</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3} value={reason} onChange={e => setReason(e.target.value)}/>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg disabled:opacity-60">
              {loading ? '…' : 'Rejeitar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeliverModal({ req, onClose }: { req: Req; onClose: () => void }) {
  const [qty, setQty] = useState(req.quantity_requested.toString())
  const [loading, setLoading] = useState(false)
  function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    router.patch(`/inventario/requisicoes/${req.id}/entregar`, { quantity_delivered: qty }, {
      onFinish: () => { setLoading(false); onClose() }
    })
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Registar entrega</h3>
          <button onClick={onClose}><X size={16} className="text-gray-400"/></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <p className="text-sm text-gray-600"><strong>{req.item.name}</strong> para <strong>{req.requester.name}</strong></p>
          <p className="text-xs text-gray-400">Stock disponível: {req.item.current_stock} {req.item.unit}</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade entregue ({req.item.unit})</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              type="number" min="0.01" step="0.01" value={qty} onChange={e => setQty(e.target.value)} required/>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg disabled:opacity-60">
              {loading ? '…' : 'Confirmar entrega'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReqRow({ req, canApprove, onReject, onDeliver }: {
  req: Req; canApprove: boolean
  onReject: (r: Req) => void; onDeliver: (r: Req) => void
}) {
  const s = STATUS[req.status]
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-800">{req.item.name}</p>
        {req.purpose && <p className="text-xs text-gray-400 truncate max-w-[200px]">{req.purpose}</p>}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{req.requester.name}</td>
      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{req.team?.name || '—'}</td>
      <td className="px-4 py-3 text-sm tabular-nums">{req.quantity_requested} {req.item.unit}</td>
      <td className="px-4 py-3">
        <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', s.color)}>
          {s.icon}{s.label}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
        {new Date(req.created_at).toLocaleDateString('pt-PT')}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          {req.status === 'pendente' && canApprove && (
            <>
              <button onClick={() => router.patch(`/inventario/requisicoes/${req.id}/aprovar`)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium rounded-lg">
                <Check size={11}/> Aprovar
              </button>
              <button onClick={() => onReject(req)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium rounded-lg">
                <XCircle size={11}/> Rejeitar
              </button>
            </>
          )}
          {req.status === 'aprovada' && canApprove && (
            <button onClick={() => onDeliver(req)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium rounded-lg">
              <Truck size={11}/> Entregar
            </button>
          )}
          {req.status === 'rejeitada' && req.rejection_reason && (
            <span className="text-xs text-gray-400 italic max-w-[120px] truncate" title={req.rejection_reason}>
              "{req.rejection_reason}"
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function InventoryRequisitions({ pendingRequisitions, otherRequisitions, items, teams }: {
  pendingRequisitions: Req[]; otherRequisitions: Req[]
  items: ReqItem[]; teams: Team[]
}) {
  const { props } = usePage()
  const user = (props as any).auth?.user
  const canApprove = user?.role === 'admin' || user?.role === 'executivo' || user?.role === 'administrativo'

  const [showForm, setShowForm]     = useState(false)
  const [rejecting, setRejecting]   = useState<Req | null>(null)
  const [delivering, setDelivering] = useState<Req | null>(null)
  const [showOthers, setShowOthers] = useState(true)

  return (
    <>
      <Head title="Requisições — Recursos"/>
      <AdminLayout title="Recursos">
        <div className="p-4 md:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Requisições pendentes
              {pendingRequisitions.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-amber-500 rounded-full">
                  {pendingRequisitions.length}
                </span>
              )}
            </h2>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl">
              <Plus size={15}/> Nova requisição
            </button>
          </div>

          {/* Pendentes */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {pendingRequisitions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Package size={28} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Sem requisições pendentes</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100 bg-amber-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Material</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Pedido por</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Equipa</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Qtd.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Data</th>
                  <th className="px-4 py-3"/>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingRequisitions.map(r => (
                    <ReqRow key={r.id} req={r} canApprove={canApprove} onReject={setRejecting} onDeliver={setDelivering}/>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Aprovadas + histórico */}
          {otherRequisitions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                onClick={() => setShowOthers(!showOthers)}>
                Histórico ({otherRequisitions.length})
                <ChevronDown size={14} className={clsx('transition-transform', showOthers && 'rotate-180')}/>
              </button>
              {showOthers && (
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Material</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Pedido por</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Equipa</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Qtd.</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Data</th>
                    <th className="px-4 py-2.5"/>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {otherRequisitions.map(r => (
                      <ReqRow key={r.id} req={r} canApprove={canApprove} onReject={setRejecting} onDeliver={setDelivering}/>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {showForm    && <ReqForm    items={items} teams={teams} onClose={() => setShowForm(false)}/>}
        {rejecting   && <RejectModal  req={rejecting}   onClose={() => setRejecting(null)}/>}
        {delivering  && <DeliverModal req={delivering}  onClose={() => setDelivering(null)}/>}
      </AdminLayout>
    </>
  )
}
