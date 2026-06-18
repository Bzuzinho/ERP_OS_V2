import React, { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Users, Plus, Edit2, Trash2, X, Shield } from 'lucide-react'
import clsx from 'clsx'

const roleColors: Record<string, string> = {
  admin:         'bg-red-100 text-red-700',
  executivo:     'bg-purple-100 text-purple-700',
  administrativo:'bg-blue-100 text-blue-700',
  operacional:   'bg-green-100 text-green-700',
}
const roleLabels: Record<string, string> = {
  admin:'Administrador', executivo:'Executivo',
  administrativo:'Administrativo', operacional:'Operacional',
}

function UserForm({ onClose, initial }: { onClose: () => void; initial?: any }) {
  const isEdit = !!initial
  const { data, setData, post, patch, processing, errors } = useForm({
    name: initial?.name ?? '', email: initial?.email ?? '',
    password: '', role: initial?.role ?? 'operacional',
    is_active: initial?.is_active ?? true,
  })
  function submit(e: React.FormEvent) {
    e.preventDefault()
    const go = isEdit ? () => patch(`/configuracoes/usuarios/${initial.id}`) : () => post('/configuracoes/usuarios')
    go()
  }
  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-primary-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{isEdit ? `Editar — ${initial.name}` : 'Novo Utilizador'}</h3>
        <button type="button" onClick={onClose}><X size={16} className="text-gray-400"/></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input value={data.name} onChange={e => setData('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required/>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required/>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isEdit ? 'Nova Password (opcional)' : 'Password *'}</label>
          <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required={!isEdit}/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Perfil *</label>
          <select value={data.role} onChange={e => setData('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="admin">Administrador</option>
            <option value="executivo">Executivo</option>
            <option value="administrativo">Administrativo</option>
            <option value="operacional">Operacional</option>
          </select>
        </div>
        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
              className="rounded border-gray-300 text-primary-600"/>
            Conta ativa
          </label>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
        <button type="submit" disabled={processing}
          className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
          {processing ? 'A guardar…' : (isEdit ? 'Guardar' : 'Criar')}
        </button>
      </div>
    </form>
  )
}

export default function SettingsIndex({ users }: any) {
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  function destroy(user: any) {
    if (confirm(`Eliminar "${user.name}"?`)) router.delete(`/configuracoes/usuarios/${user.id}`)
  }

  return (
    <AdminLayout title="Configurações">
      <Head title="Configurações — JuntaOS"/>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-gray-600"/>
              <h2 className="font-semibold text-gray-800">Utilizadores ({users?.length ?? 0})</h2>
            </div>
            <button onClick={() => { setShowCreate(true); setEditId(null) }}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">
              <Plus size={15}/> Novo Utilizador
            </button>
          </div>

          {showCreate && <UserForm onClose={() => setShowCreate(false)}/>}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Utilizador</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Perfil</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Estado</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 hidden lg:table-cell">Criado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users?.map((u: any) => (
                  <React.Fragment key={u.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                            {u.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', roleColors[u.role] ?? 'bg-gray-100 text-gray-600')}>
                          {roleLabels[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={clsx('flex items-center gap-1 text-xs font-medium', u.is_active ? 'text-green-600' : 'text-gray-400')}>
                          <span className={clsx('w-1.5 h-1.5 rounded-full', u.is_active ? 'bg-green-500' : 'bg-gray-300')}/>
                          {u.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                        {new Date(u.created_at).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditId(editId === u.id ? null : u.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                            <Edit2 size={14}/>
                          </button>
                          <button onClick={() => destroy(u)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editId === u.id && (
                      <tr><td colSpan={5} className="px-4 py-3 bg-gray-50">
                        <UserForm initial={u} onClose={() => setEditId(null)}/>
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-gray-600"/>
            <h2 className="font-semibold text-gray-800">Perfis de Acesso</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { role: 'admin',          desc: 'Acesso total. Gere utilizadores, configurações e todos os módulos.' },
              { role: 'executivo',      desc: 'Aprova documentos e reservas. Acesso a todos os módulos.' },
              { role: 'administrativo', desc: 'Gere pedidos, documentos, agenda e recursos humanos.' },
              { role: 'operacional',    desc: 'Gere tarefas e pedidos atribuídos. Acesso ao inventário.' },
            ].map(({ role, desc }) => (
              <div key={role} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold self-start whitespace-nowrap', roleColors[role])}>
                  {roleLabels[role]}
                </span>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
