import React, { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, Users, Building2, Phone, Mail, ChevronRight, X, UserPlus, UserMinus } from 'lucide-react'
import clsx from 'clsx'

const typeLabel: Record<string, string> = { interna: 'Interna', externa: 'Externa' }
const typeColor: Record<string, string> = { interna: 'bg-blue-100 text-blue-700', externa: 'bg-purple-100 text-purple-700' }

export default function EquipasIndex({ teams, users, contacts }: any) {
  const [showForm, setShowForm] = useState(false)
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null)
  const [addMemberTeam, setAddMemberTeam] = useState<number | null>(null)

  const { data, setData, post, processing, reset, errors } = useForm({
    name: '', type: 'interna', leader_id: '', description: '',
    contact_name: '', contact_phone: '', contact_email: '',
    member_ids: [] as number[],
  })

  const memberForm = useForm({ contact_id: '', role: 'membro' })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/equipas', { onSuccess: () => { reset(); setShowForm(false) } })
  }

  function addMember(teamId: number) {
    memberForm.post(`/equipas/${teamId}/membros`, {
      onSuccess: () => { memberForm.reset(); setAddMemberTeam(null) }
    })
  }

  function removeMember(teamId: number, contactId: number) {
    router.delete(`/equipas/${teamId}/membros`, { data: { contact_id: contactId } })
  }

  return (
    <AdminLayout title="Equipas">
      <Head title="Equipas — JuntaOS"/>
      <div className="p-4 md:p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Equipas</h1>
            <p className="text-sm text-gray-500 mt-0.5">{teams.length} equipa{teams.length !== 1 ? 's' : ''} registada{teams.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16}/> Nova Equipa
          </button>
        </div>

        {/* Criar equipa */}
        {showForm && (
          <form onSubmit={submit} className="bg-white rounded-xl border border-primary-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Nova Equipa</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={16} className="text-gray-400"/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input value={data.name} onChange={e => setData('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select value={data.type} onChange={e => setData('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="interna">Interna (funcionários)</option>
                  <option value="externa">Externa (prestador/empresa)</option>
                </select>
              </div>
              {data.type === 'interna' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Líder</label>
                  <select value={data.leader_id} onChange={e => setData('leader_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">— sem líder —</option>
                    {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}
              {data.type === 'externa' && (<>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                  <input value={data.contact_name} onChange={e => setData('contact_name', e.target.value)}
                    placeholder="Nome da empresa / representante"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input value={data.contact_phone} onChange={e => setData('contact_phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={data.contact_email} onChange={e => setData('contact_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
              </>)}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" disabled={processing}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
                {processing ? 'A criar…' : 'Criar Equipa'}
              </button>
            </div>
          </form>
        )}

        {/* Lista */}
        <div className="space-y-3">
          {teams.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
              <Users size={40} className="mx-auto mb-2 opacity-30"/>
              <p>Nenhuma equipa criada.</p>
            </div>
          ) : teams.map((team: any) => (
            <div key={team.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Row */}
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}>
                <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center',
                  team.type === 'interna' ? 'bg-blue-100' : 'bg-purple-100')}>
                  {team.type === 'interna'
                    ? <Users size={18} className="text-blue-600"/>
                    : <Building2 size={18} className="text-purple-600"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{team.name}</p>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', typeColor[team.type])}>
                      {typeLabel[team.type]}
                    </span>
                    {!team.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inativa</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    {team.leader && <span>Líder: {team.leader.name}</span>}
                    {team.contact_name && <span><Building2 size={10} className="inline"/> {team.contact_name}</span>}
                    {team.contact_phone && <span><Phone size={10} className="inline"/> {team.contact_phone}</span>}
                    <span><Users size={10} className="inline"/> {team.members_count} membro{team.members_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <a href={`/equipas/${team.id}`} onClick={e => e.stopPropagation()}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors flex-shrink-0"
                  title="Ver detalhes">
                  <ChevronRight size={16}/>
                </a>
              </div>

              {/* Expanded: membros */}
              {expandedTeam === team.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
                  {team.description && <p className="text-sm text-gray-600 italic">{team.description}</p>}

                  {team.type === 'interna' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Membros</p>
                        <button onClick={() => setAddMemberTeam(addMemberTeam === team.id ? null : team.id)}
                          className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
                          <UserPlus size={12}/> Adicionar
                        </button>
                      </div>

                      {addMemberTeam === team.id && (
                        <div className="flex gap-2 mb-3">
                          <select value={memberForm.data.contact_id}
                            onChange={e => memberForm.setData('contact_id', e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">Selecionar pessoa…</option>
                            {contacts.filter((c: any) => !team.members.find((m: any) => m.id === c.id))
                              .map((c: any) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}{c.type ? ` — ${c.type}` : ''}
                                </option>
                              ))}
                          </select>
                          <select value={memberForm.data.role}
                            onChange={e => memberForm.setData('role', e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="membro">Membro</option>
                            <option value="lider">Líder</option>
                            <option value="supervisor">Supervisor</option>
                          </select>
                          <button onClick={() => addMember(team.id)} disabled={!memberForm.data.contact_id || memberForm.processing}
                            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm rounded-lg">
                            Adicionar
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {team.members.length === 0 ? (
                          <p className="text-sm text-gray-400">Sem membros.</p>
                        ) : team.members.map((m: any) => (
                          <div key={m.id} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1">
                            <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-xs text-primary-700 font-medium">
                              {m.name[0]}
                            </div>
                            <span className="text-sm text-gray-700">{m.name}</span>
                            <span className="text-xs text-gray-400">· {m.role}</span>
                            <button onClick={() => removeMember(team.id, m.id)} className="ml-1 text-gray-300 hover:text-red-400">
                              <X size={12}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {team.type === 'externa' && team.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} className="text-gray-400"/>
                      <a href={`mailto:${team.contact_email}`} className="text-primary-600 hover:underline">{team.contact_email}</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
