import React, { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  Users, UserPlus, UserMinus, Edit2, Save, X, Trash2,
  Phone, Mail, Building2, CheckCircle2, Clock, ChevronRight,
  Wrench, ClipboardList, Shield
} from 'lucide-react'
import clsx from 'clsx'

const typeLabel: Record<string,string> = { interna: 'Interna', externa: 'Externa' }
const typeColor: Record<string,string> = {
  interna: 'bg-blue-100 text-blue-700',
  externa: 'bg-purple-100 text-purple-700',
}

const roleLabel: Record<string,string> = { lider: 'Líder', supervisor: 'Supervisor', membro: 'Membro' }
const roleColor: Record<string,string> = {
  lider:      'bg-amber-100 text-amber-700',
  supervisor: 'bg-purple-100 text-purple-700',
  membro:     'bg-gray-100 text-gray-600',
}

const statusColors: Record<string,string> = {
  pending:     'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-gray-100 text-gray-500',
}
const statusLabels: Record<string,string> = {
  pending: 'Pendente', in_progress: 'Em progresso', completed: 'Concluída', cancelled: 'Cancelada',
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm'|'md'|'lg' }) {
  const s = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm'
  return (
    <div className={clsx('rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold flex-shrink-0', s)}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function EquipasShow({ team, users }: any) {
  const [editing, setEditing]         = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)

  const editForm = useForm({
    name:          team.name          ?? '',
    type:          team.type          ?? 'interna',
    description:   team.description   ?? '',
    leader_id:     team.leader?.id    ?? '',
    contact_name:  team.contact_name  ?? '',
    contact_phone: team.contact_phone ?? '',
    contact_email: team.contact_email ?? '',
    is_active:     team.is_active     ?? true,
  })

  const memberForm = useForm({ user_id: '', role: 'membro' })

  function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    editForm.patch(`/equipas/${team.id}`, { onSuccess: () => setEditing(false) })
  }

  function addMember(e: React.FormEvent) {
    e.preventDefault()
    memberForm.post(`/equipas/${team.id}/membros`, {
      onSuccess: () => { memberForm.reset(); setShowAddMember(false) },
    })
  }

  function removeMember(userId: number) {
    if (confirm('Remover membro da equipa?'))
      router.delete(`/equipas/${team.id}/membros`, { data: { user_id: userId } })
  }

  function destroy() {
    if (confirm(`Eliminar a equipa "${team.name}"? Esta acção não pode ser desfeita.`))
      router.delete(`/equipas/${team.id}`)
  }

  // Users not already in team
  const memberIds = new Set(team.members.map((m: any) => m.id))
  const available = users.filter((u: any) => !memberIds.has(u.id))

  return (
    <AdminLayout title={team.name}>
      <Head title={`${team.name} — JuntaOS`} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <a href="/equipas" className="hover:text-primary-600">Equipas</a>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{team.name}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Users size={28} className="text-primary-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-medium', typeColor[team.type])}>
                  {typeLabel[team.type]}
                </span>
                {!team.is_active && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    Inativa
                  </span>
                )}
              </div>
              {team.description && <p className="mt-1 text-gray-500 text-sm">{team.description}</p>}
              {team.leader && (
                <p className="mt-1 text-sm text-gray-500">
                  Líder: <span className="font-medium text-gray-700">{team.leader.name}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              <Edit2 size={14}/> Editar
            </button>
            <button onClick={destroy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
              <Trash2 size={14}/> Eliminar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{team.members.length}</div>
            <div className="text-sm text-gray-500 mt-0.5">Membros</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{team.tasks_count}</div>
            <div className="text-sm text-gray-500 mt-0.5">Tarefas</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{team.maintenances_count}</div>
            <div className="text-sm text-gray-500 mt-0.5">Manutenções</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — edit form + contact */}
          <div className="space-y-5">

            {/* Edit form */}
            {editing && (
              <div className="bg-white rounded-xl border border-primary-200 shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Edit2 size={16} className="text-primary-600"/> Editar Equipa
                </h2>
                <form onSubmit={saveEdit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
                    <input value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" required/>
                    {editForm.errors.name && <p className="text-red-500 text-xs mt-0.5">{editForm.errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                    <select value={editForm.data.type} onChange={e => editForm.setData('type', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400">
                      <option value="interna">Interna</option>
                      <option value="externa">Externa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Líder</label>
                    <select value={editForm.data.leader_id} onChange={e => editForm.setData('leader_id', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400">
                      <option value="">— sem líder —</option>
                      {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
                    <textarea value={editForm.data.description} onChange={e => editForm.setData('description', e.target.value)}
                      rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 resize-none"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Contacto</label>
                    <input placeholder="Nome" value={editForm.data.contact_name} onChange={e => editForm.setData('contact_name', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2 focus:ring-2 focus:ring-primary-400"/>
                    <input placeholder="Telefone" value={editForm.data.contact_phone} onChange={e => editForm.setData('contact_phone', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2 focus:ring-2 focus:ring-primary-400"/>
                    <input placeholder="Email" type="email" value={editForm.data.contact_email} onChange={e => editForm.setData('contact_email', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400"/>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_active" checked={editForm.data.is_active}
                      onChange={e => editForm.setData('is_active', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600"/>
                    <label htmlFor="is_active" className="text-sm text-gray-700">Equipa ativa</label>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={editForm.processing}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                      <Save size={14}/> Guardar
                    </button>
                    <button type="button" onClick={() => setEditing(false)}
                      className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                      <X size={14}/>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Contact info */}
            {(team.contact_name || team.contact_phone || team.contact_email) && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-800 mb-3 text-sm">Contacto Externo</h2>
                <div className="space-y-2">
                  {team.contact_name  && <div className="flex items-center gap-2 text-sm text-gray-700"><Building2 size={14} className="text-gray-400"/>{team.contact_name}</div>}
                  {team.contact_phone && <div className="flex items-center gap-2 text-sm text-gray-700"><Phone size={14} className="text-gray-400"/>{team.contact_phone}</div>}
                  {team.contact_email && <div className="flex items-center gap-2 text-sm text-gray-700"><Mail size={14} className="text-gray-400"/><a href={`mailto:${team.contact_email}`} className="text-primary-600 hover:underline">{team.contact_email}</a></div>}
                </div>
              </div>
            )}

            {/* Quick links */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">Ligações</h2>
              <a href={`/tarefas?team_id=${team.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 group">
                <span className="flex items-center gap-2"><ClipboardList size={15} className="text-blue-500"/>Ver tarefas</span>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500"/>
              </a>
              <a href={`/manutencoes?team_id=${team.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 group">
                <span className="flex items-center gap-2"><Wrench size={15} className="text-orange-500"/>Ver manutenções</span>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500"/>
              </a>
            </div>
          </div>

          {/* Right — members */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Users size={16} className="text-primary-600"/>
                  Membros <span className="text-gray-400 font-normal">({team.members.length})</span>
                </h2>
                {available.length > 0 && (
                  <button onClick={() => setShowAddMember(!showAddMember)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium">
                    <UserPlus size={14}/> Adicionar
                  </button>
                )}
              </div>

              {/* Add member form */}
              {showAddMember && (
                <form onSubmit={addMember} className="mb-4 p-4 bg-gray-50 rounded-lg flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Utilizador</label>
                    <select value={memberForm.data.user_id} onChange={e => memberForm.setData('user_id', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400" required>
                      <option value="">— selecionar —</option>
                      {available.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.name}{u.department ? ` — ${u.department}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-36">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Função</label>
                    <select value={memberForm.data.role} onChange={e => memberForm.setData('role', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400">
                      <option value="membro">Membro</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="lider">Líder</option>
                    </select>
                  </div>
                  <button type="submit" disabled={memberForm.processing}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                    Adicionar
                  </button>
                  <button type="button" onClick={() => setShowAddMember(false)}
                    className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                    <X size={14}/>
                  </button>
                </form>
              )}

              {team.members.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Users size={32} className="mx-auto mb-2 opacity-30"/>
                  <p className="text-sm">Sem membros. Adicione o primeiro membro.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {team.members.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 py-3">
                      <Avatar name={m.name}/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm">{m.name}</span>
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', roleColor[m.role] ?? roleColor.membro)}>
                            {roleLabel[m.role] ?? m.role}
                          </span>
                          {m.id === team.leader?.id && (
                            <span className="flex items-center gap-1 text-xs text-amber-600">
                              <Shield size={11}/> Líder designado
                            </span>
                          )}
                        </div>
                        {m.department && <p className="text-xs text-gray-400 mt-0.5">{m.department}</p>}
                      </div>
                      <button onClick={() => removeMember(m.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <UserMinus size={15}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent tasks */}
            {team.tasks && team.tasks.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <ClipboardList size={16} className="text-blue-600"/>
                    Tarefas recentes
                  </h2>
                  <a href={`/tarefas?team_id=${team.id}`} className="text-sm text-primary-600 hover:underline">
                    Ver todas →
                  </a>
                </div>
                <div className="divide-y divide-gray-100">
                  {team.tasks.slice(0, 6).map((t: any) => (
                    <a key={t.id} href={`/tarefas/${t.id}`}
                      className="flex items-center gap-3 py-2.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors group">
                      <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0', statusColors[t.status] ?? 'bg-gray-100 text-gray-500')}>
                        {statusLabels[t.status] ?? t.status}
                      </span>
                      <span className="flex-1 text-sm text-gray-700 truncate group-hover:text-primary-600">{t.title}</span>
                      {t.assignee && (
                        <span className="text-xs text-gray-400 flex-shrink-0">{t.assignee.name}</span>
                      )}
                      <ChevronRight size={14} className="text-gray-300 flex-shrink-0"/>
                    </a>
                  ))}
                </div>
                {team.tasks.length > 6 && (
                  <p className="text-xs text-gray-400 mt-2 text-right">+{team.tasks.length - 6} mais</p>
                )}
              </div>
            )}

            {/* Maintenances */}
            {team.maintenances && team.maintenances.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Wrench size={16} className="text-orange-600"/>
                    Manutenções
                  </h2>
                  <a href="/manutencoes" className="text-sm text-primary-600 hover:underline">Ver todas →</a>
                </div>
                <div className="divide-y divide-gray-100">
                  {team.maintenances.slice(0, 4).map((m: any) => (
                    <a key={m.id} href={`/manutencoes/${m.id}`}
                      className="flex items-center gap-3 py-2.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg group">
                      <Wrench size={14} className="text-orange-400 flex-shrink-0"/>
                      <span className="flex-1 text-sm text-gray-700 truncate group-hover:text-primary-600">{m.title}</span>
                      {m.space && <span className="text-xs text-gray-400 flex-shrink-0">{m.space.name}</span>}
                      <ChevronRight size={14} className="text-gray-300 flex-shrink-0"/>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
