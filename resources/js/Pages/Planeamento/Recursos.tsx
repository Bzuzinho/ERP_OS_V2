import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Users, Package, UserCheck, RotateCcw, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const TEAM_TYPE_COLORS: Record<string,string> = {
  interna:'bg-blue-100 text-blue-700', externa:'bg-purple-100 text-purple-700',
  mista:'bg-indigo-100 text-indigo-700',
}
const ALLOC_STATUS_COLORS: Record<string,string> = {
  em_uso:'bg-orange-100 text-orange-700', devolvido:'bg-green-100 text-green-700', perdido:'bg-red-100 text-red-700',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-PT', { day:'2-digit', month:'short', year:'numeric' })
}

function WorkloadBar({ open, completed }: { open: number; completed: number }) {
  const total = open + completed
  if (total === 0) return <span className="text-xs text-gray-400">Sem tarefas</span>
  const pct = Math.round((completed / total) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full" style={{ width:`${pct}%` }}/>
      </div>
      <span className="text-xs text-gray-500">{open} em aberto</span>
    </div>
  )
}

export default function PlaneamentoRecursos({ teams = [], allocations = [], users = [] }: any) {
  const [tab, setTab] = useState<'equipas'|'materiais'|'funcionarios'>('equipas')

  function returnAllocation(id: number) {
    if (!confirm('Marcar material como devolvido?')) return
    router.patch(`/alocacoes/${id}/devolver`, {}, { preserveScroll: true })
  }

  return (
    <AdminLayout title="Planeamento — Recursos">
      <Head title="Planeamento: Recursos — JuntaOS"/>
      <div className="p-4 md:p-6 space-y-5">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Recursos</h1>
            <p className="text-sm text-gray-500 mt-0.5">Equipas, funcionários e materiais alocados</p>
          </div>
          <div className="flex gap-2">
            <Link href="/equipas" className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors">Gerir Equipas</Link>
            <Link href="/rh"     className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors">Gerir RH</Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Equipas ativas',     value: teams.length,       icon: Users,     bg:'bg-blue-50',   icon_c:'text-blue-600' },
            { label:'Materiais em uso',   value: allocations.length, icon: Package,   bg:'bg-orange-50', icon_c:'text-orange-600' },
            { label:'Funcionários ativos',value: users.length,        icon: UserCheck, bg:'bg-green-50',  icon_c:'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', s.bg)}>
                  <s.icon size={18} className={s.icon_c}/>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {[
            { key:'equipas',      label:`Equipas (${teams.length})` },
            { key:'materiais',    label:`Materiais Alocados (${allocations.length})` },
            { key:'funcionarios', label:`Funcionários (${users.length})` },
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
                <p className="text-sm">Sem equipas registadas.</p>
                <Link href="/equipas" className="mt-2 inline-block text-sm text-primary-600 hover:underline">Criar equipa</Link>
              </div>
            ) : teams.map((t: any) => {
              const members = t.members ?? []
              return (
                <div key={t.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <Link href={`/equipas/${t.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Users size={18} className="text-primary-600"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 group-hover:text-primary-700">{t.name}</p>
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full', TEAM_TYPE_COLORS[t.type] ?? 'bg-gray-100 text-gray-600')}>
                          {t.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {members.length} membro{members.length !== 1 ? 's' : ''}
                        {t.leader && ` · Líder: ${t.leader.name}`}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 flex-shrink-0"/>
                  </Link>
                  {members.length > 0 && (
                    <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                      {members.slice(0,8).map((m: any) => {
                        const name = m.user?.name ?? '?'
                        return (
                          <span key={m.id} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">
                            <span className="w-4 h-4 rounded-full bg-primary-200 text-primary-700 text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                              {name[0]?.toUpperCase()}
                            </span>
                            {name}
                          </span>
                        )
                      })}
                      {members.length > 8 && <span className="text-xs text-gray-400 py-1">+{members.length - 8}</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Materiais Alocados */}
        {tab === 'materiais' && (
          <div className="space-y-2">
            {allocations.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
                <Package size={36} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Sem materiais alocados no momento.</p>
              </div>
            ) : allocations.map((a: any) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3.5 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Package size={16} className="text-orange-600"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {a.item?.name ?? '—'} <span className="text-gray-400 font-normal">× {a.quantity} {a.item?.unit}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{a.allocated_to_type === 'team' ? 'Equipa' : 'Funcionário'}: <strong className="text-gray-600">{a.allocated_to_name ?? '—'}</strong></span>
                    {a.task && <Link href={`/tarefas/${a.task.id}`} className="text-primary-600 hover:underline">Tarefa: {a.task.title}</Link>}
                    {a.allocated_at && <span>Desde {formatDate(a.allocated_at)}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', ALLOC_STATUS_COLORS[a.status] ?? 'bg-gray-100 text-gray-500')}>
                    {a.status?.replace('_',' ')}
                  </span>
                  {a.status === 'em_uso' && (
                    <button onClick={() => returnAllocation(a.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
          <div className="space-y-2">
            {users.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
                <UserCheck size={36} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Sem funcionários ativos.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 px-5 py-2 font-medium uppercase tracking-wide">
                  <span>Nome</span><span>Carga de trabalho</span><span className="text-right">Tarefas</span>
                </div>
                {users.map((u: any) => (
                  <div key={u.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3.5 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {u.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <WorkloadBar open={u.open_tasks ?? 0} completed={u.completed_tasks ?? 0}/>
                      <div className={clsx(
                        'w-10 text-center py-1 rounded-lg text-sm font-bold',
                        (u.open_tasks ?? 0) > 5 ? 'bg-red-50 text-red-600' :
                        (u.open_tasks ?? 0) > 0 ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      )}>
                        {u.open_tasks ?? 0}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
