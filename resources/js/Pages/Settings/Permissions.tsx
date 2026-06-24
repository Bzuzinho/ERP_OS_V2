import React, { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  Shield, Plus, Trash2, Edit2, X, Check, ChevronDown, ChevronUp,
  Users, Zap, Link2, Clock, Globe, Building2, User, Lock,
} from 'lucide-react'
import clsx from 'clsx'

const SCOPE_LABELS: Record<string, string> = {
  global:     'Global',
  department: 'Departamento',
  contact:    'Pessoa',
  self:       'Próprios itens',
}
const SCOPE_ICONS: Record<string, React.ElementType> = {
  global:     Globe,
  department: Building2,
  contact:    User,
  self:       Lock,
}

function levelColor(level: number): string {
  if (level >= 100) return 'bg-red-100 text-red-700 border-red-200'
  if (level >= 80)  return 'bg-purple-100 text-purple-700 border-purple-200'
  if (level >= 60)  return 'bg-blue-100 text-blue-700 border-blue-200'
  if (level >= 40)  return 'bg-green-100 text-green-700 border-green-200'
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

// ─────────────────────────────────────────────────────────────────────────────
// Secção: Perfis
// ─────────────────────────────────────────────────────────────────────────────
function RolesSection({ roles }: { roles: any[] }) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing]   = useState<any>(null)

  const form = useForm({ name: '', level: 50, color: '#6b7280' })

  function submitCreate(e: React.FormEvent) {
    e.preventDefault()
    router.post('/configuracoes/perfis/criar', form.data, {
      onSuccess: () => { setCreating(false); form.reset() },
    })
  }

  function submitEdit(e: React.FormEvent) {
    e.preventDefault()
    router.patch(`/configuracoes/perfis/${editing.id}`, form.data, {
      onSuccess: () => setEditing(null),
    })
  }

  function openEdit(role: any) {
    form.setData({ name: role.name, level: role.level, color: role.color ?? '#6b7280' })
    setEditing(role)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Perfis de Acesso</h3>
          <p className="text-xs text-gray-400 mt-0.5">Cada perfil tem um nível (0–100). Nível mais alto = mais permissões por omissão.</p>
        </div>
        <button onClick={() => { setCreating(true); form.reset({ name: '', level: 50, color: '#6b7280' }) }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus size={14}/> Novo perfil
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {roles.map(role => (
          <div key={role.id}
            className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800 text-sm">{role.name}</span>
                {role.is_system && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">sistema</span>
                )}
              </div>
              <p className="text-xs text-gray-400">slug: {role.slug}</p>
            </div>
            <div className={clsx('px-2.5 py-1 rounded-lg border text-sm font-bold tabular-nums', levelColor(role.level))}>
              {role.level}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => openEdit(role)}
                className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100">
                <Edit2 size={14}/>
              </button>
              {!role.is_system && (
                <button onClick={() => { if (confirm(`Eliminar perfil "${role.name}"?`)) router.delete(`/configuracoes/perfis/${role.id}`) }}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                  <Trash2 size={14}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form criar/editar */}
      {(creating || editing) && (
        <form onSubmit={editing ? submitEdit : submitCreate}
          className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">
            {editing ? `Editar: ${editing.name}` : 'Novo Perfil'}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
              <input value={form.data.name} onChange={e => form.setData('name', e.target.value)} required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cor</label>
              <input type="color" value={form.data.color} onChange={e => form.setData('color', e.target.value)}
                className="w-full h-9 px-1 py-1 border border-gray-300 rounded-lg cursor-pointer"/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nível: <span className="font-bold text-primary-600">{form.data.level}</span>
              <span className="text-gray-400 ml-2">(1–{editing?.is_system && editing.slug === 'admin' ? 100 : 99})</span>
            </label>
            <input type="range" min="1" max={editing?.is_system && editing.slug === 'admin' ? 100 : 99}
              value={form.data.level} onChange={e => form.setData('level', parseInt(e.target.value))}
              className="w-full accent-primary-600"/>
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>1 — Acesso básico</span><span>99 — Quase Admin</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setCreating(false); setEditing(null) }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
            <button type="submit"
              className="px-4 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {editing ? 'Guardar' : 'Criar perfil'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Secção: Acções e Níveis Mínimos
// ─────────────────────────────────────────────────────────────────────────────
function ActionsSection({ actions, roles }: { actions: any[]; roles: any[] }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [levelVal, setLevelVal] = useState(0)

  const byModule = actions.reduce((acc: any, a: any) => {
    if (!acc[a.module]) acc[a.module] = []
    acc[a.module].push(a)
    return acc
  }, {} as Record<string, any[]>)

  function saveAction(action: any) {
    router.patch(`/configuracoes/acoes/${action.id}`, { min_level: levelVal }, {
      onSuccess: () => setEditing(null),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-800">Acções e Níveis Mínimos</h3>
        <p className="text-xs text-gray-400 mt-0.5">Define o nível mínimo de perfil necessário para executar cada acção.</p>
      </div>

      {Object.entries(byModule).map(([module, moduleActions]: [string, any[]]) => (
        <div key={module} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{module}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {moduleActions.map(action => (
              <div key={action.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{action.label}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{action.key}</p>
                </div>
                {editing === action.id ? (
                  <div className="flex items-center gap-2">
                    <div className="w-48">
                      <input type="range" min="0" max="100" value={levelVal}
                        onChange={e => setLevelVal(parseInt(e.target.value))}
                        className="w-full accent-primary-600"/>
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>0</span>
                        <span className="font-bold text-primary-600">{levelVal}</span>
                        <span>100</span>
                      </div>
                    </div>
                    <button onClick={() => saveAction(action)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                      <Check size={14}/>
                    </button>
                    <button onClick={() => setEditing(null)}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
                      <X size={14}/>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={clsx('px-2.5 py-1 rounded-lg border text-sm font-bold', levelColor(action.min_level))}>
                      {action.min_level}
                    </span>
                    <span className="text-xs text-gray-400">
                      {roles.find(r => r.level <= action.min_level && roles.every(r2 => r2.level > action.min_level || r2.level === r.level))?.name
                        ?? roles.filter(r => r.level >= action.min_level).map(r => r.name).join(', ') || '—'}
                    </span>
                    <button onClick={() => { setEditing(action.id); setLevelVal(action.min_level) }}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-100">
                      <Edit2 size={13}/>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Secção: Delegações Ad-hoc
// ─────────────────────────────────────────────────────────────────────────────
function GrantsSection({ grants, actions, allUsers, departments, myLevel }: {
  grants: any[]; actions: any[]; allUsers: any[]; departments: any[]; myLevel: number
}) {
  const [creating, setCreating] = useState(false)
  const form = useForm({
    user_id: '', action_key: '', scope_type: 'global',
    scope_id: '', expires_at: '', notes: '',
  })

  // Só pode delegar acções abaixo do seu nível
  const delegatable = actions.filter(a => a.min_level < myLevel)

  const selectedAction = actions.find(a => a.key === form.data.action_key)
  const needsScope = ['department', 'contact'].includes(form.data.scope_type)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    router.post('/configuracoes/delegacoes', {
      ...form.data,
      scope_id: needsScope ? form.data.scope_id : undefined,
    }, { onSuccess: () => { setCreating(false); form.reset() } })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Delegações Ad-hoc</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Concede permissões pontuais a utilizadores, com âmbito e validade opcional.
            Só podes delegar acções cujo nível seja inferior ao teu.
          </p>
        </div>
        <button onClick={() => setCreating(c => !c)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus size={14}/> Nova delegação
        </button>
      </div>

      {/* Form criar */}
      {creating && (
        <form onSubmit={submit} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Nova Delegação</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Utilizador</label>
              <select value={form.data.user_id} onChange={e => form.setData('user_id', e.target.value)} required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="">— Selecionar —</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Acção a delegar</label>
              <select value={form.data.action_key} onChange={e => form.setData('action_key', e.target.value)} required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="">— Selecionar —</option>
                {delegatable.map(a => (
                  <option key={a.key} value={a.key}>[{a.module}] {a.label}</option>
                ))}
              </select>
              {selectedAction && (
                <p className="text-[11px] text-gray-400 mt-0.5">Nível mínimo da acção: {selectedAction.min_level}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Âmbito</label>
              <select value={form.data.scope_type} onChange={e => form.setData('scope_type', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="global">Global (sem restrição)</option>
                <option value="department">Departamento específico</option>
                <option value="contact">Pessoa específica</option>
                <option value="self">Próprios itens</option>
              </select>
            </div>
            {form.data.scope_type === 'department' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Departamento</label>
                <select value={form.data.scope_id} onChange={e => form.setData('scope_id', e.target.value)} required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="">— Selecionar —</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}
            {form.data.scope_type === 'contact' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pessoa (ID)</label>
                <input type="number" value={form.data.scope_id} onChange={e => form.setData('scope_id', e.target.value)}
                  placeholder="ID da pessoa"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Válido até <span className="text-gray-400">(deixar em branco = permanente)</span>
              </label>
              <input type="date" value={form.data.expires_at} onChange={e => form.setData('expires_at', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
              <input value={form.data.notes} onChange={e => form.setData('notes', e.target.value)}
                placeholder="Motivo, contexto..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCreating(false)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
            <button type="submit"
              className="px-4 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Criar delegação
            </button>
          </div>
        </form>
      )}

      {/* Lista de delegações activas */}
      {grants.length > 0 ? (
        <div className="space-y-2">
          {grants.map(grant => {
            const action = actions.find(a => a.key === grant.action_key)
            const ScopeIcon = SCOPE_ICONS[grant.scope_type] ?? Globe
            const expired = grant.expires_at && new Date(grant.expires_at) < new Date()
            return (
              <div key={grant.id}
                className={clsx('flex items-start gap-3 px-4 py-3 bg-white rounded-xl border shadow-sm',
                  expired ? 'border-red-200 opacity-60' : 'border-gray-200')}>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-800">{grant.user?.name}</span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-xs font-medium text-primary-600">
                      {action?.label ?? grant.action_key}
                    </span>
                    <span className={clsx('flex items-center gap-1 text-xs px-1.5 py-0.5 rounded',
                      grant.scope_type === 'global' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600')}>
                      <ScopeIcon size={10}/> {SCOPE_LABELS[grant.scope_type]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {grant.expires_at ? (
                      <span className={clsx('flex items-center gap-1', expired ? 'text-red-500' : '')}>
                        <Clock size={11}/> {expired ? 'Expirou' : 'Expira'}: {new Date(grant.expires_at).toLocaleDateString('pt-PT')}
                      </span>
                    ) : (
                      <span>Permanente</span>
                    )}
                    {grant.granted_by && <span>Concedido por: {grant.granted_by.name}</span>}
                    {grant.notes && <span className="italic">{grant.notes}</span>}
                  </div>
                </div>
                <button onClick={() => { if (confirm('Remover esta delegação?')) router.delete(`/configuracoes/delegacoes/${grant.id}`) }}
                  className="p-1.5 text-gray-300 hover:text-red-500 rounded hover:bg-red-50 flex-shrink-0">
                  <Trash2 size={14}/>
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        !creating && (
          <div className="text-center py-8 text-sm text-gray-400">
            Sem delegações activas. Clica em "Nova delegação" para criar.
          </div>
        )
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────────────────────
export default function PermissionsPage({
  permRoles, permActions, permGrants, allUsers, departments,
}: any) {
  const [tab, setTab] = useState<'roles' | 'actions' | 'grants'>('roles')

  // Nível do utilizador atual (passado via usePage em contexto real; aqui simplificado)
  const myLevel = 100 // Admin vê tudo; ajustar se necessário via prop

  const tabs = [
    { key: 'roles',   label: 'Perfis',      icon: Users },
    { key: 'actions', label: 'Acções',       icon: Zap },
    { key: 'grants',  label: 'Delegações',   icon: Link2 },
  ] as const

  return (
    <AdminLayout title="Permissões">
      <Head title="Permissões — JuntaOS"/>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={20} className="text-primary-600"/> Gestão de Permissões
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Perfis com níveis hierárquicos · Nível mínimo por acção · Delegações pontuais ad-hoc
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-1">
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                  tab === t.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}>
                <Icon size={14}/> {t.label}
                {t.key === 'grants' && permGrants.length > 0 && (
                  <span className="ml-1 text-xs bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full">
                    {permGrants.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Conteúdo */}
        <div>
          {tab === 'roles'   && <RolesSection roles={permRoles}/>}
          {tab === 'actions' && <ActionsSection actions={permActions} roles={permRoles}/>}
          {tab === 'grants'  && (
            <GrantsSection
              grants={permGrants}
              actions={permActions}
              allUsers={allUsers}
              departments={departments}
              myLevel={myLevel}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
