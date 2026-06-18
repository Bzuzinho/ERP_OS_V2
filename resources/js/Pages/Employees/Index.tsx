import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { UserCheck, Plus, Search, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const statusColors: Record<string, string> = {
  ativo:   'bg-green-100 text-green-700',
  inativo: 'bg-gray-100 text-gray-600',
  ferias:  'bg-blue-100 text-blue-700',
  ausente: 'bg-orange-100 text-orange-700',
}
const statusLabels: Record<string, string> = {
  ativo: 'Ativo', inativo: 'Inativo', ferias: 'Férias', ausente: 'Ausente',
}

export default function EmployeesIndex({ employees, departments, filters }: any) {
  const [search, setSearch]   = useState(filters?.search ?? '')
  const [dept, setDept]       = useState(filters?.department ?? '')
  const [status, setStatus]   = useState(filters?.status ?? '')

  function apply(overrides: any = {}) {
    router.get('/rh', { search, department: dept, status, ...overrides }, { preserveState: true, replace: true })
  }

  return (
    <AdminLayout title="Funcionários">
      <Head title="Funcionários — JuntaOS"/>
      <div className="p-6 max-w-6xl mx-auto space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Funcionários</h1>
            <p className="text-sm text-gray-500 mt-0.5">Equipa interna da junta</p>
          </div>
          <Link href="/rh/novo"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            <Plus size={16}/> Novo Funcionário
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && apply()}
              placeholder="Pesquisar nome, cargo..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
          </div>
          <select value={dept} onChange={e => { setDept(e.target.value); apply({ department: e.target.value }) }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Todos os departamentos</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); apply({ status: e.target.value }) }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Todos os estados</option>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">{employees.total} funcionário{employees.total !== 1 ? 's' : ''}</span>
          </div>
          {employees.data.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <UserCheck size={40} className="mx-auto mb-3 opacity-25"/>
              <p>Sem funcionários registados.</p>
              <Link href="/rh/novo" className="mt-3 inline-block text-sm text-primary-600 hover:underline">Adicionar primeiro</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {employees.data.map((e: any) => (
                <Link key={e.id} href={`/rh/${e.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {e.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{e.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {[e.position, e.department?.name].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {e.user && (
                    <UserCheck size={14} className="text-green-500 flex-shrink-0" title="Tem conta de utilizador"/>
                  )}
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', statusColors[e.status] ?? 'bg-gray-100 text-gray-600')}>
                    {statusLabels[e.status] ?? e.status}
                  </span>
                  <ChevronRight size={15} className="text-gray-300 flex-shrink-0"/>
                </Link>
              ))}
            </div>
          )}
          {employees.last_page > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex justify-center gap-2">
              {employees.links?.filter((l: any) => l.url).map((l: any, i: number) => (
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
