import React from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, Calendar, Check, X } from 'lucide-react'
import clsx from 'clsx'

const statusColors: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-700',
  aprovada: 'bg-green-100 text-green-700',
  rejeitada: 'bg-red-100 text-red-700',
  cancelada: 'bg-gray-100 text-gray-600',
}

export default function ReservationsIndex({ reservations, spaces, filters }: any) {
  const rejectForm = useForm({ rejection_reason: '' })
  const [rejectingId, setRejectingId] = React.useState<number|null>(null)

  const applyFilter = (key: string, value: string) =>
    router.get('/reservas', { ...filters, [key]: value || undefined }, { preserveState: true })

  const approve = (id: number) => router.post(`/reservas/${id}/aprovar`)
  const reject  = (id: number) => {
    rejectForm.post(`/reservas/${id}/rejeitar`, { onSuccess: () => setRejectingId(null) })
  }

  return (
    <AdminLayout title="Reservas">
      <Head title="Reservas — JuntaOS" />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <select value={filters?.status ?? ''} onChange={e => applyFilter('status', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todos os estados</option>
              {['pendente','aprovada','rejeitada','cancelada'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters?.space ?? ''} onChange={e => applyFilter('space', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todos os espaços</option>
              {spaces?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Link href="/reservas/nova" className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Nova reserva
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {(reservations?.data ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Calendar size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Sem reservas encontradas.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Título','Espaço','Requerente','Início','Fim','Estado','Ações'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(reservations?.data ?? []).map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.title}</td>
                    <td className="px-4 py-3 text-gray-600">{r.space?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.contact?.name ?? r.user?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.starts_at).toLocaleString('pt-PT',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.ends_at).toLocaleString('pt-PT',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                    <td className="px-4 py-3"><span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[r.status])}>{r.status}</span></td>
                    <td className="px-4 py-3">
                      {r.status === 'pendente' && (
                        <div className="flex gap-2">
                          <button onClick={() => approve(r.id)} className="p-1.5 rounded bg-green-100 hover:bg-green-200 text-green-700 transition-colors" title="Aprovar"><Check size={14}/></button>
                          <button onClick={() => setRejectingId(r.id)} className="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors" title="Rejeitar"><X size={14}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {reservations?.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Página {reservations.current_page} de {reservations.last_page}</p>
              <div className="flex gap-2">
                {reservations.prev_page_url && <Link href={reservations.prev_page_url} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Anterior</Link>}
                {reservations.next_page_url && <Link href={reservations.next_page_url} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Próxima</Link>}
              </div>
            </div>
          )}
        </div>

        {/* Reject modal */}
        {rejectingId && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <h3 className="font-semibold text-gray-800 mb-3">Rejeitar Reserva</h3>
              <textarea value={rejectForm.data.rejection_reason} onChange={e => rejectForm.setData('rejection_reason', e.target.value)}
                rows={3} placeholder="Motivo da rejeição (opcional)..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4" />
              <div className="flex gap-3">
                <button onClick={() => reject(rejectingId!)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">Rejeitar</button>
                <button onClick={() => setRejectingId(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
