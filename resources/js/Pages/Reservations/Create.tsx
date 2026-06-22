import React from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft } from 'lucide-react'

export default function ReservationCreate({ spaces, contacts }: any) {
  const { data, setData, post, processing, errors } = useForm({
    space_id: '', contact_id: '', title: '', purpose: '',
    starts_at: '', ends_at: '', expected_attendees: '',
  })

  return (
    <AdminLayout title="Nova Reserva">
      <Head title="Nova Reserva" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <Link href="/reservas" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"><ArrowLeft size={16} /> Voltar</Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Pedir Reserva</h2>
          <form onSubmit={e => { e.preventDefault(); post('/reservas') }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Espaço *</label>
              <select value={data.space_id} onChange={e => setData('space_id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Selecionar espaço</option>
                {spaces?.map((s: any) => <option key={s.id} value={s.id}>{s.name} {s.capacity ? `(cap. ${s.capacity})` : ''}</option>)}
              </select>
              {errors.space_id && <p className="text-xs text-red-600 mt-1">{errors.space_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título do evento *</label>
              <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade</label>
              <textarea value={data.purpose} onChange={e => setData('purpose', e.target.value)} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Início *</label>
                <input type="datetime-local" value={data.starts_at} onChange={e => setData('starts_at', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                {errors.starts_at && <p className="text-xs text-red-600 mt-1">{errors.starts_at}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fim *</label>
                <input type="datetime-local" value={data.ends_at} onChange={e => setData('ends_at', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requerente</label>
                <select value={data.contact_id} onChange={e => setData('contact_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Sem requerente</option>
                  {contacts?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participantes esperados</label>
                <input type="number" value={data.expected_attendees} onChange={e => setData('expected_attendees', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={processing}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors">
                {processing ? 'A enviar...' : 'Submeter Pedido'}
              </button>
              <Link href="/reservas" className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancelar</Link>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
