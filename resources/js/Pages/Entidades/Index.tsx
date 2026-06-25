import React, { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  Building2, Plus, Search, ChevronRight, Globe, X,
  MapPin, Phone, Mail,
} from 'lucide-react'
import clsx from 'clsx'

export default function EntidadesIndex({ contacts, entityTypes, filters }: any) {
  const [search,     setSearch]     = useState(filters?.search  ?? '')
  const [typeId,     setTypeId]     = useState(filters?.type_id ?? '')
  const [showCreate, setShowCreate] = useState(false)

  function applyFilters(overrides: any = {}) {
    router.get('/entidades', { search, type_id: typeId, ...overrides }, { preserveState: true, replace: true })
  }

  const form = useForm({
    name: '', person_type_id: '', email: '', phone: '', mobile: '',
    nif: '', website: '', address: '', postal_code: '', locality: '', notes: '',
  })

  function submitCreate(e: React.FormEvent) {
    e.preventDefault()
    form.post('/entidades', { onSuccess: () => { setShowCreate(false); form.reset() } })
  }

  return (
    <AdminLayout title="Entidades">
      <Head title="Entidades — JuntaOS"/>
      <div className="p-4 md:p-6 space-y-5">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Entidades</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Fornecedores, instituições, parceiros, associações e empresas
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            <Plus size={16}/> Nova Entidade
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="Nome, email, NIF, localidade..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={typeId}
            onChange={e => { setTypeId(e.target.value); applyFilters({ type_id: e.target.value }) }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">Todos os tipos</option>
            {entityTypes.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">{contacts.total} entidade{contacts.total !== 1 ? 's' : ''}</span>
          </div>

          {contacts.data.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Building2 size={40} className="mx-auto mb-3 opacity-25"/>
              <p>Sem entidades registadas.</p>
              <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-primary-600 hover:underline">
                Criar a primeira
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {contacts.data.map((c: any) => (
                <Link key={c.id} href={`/entidades/${c.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: c.avatar_url ? 'transparent' : (c.person_type?.color ?? '#6b7280') }}>
                    {c.avatar_url
                      ? <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover"/>
                      : (c.name?.[0]?.toUpperCase() ?? '?')
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {[c.email, c.phone, c.locality].filter(Boolean).join(' · ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {c.person_type && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline"
                        style={{ backgroundColor: c.person_type.color + '22', color: c.person_type.color }}>
                        {c.person_type.name}
                      </span>
                    )}
                    {(c.tickets_count > 0 || c.reservations_count > 0) && (
                      <span className="text-xs text-gray-400">
                        {[
                          c.tickets_count > 0 && `${c.tickets_count} pedido${c.tickets_count !== 1 ? 's' : ''}`,
                          c.reservations_count > 0 && `${c.reservations_count} reserva${c.reservations_count !== 1 ? 's' : ''}`,
                        ].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    <ChevronRight size={15} className="text-gray-300"/>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Paginação */}
          {contacts.last_page > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex justify-center gap-2">
              {contacts.links?.filter((l: any) => l.url).map((l: any, i: number) => (
                <Link key={i} href={l.url}
                  className={clsx('px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    l.active ? 'bg-primary-600 text-white border-primary-600' : 'text-gray-600 border-gray-300 hover:bg-gray-50')}
                  dangerouslySetInnerHTML={{ __html: l.label }}/>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Painel criar entidade */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCreate(false)}/>
          <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Nova Entidade</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={18}/>
              </button>
            </div>
            <form onSubmit={submitCreate} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome *</label>
                <input value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nome da entidade" required/>
                {form.errors.name && <p className="text-red-500 text-xs mt-1">{form.errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                <select value={form.data.person_type_id} onChange={e => form.setData('person_type_id', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="">Selecionar tipo...</option>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">NIF</label>
                  <input value={form.data.nif} onChange={e => form.setData('nif', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="000000000"/>
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0000-000"/>
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
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"/>
              </div>
            </form>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={submitCreate} disabled={form.processing}
                className="flex-1 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {form.processing ? 'A criar...' : 'Criar Entidade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
