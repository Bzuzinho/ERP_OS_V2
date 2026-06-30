import React from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ChevronLeft } from 'lucide-react'
import clsx from 'clsx'

const PRIORITY_OPTIONS = [
  { value: 'baixa',   label: 'Baixa' },
  { value: 'normal',  label: 'Normal' },
  { value: 'alta',    label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

const ORIGIN_OPTIONS = [
  { value: 'portal',     label: 'Portal do Munícipe' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'telefone',   label: 'Telefone' },
  { value: 'email',      label: 'Email' },
  { value: 'interno',    label: 'Interno' },
]

const TYPE_OPTIONS = [
  { value: 'externo', label: 'Externo (munícipe)' },
  { value: 'interno', label: 'Interno (colaboradores)' },
]

export default function TicketEdit({ ticket, contacts = [], serviceAreas = [], users = [], teams = [] }: any) {
  const { data, setData, patch, processing, errors } = useForm({
    title:           ticket.title ?? '',
    tema:            ticket.tema ?? '',
    description:     ticket.description ?? '',
    priority:        ticket.priority ?? 'normal',
    origin:          ticket.origin ?? 'interno',
    ticket_type:     ticket.ticket_type ?? 'externo',
    contact_id:      ticket.contact_id ? String(ticket.contact_id) : '',
    service_area_id: ticket.service_area_id ? String(ticket.service_area_id) : '',
    assigned_to:     ticket.assigned_to ? String(ticket.assigned_to) : '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    patch(`/pedidos/${ticket.id}`, {
      onSuccess: () => window.location.href = `/pedidos/${ticket.id}`,
    })
  }

  const field = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400'

  return (
    <AdminLayout title={`Editar ${ticket.reference}`}>
      <Head title={`Editar ${ticket.reference} — JuntaOS`} />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href={`/pedidos/${ticket.id}`} className="hover:text-primary-600 flex items-center gap-1">
            <ChevronLeft size={14}/>{ticket.reference}
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Editar</span>
        </div>

        <form onSubmit={submit} className="space-y-5">

          {/* Dados principais */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Dados do pedido</h2>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Título *</label>
              <input value={data.title} onChange={e => setData('title', e.target.value)} required className={field}/>
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tema</label>
              <input value={data.tema} onChange={e => setData('tema', e.target.value)} placeholder="ex: Urbanismo, Espaços verdes…" className={field}/>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Descrição</label>
              <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={4} className={field}/>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Prioridade</label>
                <select value={data.priority} onChange={e => setData('priority', e.target.value)} className={field}>
                  {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Origem</label>
                <select value={data.origin} onChange={e => setData('origin', e.target.value)} className={field}>
                  {ORIGIN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
                <select value={data.ticket_type} onChange={e => setData('ticket_type', e.target.value)} className={field}>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Atribuição */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Atribuição</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Área funcional</label>
                <select value={data.service_area_id} onChange={e => setData('service_area_id', e.target.value)} className={field}>
                  <option value="">Sem área</option>
                  {serviceAreas.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Responsável</label>
                <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)} className={field}>
                  <option value="">Não atribuído</option>
                  {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Contacto associado</label>
                <select value={data.contact_id} onChange={e => setData('contact_id', e.target.value)} className={field}>
                  <option value="">Sem contacto</option>
                  {contacts.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}{c.email ? ` — ${c.email}` : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={processing}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl disabled:opacity-60 transition-colors">
              {processing ? 'A guardar…' : 'Guardar alterações'}
            </button>
            <Link href={`/pedidos/${ticket.id}`}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
