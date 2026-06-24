import React, { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  Shield, Plus, Trash2, Check, X,
  Users, Zap, Link2, Clock, Globe, Building2, User, Lock,
  ChevronDown,
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
// RoleCard — card expandível com nível + grelha de módulos
// ─────────────────────────────────────────────────────────────────────────────
function RoleCard({
  role, perms, modules, expanded, onToggle,
}: {
  role: any
  perms: Record<string, { can_view: boolean; can_edit: boolean; can_delete: boolean }>
  modules: Record<string, string>
  expanded: boolean
  onToggle: () => void
}) {
  const [name,  setName]  = useState<string>(role.name)
  const [color, setColor] = useState<string>(role.color ?? '#6b7280')
  const [level, setLevel] = useState<number>(role.level)
  const [localPerms, setLocalPerms] = useState(() =>
    Object.fromEntries(
      Object.keys(modules).map(k => [
        k, perms[k] ?? { can_view: true, can_edit: false, can_delete: false },
      ])
    )
  )
  const [saving, setSaving] = useState(false)

  const isAdmin = role.slug === 'admin'

  function toggle(module: string, field: 'can_view' | 'can_edit' | 'can_delete') {
    setLocalPerms(prev => ({
      ...prev,
      [module]: {
        ...(prev[module] ?? { can_view: true, can_edit: false, can_delete: false }),
        [field]: !(prev[module]?.[field]),
      },
    }))
  }

  function save() {
    setSaving(true)
    const payload: any = { name, level, color }
    if (!isAdmin) payload.module_permissions = localPerms
    router.patch(`/configuracoes/perfis/${role.id}`, payload, {
      preserveScroll: true,
      // Fechar card ao guardar — reabre com dados frescos do servidor
      onSuccess: () => onToggle(),
      onFinish: () => setSaving(false),
    })
  }

  return (
    <div className={clsx(
      'bg-white rounded-xl border shadow-sm overflow-hidden transition-all',
      expanded ? 'border-primary-300' : 'border-gray-200',
    )}>
      {/* Cabeçalho — sempre visível */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors text-left"
        onClick={onToggle}
      >
        <span
          className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/10 shadow-sm"
          style={{ backgroundColor: color }}
        />
        <span className="font-medium text-gray-800 text-sm flex-1 text-left">{role.name}</span>
        <div className="flex items-center gap-2">
          {role.is_system && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">sistema</span>
          )}
          {isAdmin && (
            <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-semibold">acesso total</span>
          )}
          <span className={clsx('px-2 py-0.5 rounded border text-xs font-bold tabular-nums', levelColor(role.level))}>
            {role.level}
          </span>
          {!role.is_system && (
            <button
              onClick={e => {
                e.stopPropagation()
                if (confirm(`Eliminar perfil "${role.name}"?`)) router.delete(`/configuracoes/perfis/${role.id}`)
              }}
              className="p-1 text-gray-300 hover:text-red-500 rounded hover:bg-red-50 ml-1"
            >
              <Trash2 size={12}/>
            </button>
          )}
          <ChevronDown size={14} className={clsx('text-gray-400 transition-transform duration-200 ml-1', expanded && 'rotate-180')}/>
        </div>
      </button>

      {/* Conteúdo expandido */}
      {expanded && (
        <div className="border-t border-gray-100 p-5 space-y-5">
          {isAdmin ? (
            <p className="text-sm text-gray-500 flex items-center gap-2 py-1">
              <Shield size={14} className="text-red-400 flex-shrink-0"/>
              O perfil Administrador tem acesso total e irrestrito. Nível fixo: 100.
              Não é possível restringir as suas permissões.
            </p>
          ) : (
            <>
              {/* Identificação */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Identificação</p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nome do Perfil</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      disabled={role.is_system}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cor</label>
                    <input
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-full h-[38px] px-1 py-1 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Slider de nível */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nível Hierárquico:&nbsp;
                    <span className={clsx('font-bold', levelColor(level).split(' ').filter(c => c.startsWith('text-')).join(' '))}>{level}</span>
                    <span className="text-gray-400 font-normal ml-2">
                      (acções com nível mínimo ≤ {level} ficam disponíveis para este perfil)
                    </span>
                  </label>
                  <input
                    type="range" min="1" max="99" value={level}
                    onChange={e => setLevel(parseInt(e.target.value))}
                    disabled={role.is_system}
                    className="w-full accent-primary-600 disabled:opacity-50"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>1 — Básico</span>
                    <span>50 — Intermédio</span>
                    <span>99 — Quase Admin</span>
                  </div>
                </div>
              </div>

              {/* Grelha de acesso por módulo */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Acesso por Módulo
                  <span className="ml-2 font-normal normal-case text-gray-400">controla o que o perfil vê e edita na interface</span>
                </p>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 w-auto">Módulo</th>
                        <th className="text-center px-3 py-2 text-xs font-medium text-blue-600 w-16">Ver</th>
                        <th className="text-center px-3 py-2 text-xs font-medium text-indigo-600 w-16">Editar</th>
                        <th className="text-center px-3 py-2 text-xs font-medium text-red-500 w-16">Apagar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(modules).map(([key, label]) => (
                        <tr key={key} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 text-xs font-medium text-gray-700">{label as string}</td>
                          {(['can_view', 'can_edit', 'can_delete'] as const).map(field => {
                            const active = !!localPerms[key]?.[field]
                            return (
                              <td key={field} className="text-center px-3 py-2.5">
                                <button
                                  onClick={() => toggle(key, field)}
                                  className={clsx(
                                    'w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors',
                                    active
                                      ? field === 'can_delete'
                                        ? 'bg-red-500 border-red-500 text-white'
                                        : field === 'can_edit'
                                          ? 'bg-indigo-600 border-indigo-600 text-white'
                                          : 'bg-blue-500 border-blue-500 text-white'
                                      : 'border-gray-300 bg-white hover:border-gray-400'
                                  )}
                                >
                                  {active && <Check size={10} strokeWidth={3}/>}
                                </button>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Acções */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button onClick={onToggle} className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1">
              Fechar
            </button>
            {!isAdmin && (
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
              >
                {saving
                  ? <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                  : <Check size={14}/>}
                Guardar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Secção: Perfis (merged)
// ─────────────────────────────────────────────────────────────────────────────
function RolesSection({
  roles, rolePermissions, modules,
}: {
  roles: any[]
  rolePermissions: Record<string, Record<string, { can_view: boolean; can_edit: boolean; can_delete: boolean }>>
  modules: Record<string, string>
}) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const form = useForm({ name: '', level: 50, color: '#6b7280' })

  function submitCreate(e: React.FormEvent) {
    e.preventDefault()
    router.post('/configuracoes/perfis/criar', form.data, {
      onSuccess: () => { setCreating(false); form.reset() },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-800">Perfis de Acesso</h3>
          <p className="text-xs text-gray-400 mt-0.5 max-w-lg">
            O <strong className="text-gray-500">nível hierárquico</strong> (1–99) determina quais acções cada perfil
            pode aprovar ou executar. O <strong className="text-gray-500">acesso por módulo</strong> controla
            o que o perfil consegue ver, editar e apagar na interface.
          </p>
        </div>
        <button
          onClick={() => { setCreating(c => !c); form.setData({ name: '', level: 50, color: '#6b7280' }) }}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={14}/> Novo perfil
        </button>
      </div>

      {/* Form de criação */}
      {creating && (
        <form onSubmit={submitCreate}
          className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Novo Perfil</h4>
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
              <input value={form.data.name} onChange={e => form.setData('name', e.target.value)} required
                placeholder="ex: Supervisor"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cor</label>
              <input type="color" value={form.data.color} onChange={e => form.setData('color', e.target.value)}
                className="w-full h-[38px] px-1 py-1 border border-gray-300 rounded-lg cursor-pointer"/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nível: <span className="font-bold text-primary-600">{form.data.level}</span>
              <span className="text-gray-400 font-normal ml-1">(1–99)</span>
            </label>
            <input type="range" min="1" max="99" value={form.data.level}
              onChange={e => form.setData('level', parseInt(e.target.value))}
              className="w-full accent-primary-600"/>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCreating(false)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
            <button type="submit"
              className="px-4 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Criar perfil
            </button>
          </div>
        </form>
      )}

      {/* Lista de perfis */}
      <div className="space-y-2">
        {roles.map(role => (
          <RoleCard
            key={role.id}
            role={role}
            perms={rolePermissions[role.slug] ?? {}}
            modules={modules}
            expanded={expanded === role.id}
            onToggle={() => setExpanded(expanded === role.id ? null : role.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Secção: Acções e Níveis Mínimos
// ─────────────────────────────────────────────────────────────────────────────
function ActionsSection({ actions, roles }: { actions: any[]; roles: any[] }) {
  const [editing, setEditing] = useState<number | null>(null)
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
        <p className="text-xs text-gray-400 mt-0.5">
          Define o nível hierárquico mínimo necessário para executar cada acção específica.
          Perfis com nível igual ou superior ao valor definido têm acesso automático.
        </p>
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
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {(roles.find(r => r.level <= action.min_level && roles.every((r2: any) => r2.level > action.min_level || r2.level === r.level))?.name
                        ?? roles.filter((r: any) => r.level >= action.min_level).map((r: any) => r.name).join(', ')) || '-'}
                    </span>
                    <button onClick={() => { setEditing(action.id); setLevelVal(action.min_level) }}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded hover:bg-gray-100">
                      <span className="sr-only">Editar</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-800">Delegações Ad-hoc</h3>
          <p className="text-xs text-gray-400 mt-0.5 max-w-lg">
            Concede permissões pontuais a utilizadores sem alterar o seu perfil,
            com âmbito e validade opcional. Só podes delegar acções cujo nível seja inferior ao teu.
          </p>
        </div>
        <button onClick={() => setCreating(c => !c)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus size={14}/> Nova delegação
        </button>
      </div>

      {creating && (
        <form onSubmit={submit} className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl space-y-3">
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
                <p className="text-[11px] text-gray-400 mt-0.5">Nível mínimo: {selectedAction.min_level}</p>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">ID da Pessoa</label>
                <input type="number" value={form.data.scope_id} onChange={e => form.setData('scope_id', e.target.value)}
                  placeholder="ID da pessoa"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Válido até <span className="text-gray-400">(em branco = permanente)</span>
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
                    {grant.granted_by && <span>por: {grant.granted_by.name}</span>}
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
            Sem delegações activas.
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
  rolePermissions, modules,
}: any) {
  const [tab, setTab] = useState<'roles' | 'actions' | 'grants'>('roles')
  const myLevel = 100

  const tabs = [
    { key: 'roles',   label: 'Perfis',    icon: Users  },
    { key: 'actions', label: 'Acções',    icon: Zap    },
    { key: 'grants',  label: 'Delegações', icon: Link2  },
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
            Perfis com níveis hierárquicos · Acesso por módulo · Acções com nível mínimo · Delegações ad-hoc
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
          {tab === 'roles' && (
            <RolesSection
              roles={permRoles}
              rolePermissions={rolePermissions ?? {}}
              modules={modules ?? {}}
            />
          )}
          {tab === 'actions' && <ActionsSection actions={permActions} roles={permRoles}/>}
          {tab === 'grants' && (
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
