import React from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft } from 'lucide-react'

export default function TicketCreate({ contacts, serviceAreas, users }: any) {
  const { data, setData, post, processing, errors } = useForm({
    title: '', description: '', priority: 'normal', origin: 'interno',
    contact_id: '', assigned_to: '', service_area_id: '',
  })

  const submit = (e: React.FormEvent) => { e.preventDefault(); post('/pedidos') }

  return (
    <AdminLayout title="Novo Pedido">
      <Head title="Novo Pedido — JuntaOS" />
      <div className="p-6 max-w-2xl mx-auto">
        <Link href="/pedidos" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"><ArrowLeft size={16} /> Voltar</Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Criar Pedido</h2>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <select value={data.priority} onChange={e => setData('priority', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {['baixa','normal','alta','urgente'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
                <select value={data.origin} onChange={e => setData('origin', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {['portal','presencial','telefone','email','interno'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                <select value={data.contact_id} onChange={e => setData('contact_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Sem contacto</option>
                  {contacts?.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área Funcional</label>
                <select value={data.service_area_id} onChange={e => setData('service_area_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Sem área</option>
                  {serviceAreas?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Não atribuído</option>
                {users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={processing}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
                {processing ? 'A criar...' : 'Criar Pedido'}
              </button>
              <Link href="/pedidos" className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancelar</Link>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
