import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Users, Plus, Search, ChevronRight, UserCheck } from 'lucide-react'
import clsx from 'clsx'

export default function MunicipesIndex({ contacts, personTypes, filters }: any) {
  const [search, setSearch] = useState(filters?.search ?? '')
  const [typeId, setTypeId] = useState(filters?.type_id ?? '')

  function applyFilters(overrides: any = {}) {
    router.get('/municipes', { search, type_id: typeId, ...overrides }, { preserveState: true, replace: true })
  }

  return (
    <AdminLayout title="Pessoas">
      <Head title="Pessoas — JuntaOS"/>
      <div className="p-6 max-w-6xl mx-auto space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pessoas</h1>
            <p className="text-sm text-gray-500 mt-0.5">Munícipes, associações, empresas e outros contactos</p>
          </div>
          <Link href="/municipes/novo"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            <Plus size={16}/> Nova Pessoa
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder="Pesquisar nome, email, NIF..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={typeId}
            onChange={e => { setTypeId(e.target.value); applyFilters({ type_id: e.target.value }) }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">Todos os tipos</option>
            {personTypes.map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">{contacts.total} pessoa{contacts.total !== 1 ? 's' : ''}</span>
          </div>
          {contacts.data.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-25"/>
              <p>Sem pessoas registadas.</p>
              <Link href="/municipes/novo" className="mt-3 inline-block text-sm text-primary-600 hover:underline">Criar a primeira</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {contacts.data.map((c: any) => (
                <Link key={c.id} href={`/municipes/${c.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: c.person_type?.color ?? '#6b7280' }}>
                    {c.initials ?? c.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                      {c.user_id && <UserCheck size={13} className="text-green-500 flex-shrink-0" title="Tem conta de utilizador"/>}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {[c.email, c.phone, c.locality].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {c.person_type && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{ backgroundColor: c.person_type.color + '22', color: c.person_type.color }}>
                      {c.person_type.name}
                    </span>
                  )}
                  {c.tickets_count > 0 && (
                    <span className="text-xs text-gray-400 flex-shrink-0">{c.tickets_count} pedido{c.tickets_count !== 1 ? 's' : ''}</span>
                  )}
                  <ChevronRight size={15} className="text-gray-300 flex-shrink-0"/>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
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
    </AdminLayout>
  )
}
