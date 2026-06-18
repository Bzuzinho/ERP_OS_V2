import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Users, Package, UserCheck, RotateCcw, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const typeColors: Record<string, string> = {
  interna: 'bg-blue-100 text-blue-700',
  externa: 'bg-purple-100 text-purple-700',
}

const statusColors: Record<string, string> = {
  em_uso:    'bg-orange-100 text-orange-700',
  devolvido: 'bg-green-100 text-green-700',
  perdido:   'bg-red-100 text-red-700',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PlaneamentoRecursos({ teams, allocations, users }: any) {
  const [tab, setTab] = useState<'equipas'|'materiais'|'funcionarios'>('equipas')

  function returnAllocation(id: number) {
    router.patch(`/alocacoes/${id}/devolver`, {})
  }

  return (
    <AdminLayout title="Planeamento — Recursos">
      <Head title="Planeamento: Recursos — JuntaOS"/>
      <div className="p-6 max-w-5xl mx-auto space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Recursos</h1>
            <p className="text-sm text-gray-500 mt-0.5">Equipas, funcionários e materiais alocados</p>
          </div>
          <div className="flex gap-2">
            <Link href="/equipas" className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              Gerir Equipas
            </Link>
            <Link href="/rh" className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              Gerir RH
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users size={20} className="text-blue-600"/>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
                <p className="text-sm text-gray-500">Equipas ativas</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Package size={20} className="text-orange-600"/>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{allocations.length}</p>
                <p className="text-sm text-gray-500">Materiais em uso</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <UserCheck size={20} className="text-green-600"/>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-500">Funcionários ativos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {[
            { key: 'equipas',       label: `Equipas (${teams.length})` },
            { key: 'materiais',     label: `Materiais Alocados (${allocations.length})` },
            { key: 'funcionarios',  label: `Funcionários (${users.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={clsx('px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Equipas */}
        {tab === 'equipas' && (
          <div className="space-y-3">
            {teams.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
                <Users size={36} className="mx-auto mb-2 opacity-30"/>
                <p>Sem equipas registadas.</p>
                <Link href="/equipas" className="mt-3 inline-block text-sm text-primary-600 hover:underline">Criar equipa</Link>
              </div>
            ) : teams.map((t: any) => (
              <Link key={t.id} href={`/equipas/${t.id}`}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 hover:border-primary-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-primary-600"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', typeColors[t.type] ?? 'bg-gray-100 text-gray-600')}>
                      {t.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{t.members_count} membro{t.members_count !== 1 ? 's' : ''}</span>
                    {t.leader && <span>Líder: {t.leader.name}</span>}
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 flex-shrink-0"/>
              </Link>
            ))}
          </div>
        )}

        {/* Materiais Alocados */}
        {tab === 'materiais' && (
          <div className="space-y-3">
            {allocations.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
                <Package size={36} className="mx-auto mb-2 opacity-30"/>
                <p>Sem materiais alocados no momento.</p>
              </div>
            ) : allocations.map((a: any) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-orange-600"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    {a.item?.name ?? '—'} <span className="text-gray-400 font-normal text-sm">× {a.quantity} {a.item?.unit}</span>
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
                    <span>
                      {a.allocated_to_type === 'team' ? 'Equipa' : a.allocated_to_type === 'user' ? 'Funcionário' : 'Departamento'}:&nbsp;
                      <strong className="text-gray-600">{a.allocated_to_name ?? '—'}</strong>
                    </span>
                    {a.task && (
                      <span>Tarefa: <Link href={`/tarefas/${a.task.id}`} className="text-primary-600 hover:underline">{a.task.title}</Link></span>
                    )}
                    {a.allocated_at && <span>Desde {formatDate(a.allocated_at)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[a.status] ?? 'bg-gray-100 text-gray-500')}>
                    {a.status?.replace('_', ' ')}
                  </span>
                  {a.status === 'em_uso' && (
                    <button onClick={() => returnAllocation(a.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <RotateCcw size={11}/> Devolver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Funcionários */}
        {tab === 'funcionarios' && (
          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
                <UserCheck size={36} className="mx-auto mb-2 opacity-30"/>
                <p>Sem funcionários ativos.</p>
              </div>
            ) : users.map((u: any) => (
              <div key={u.id} className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {u.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className={clsx(
                    'text-center px-3 py-1.5 rounded-lg text-sm font-semibold',
                    u.open_tasks > 5 ? 'bg-red-50 text-red-600' : u.open_tasks > 0 ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                  )}>
                    {u.open_tasks} tarefa{u.open_tasks !== 1 ? 's' : ''}
                  </div>
                  <Link href={`/rh`} className="text-gray-300 hover:text-primary-500 transition-colors">
                    <ChevronRight size={16}/>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
