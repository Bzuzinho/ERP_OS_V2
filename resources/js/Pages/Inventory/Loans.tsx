import React, { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import clsx from 'clsx'
import { Plus, X, AlertTriangle, CheckCircle, Clock, Package, User, Users } from 'lucide-react'

interface LoanItem { id: number; name: string; unit: string; current_stock: number }
interface Contact  { id: number; name: string }
interface Team     { id: number; name: string }
interface Loan {
  id: number; quantity: number; purpose?: string; borrower_name?: string
  condition_out?: string; condition_in?: string
  loaned_at: string; expected_return_at?: string; returned_at?: string
  status: string; notes?: string; is_overdue: boolean
  item: { name: string; unit: string }
  borrower_contact?: { name: string }
  team?: { name: string }
  registered_by?: { name: string }
}

const STATUS_BADGE: Record<string, string> = {
  activo:    'bg-blue-100 text-blue-800',
  devolvido: 'bg-green-100 text-green-800',
  atrasado:  'bg-red-100 text-red-800',
  perdido:   'bg-gray-100 text-gray-600',
}

function LoanForm({ items, contacts, teams, onClose }: {
  items: LoanItem[]; contacts: Contact[]; teams: Team[]; onClose: () => void
}) {
  const { data, setData, post, processing, errors } = useForm({
    inventory_item_id:   '',
    borrower_contact_id: '',
    team_id:             '',
    borrower_name:       '',
    quantity:            '1',
    purpose:             '',
    condition_out:       'Bom',
    loaned_at:           new Date().toISOString().split('T')[0],
    expected_return_at:  '',
    notes:               '',
  })

  const selectedItem = items.find(i => i.id === Number(data.inventory_item_id))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/inventario/emprestimos', { onSuccess: onClose })
  }

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
  const F = ({ label, err, children }: { label: string; err?: string; children: React.ReactNode }) => (
    <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}
      {err && <p className="text-xs text-red-500 mt-0.5">{err}</p>}</div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Registar empréstimo</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400"/></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <F label="Material *" err={errors.inventory_item_id}>
            <select className={inp} value={data.inventory_item_id} onChange={e => setData('inventory_item_id', e.target.value)} required>
              <option value="">Selecionar material…</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.name} (disponível: {i.current_stock} {i.unit})</option>)}
            </select>
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Quantidade *" err={errors.quantity}>
              <input className={inp} type="number" min="0.01" step="0.01" value={data.quantity}
                onChange={e => setData('quantity', e.target.value)} required/>
              {selectedItem && <p className="text-xs text-gray-400 mt-0.5">Disponível: {selectedItem.current_stock} {selectedItem.unit}</p>}
            </F>
            <F label="Condição de saída" err={errors.condition_out}>
              <select className={inp} value={data.condition_out} onChange={e => setData('condition_out', e.target.value)}>
                {['Novo','Bom','Razoável','Degradado'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </F>
          </div>
          <F label="Contacto (emprestado a)" err={errors.borrower_contact_id}>
            <select className={inp} value={data.borrower_contact_id} onChange={e => setData('borrower_contact_id', e.target.value)}>
              <option value="">— selecionar contacto —</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Nome livre (se não for contacto)" err={errors.borrower_name}>
              <input className={inp} value={data.borrower_name} onChange={e => setData('borrower_name', e.target.value)}
                placeholder="Nome da pessoa ou entidade"/>
            </F>
            <F label="Equipa" err={errors.team_id}>
              <select className={inp} value={data.team_id} onChange={e => setData('team_id', e.target.value)}>
                <option value="">— sem equipa —</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Data de saída *" err={errors.loaned_at}>
              <input className={inp} type="date" value={data.loaned_at} onChange={e => setData('loaned_at', e.target.value)} required/>
            </F>
            <F label="Devolução prevista" err={errors.expected_return_at}>
              <input className={inp} type="date" value={data.expected_return_at} onChange={e => setData('expected_return_at', e.target.value)}/>
            </F>
          </div>
          <F label="Finalidade" err={errors.purpose}>
            <input className={inp} value={data.purpose} onChange={e => setData('purpose', e.target.value)} placeholder="Para que vai ser usado…"/>
          </F>
          <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={processing} className="px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg disabled:opacity-60">
              {processing ? 'A registar…' : 'Registar empréstimo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReturnModal({ loan, onClose }: { loan: Loan; onClose: () => void }) {
  const [conditionIn, setConditionIn] = useState(loan.condition_out ?? 'Bom')
  const [status, setStatus]           = useState<'devolvido'|'perdido'>('devolvido')
  const [notes, setNotes]             = useState('')
  const [loading, setLoading]         = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    router.patch(`/inventario/emprestimos/${loan.id}/devolver`, { condition_in: conditionIn, status, notes }, {
      onFinish: () => { setLoading(false); onClose() }
    })
  }

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">Registar devolução</h3>
          <button onClick={onClose}><X size={16} className="text-gray-400"/></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
            <strong>{loan.item.name}</strong> — {loan.quantity} {loan.item.unit}
            <br/>{loan.borrower_contact?.name || loan.borrower_name || 'sem identificação'}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Resultado</label>
            <div className="grid grid-cols-2 gap-2">
              {[['devolvido','Devolvido'],['perdido','Perdido/Danificado']].map(([v,l]) => (
                <button key={v} type="button" onClick={() => setStatus(v as any)}
                  className={clsx('px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
                    status === v ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {status === 'devolvido' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Condição na devolução</label>
              <select className={inp} value={conditionIn} onChange={e => setConditionIn(e.target.value)}>
                {['Novo','Bom','Razoável','Degradado','Para abate'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
            <textarea className={inp} rows={2} value={notes} onChange={e => setNotes(e.target.value)}/>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg disabled:opacity-60">
              {loading ? 'A guardar…' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LoanCard({ loan, onReturn }: { loan: Loan; onReturn: (l: Loan) => void }) {
  const borrowerName = loan.borrower_contact?.name || loan.borrower_name || '—'
  const due = loan.expected_return_at ? new Date(loan.expected_return_at) : null
  const today = new Date()

  return (
    <div className={clsx('bg-white rounded-xl border shadow-sm p-4 space-y-3',
      loan.is_overdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200')}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-800 text-sm">{loan.item.name}</p>
          <p className="text-xs text-gray-500">{loan.quantity} {loan.item.unit}</p>
        </div>
        <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', STATUS_BADGE[loan.status])}>
          {loan.is_overdue ? 'Atrasado' : loan.status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><User size={11}/>{borrowerName}</span>
        {loan.team && <span className="flex items-center gap-1"><Users size={11}/>{loan.team.name}</span>}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="space-y-0.5">
          <p>Saída: {new Date(loan.loaned_at).toLocaleDateString('pt-PT')}</p>
          {due && (
            <p className={loan.is_overdue ? 'text-red-600 font-medium flex items-center gap-1' : ''}>
              {loan.is_overdue && <AlertTriangle size={10}/>}
              Devolução: {due.toLocaleDateString('pt-PT')}
            </p>
          )}
        </div>
        {loan.status === 'activo' && (
          <button onClick={() => onReturn(loan)}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700">
            <CheckCircle size={12}/> Devolver
          </button>
        )}
      </div>
      {loan.purpose && <p className="text-xs text-gray-400 italic truncate">{loan.purpose}</p>}
    </div>
  )
}

export default function InventoryLoans({ activeLoans, historyLoans, items, suppliers, teams }: {
  activeLoans: Loan[]; historyLoans: Loan[]
  items: LoanItem[]; suppliers: Contact[]; teams: Team[]
}) {
  const [showForm, setShowForm]       = useState(false)
  const [returning, setReturning]     = useState<Loan | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const overdue = activeLoans.filter(l => l.is_overdue)

  return (
    <>
      <Head title="Empréstimos — Recursos"/>
      <AdminLayout title="Recursos">
        <div className="space-y-5">
          {/* Alerta atrasos */}
          {overdue.length > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              <AlertTriangle size={16} className="flex-shrink-0"/>
              <strong>{overdue.length} empréstimo{overdue.length>1?'s':''} em atraso.</strong>
              {overdue.map(l => l.item.name).join(', ')}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Empréstimos activos <span className="text-gray-400 font-normal">({activeLoans.length})</span>
            </h2>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl">
              <Plus size={15}/> Novo empréstimo
            </button>
          </div>

          {activeLoans.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-400">
              <Package size={32} className="mx-auto mb-3 opacity-30"/>
              <p className="text-sm">Nenhum empréstimo activo</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeLoans.map(l => <LoanCard key={l.id} loan={l} onReturn={setReturning}/>)}
          </div>

          {/* Histórico */}
          {historyLoans.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setShowHistory(!showHistory)}>
                Histórico de devoluções ({historyLoans.length})
                {showHistory ? <AlertTriangle size={14}/> : <Clock size={14}/>}
              </button>
              {showHistory && (
                <table className="w-full text-xs">
                  <thead><tr className="border-t border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-2 font-semibold text-gray-500">Material</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-500">Emprestado a</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-500 hidden md:table-cell">Saída</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-500">Devolução</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-500 hidden lg:table-cell">Estado</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {historyLoans.map(l => (
                      <tr key={l.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2 font-medium text-gray-700">{l.item.name} <span className="text-gray-400">×{l.quantity}</span></td>
                        <td className="px-4 py-2 text-gray-500">{l.borrower_contact?.name || l.borrower_name || '—'}</td>
                        <td className="px-4 py-2 text-gray-400 hidden md:table-cell">{new Date(l.loaned_at).toLocaleDateString('pt-PT')}</td>
                        <td className="px-4 py-2 text-gray-400">{l.returned_at ? new Date(l.returned_at).toLocaleDateString('pt-PT') : '—'}</td>
                        <td className="px-4 py-2 hidden lg:table-cell">
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_BADGE[l.status])}>{l.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {showForm && (
          <LoanForm items={items} contacts={suppliers} teams={teams} onClose={() => setShowForm(false)}/>
        )}
        {returning && (
          <ReturnModal loan={returning} onClose={() => setReturning(null)}/>
        )}
      </AdminLayout>
    </>
  )
}
