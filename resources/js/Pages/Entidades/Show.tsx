import React, { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  ArrowLeft, Mail, Phone, Smartphone, MapPin, Globe,
  FileText, Edit3, Trash2, Calendar, X, ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

const TICKET_STATUS_COLORS: Record<string, string> = {
  aberto: 'bg-blue-100 text-blue-700',
  em_progresso: 'bg-yellow-100 text-yellow-700',
  resolvido: 'bg-green-100 text-green-700',
  encerrado: 'bg-gray-100 text-gray-700',
}

const RESERVA_STATUS_COLORS: Record<string, string> = {
  pendente:  'bg-yellow-100 text-yellow-700',
  aprovada:  'bg-green-100 text-green-700',
  rejeitada: 'bg-red-100 text-red-700',
}

export default function EntidadesShow({ contact, entityTypes }: any) {
  const [editing, setEditing] = useState(false)
  const color = contact.person_type?.color ?? '#6b7280'

  const form = useForm({
    name:           contact.name           ?? '',
    person_type_id: contact.person_type_id ?? '',
    email:          contact.email          ?? '',
    phone:          contact.phone          ?? '',
    mobile:         contact.mobile         ?? '',
    nif:            contact.nif            ?? '',
    website:        contact.website        ?? '',
    address:        contact.address        ?? '',
    postal_code:    contact.postal_code    ?? '',
    locality:       contact.locality       ?? '',
    notes:          contact.notes          ?? '',
    is_active:      contact.is_active      ?? true,
  })

  function submitEdit(e: React.FormEvent) {
    e.preventDefault()
    form.patch(`/entidades/${contact.id}`, { onSuccess: () => setEditing(false) })
  }

  function confirmDelete() {
    if (confirm(`Eliminar "${contact.name}"? Esta ação não pode ser desfeita.`)) {
      router.delete(`/entidades/${contact.id}`)
    }
  }

  return (
    <AdminLayout title={contact.name}>
      <Head title={`${contact.name} — JuntaOS`}/>
      <div className="p-4 md:p-6 space-y-5">

        {/* Cabeçalho */}
        <div className="flex items-start gap-3">
          <Link href="/entidades" className="p-1.5 rounded-lg hover:bg-gray-100 mt-1">
            <ArrowLeft size={18} className="text-gray-600"/>
          </Link>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
              style={{ backgroundColor: color }}>
              {contact.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{contact.name}</h1>
                {!contact.is_active && (
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Inativa</span>
                )}
              </div>
              {contact.person_type && (
                <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5"
                  style={{ backgroundColor: color + '22', color }}>
                  {contact.person_type.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit3 size={14}/> Editar
            </button>
            <button onClick={confirmDelete}
              className="p-2 text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={15}/>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* Contacto */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Dados de Contacto</h2>
              <div className="space-y-3">
                {contact.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={15} className="text-gray-400 flex-shrink-0"/>
                    <a href={`mailto:${contact.email}`} className="text-primary-600 hover:underline">{contact.email}</a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={15} className="text-gray-400 flex-shrink-0"/>
                    <a href={`tel:${contact.phone}`} className="text-gray-700">{contact.phone}</a>
                  </div>
                )}
                {contact.mobile && (
                  <div className="flex items-center gap-3 text-sm">
                    <Smartphone size={15} className="text-gray-400 flex-shrink-0"/>
                    <a href={`tel:${contact.mobile}`} className="text-gray-700">{contact.mobile}</a>
                  </div>
                )}
                {contact.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe size={15} className="text-gray-400 flex-shrink-0"/>
                    <a href={contact.website} target="_blank" rel="noopener noreferrer"
                      className="text-primary-600 hover:underline truncate">{contact.website}</a>
                  </div>
                )}
                {(contact.address || contact.locality) && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={15} className="text-gray-400 flex-shrink-0 mt-0.5"/>
                    <div className="text-gray-700">
                      {contact.address && <div>{contact.address}</div>}
                      {(contact.postal_code || contact.locality) && (
                        <div>{[contact.postal_code, contact.locality].filter(Boolean).join(' ')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {contact.nif && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">NIF / NIPC</p>
                  <p className="text-sm text-gray-700 font-mono">{contact.nif}</p>
                </div>
              )}

              {contact.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Notas</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{contact.notes}</p>
                </div>
              )}
            </div>

            {/* Reservas */}
            {contact.reservations?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">
                    Reservas de Espaços ({contact.reservations.length})
                  </h2>
                  <Link href="/reservas" className="text-sm text-primary-600 hover:underline">Ver todas</Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {contact.reservations.map((r: any) => (
                    <Link key={r.id} href={`/reservas/${r.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <Calendar size={14} className="text-gray-400"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{r.space?.name ?? 'Espaço'}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(r.starts_at).toLocaleDateString('pt-PT')}
                          {r.ends_at && ` — ${new Date(r.ends_at).toLocaleDateString('pt-PT')}`}
                        </p>
                      </div>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                        RESERVA_STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600')}>
                        {r.status}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Pedidos */}
            {contact.tickets?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">Pedidos ({contact.tickets.length})</h2>
                  <Link href={`/pedidos?contact_id=${contact.id}`} className="text-sm text-primary-600 hover:underline">Ver todos</Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {contact.tickets.map((t: any) => (
                    <Link key={t.id} href={`/pedidos/${t.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <FileText size={14} className="text-gray-400"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{t.title}</p>
                        <p className="text-xs text-gray-400">{t.reference}</p>
                      </div>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                        TICKET_STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-600')}>
                        {t.status?.replace('_', ' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Resumo</h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pedidos</span>
                  <span className="font-semibold text-gray-900">{contact.tickets?.length ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reservas</span>
                  <span className="font-semibold text-gray-900">{contact.reservations?.length ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Estado</span>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                    contact.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    {contact.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
            </div>

            <Link href={`/pedidos/novo?contact_id=${contact.id}`}
              className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors">
              + Novo Pedido
            </Link>
          </div>
        </div>
      </div>

      {/* Painel de edição */}
      {editing && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditing(false)}/>
          <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Editar Entidade</h2>
              <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={18}/>
              </button>
            </div>
            <form onSubmit={submitEdit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome *</label>
                <input value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                <select value={form.data.person_type_id} onChange={e => form.setData('person_type_id', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="">— Sem tipo —</option>
                  {entityTypes.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Telefone</label>
                  <input value={form.data.phone} onChange={e => form.setData('phone', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">NIF / NIPC</label>
                  <input value={form.data.nif} onChange={e => form.setData('nif', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                  <input type="url" value={form.data.website} onChange={e => form.setData('website', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://..."/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Morada</label>
                <input value={form.data.address} onChange={e => form.setData('address', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Código postal</label>
                  <input value={form.data.postal_code} onChange={e => form.setData('postal_code', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Localidade</label>
                  <input value={form.data.locality} onChange={e => form.setData('locality', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                <textarea value={form.data.notes} onChange={e => form.setData('notes', e.target.value)}
                  rows={3} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"/>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={form.data.is_active}
                  onChange={e => form.setData('is_active', e.target.checked)}
                  className="rounded border-gray-300"/>
                <label htmlFor="is_active" className="text-sm text-gray-700">Ativa</label>
              </div>
            </form>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={() => setEditing(false)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={submitEdit} disabled={form.processing}
                className="flex-1 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {form.processing ? 'A guardar...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
