import React, { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft, Mail, Phone, Smartphone, MapPin, FileText, Edit3, UserCheck, Trash2 } from 'lucide-react'
import clsx from 'clsx'

const statusColors: Record<string, string> = {
  aberto: 'bg-blue-100 text-blue-700',
  resolvido: 'bg-green-100 text-green-700',
  encerrado: 'bg-gray-100 text-gray-700',
}

export default function MunicipesShow({ contact }: any) {
  const [editing, setEditing] = useState(false)

  function confirmDelete() {
    if (confirm(`Eliminar "${contact.name}"? Esta ação não pode ser desfeita.`)) {
      router.delete(`/municipes/${contact.id}`)
    }
  }

  const color = contact.person_type?.color ?? '#6b7280'

  return (
    <AdminLayout title={contact.name}>
      <Head title={`${contact.name} — JuntaOS`}/>
      <div className="p-4 md:p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/municipes" className="p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={18} className="text-gray-600"/>
          </Link>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
              style={{ backgroundColor: color }}>
              {contact.initials ?? contact.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 truncate">{contact.name}</h1>
                {contact.user_id && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <UserCheck size={11}/> Utilizador
                  </span>
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
            <Link href={`/municipes/${contact.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit3 size={14}/> Editar
            </Link>
            <button onClick={confirmDelete}
              className="p-2 text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={15}/>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Dados pessoais */}
          <div className="lg:col-span-2 space-y-5">
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

              {/* Dados extra */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                {contact.nif && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">NIF</p>
                    <p className="text-gray-700 font-mono">{contact.nif}</p>
                  </div>
                )}
                {contact.birthdate && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Data de nascimento</p>
                    <p className="text-gray-700">{new Date(contact.birthdate).toLocaleDateString('pt-PT')}</p>
                  </div>
                )}
              </div>

              {contact.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Notas</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{contact.notes}</p>
                </div>
              )}
            </div>

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
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[t.status] ?? 'bg-gray-100 text-gray-600')}>
                        {t.status?.replace('_',' ')}
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
                  <span className="font-semibold text-gray-900">{contact.tickets_count ?? contact.tickets?.length ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado</span>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                    contact.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    {contact.is_active ? 'Ativo' : 'Inativo'}
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
    </AdminLayout>
  )
}
