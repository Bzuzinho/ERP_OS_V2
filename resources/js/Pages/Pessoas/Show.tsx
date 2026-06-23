import React, { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  ArrowLeft, Mail, Phone, Smartphone, MapPin, FileText, Edit3,
  UserCheck, Trash2, Briefcase, Building2, Calendar, Shield,
  AlertTriangle, X, Check, ChevronRight, Plus, LogIn, UserPlus, Unlink,
  KeyRound, Eye, EyeOff,
} from 'lucide-react'
import clsx from 'clsx'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador', executivo: 'Executivo',
  administrativo: 'Administrativo', operacional: 'Operacional',
}
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700', executivo: 'bg-purple-100 text-purple-700',
  administrativo: 'bg-blue-100 text-blue-700', operacional: 'bg-green-100 text-green-700',
}

const TICKET_STATUS_COLORS: Record<string, string> = {
  aberto: 'bg-blue-100 text-blue-700',
  em_progresso: 'bg-yellow-100 text-yellow-700',
  resolvido: 'bg-green-100 text-green-700',
  encerrado: 'bg-gray-100 text-gray-700',
}

const EMPLOYEE_STATUSES = [
  { value: 'ativo',   label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'férias',  label: 'Férias' },
  { value: 'ausente', label: 'Ausente' },
]

const CONTRACT_TYPES = ['Efetivo', 'Termo certo', 'Termo incerto', 'Prestação de serviços', 'Outro']

export default function PessoasShow({ contact, personTypes, departments }: any) {
  const [editing, setEditing] = useState(false)
  const color = contact.person_type?.color ?? '#6b7280'

  // ── Conta de acesso ─────────────────────────────────────────────────────────
  const [accountMode, setAccountMode] = useState<'idle' | 'create' | 'edit'>('idle')
  const [accEmail,    setAccEmail]    = useState(contact.email ?? '')
  const [accPassword, setAccPassword] = useState('')
  const [accRole,     setAccRole]     = useState(contact.user?.role ?? 'operacional')
  const [accActive,   setAccActive]   = useState(contact.user?.is_active ?? true)
  const [showPwd,     setShowPwd]     = useState(false)
  const [accountBusy, setAccountBusy] = useState(false)

  function submitCreate() {
    setAccountBusy(true)
    router.post(`/pessoas/${contact.id}/criar-conta`, { email: accEmail, password: accPassword, role: accRole }, {
      onFinish: () => { setAccountBusy(false); setAccountMode('idle'); setAccPassword('') }
    })
  }

  function submitEdit() {
    setAccountBusy(true)
    router.patch(`/pessoas/${contact.id}/acesso`, { role: accRole, is_active: accActive, password: accPassword || undefined }, {
      onFinish: () => { setAccountBusy(false); setAccountMode('idle'); setAccPassword('') }
    })
  }

  function removeAccount() {
    if (!confirm('Eliminar conta de acesso? A pessoa ficará sem acesso ao sistema.')) return
    router.delete(`/pessoas/${contact.id}/remover-conta`)
  }

  const form = useForm({
    name:              contact.name ?? '',
    person_type_id:    contact.person_type_id ?? '',
    email:             contact.email ?? '',
    phone:             contact.phone ?? '',
    mobile:            contact.mobile ?? '',
    nif:               contact.nif ?? '',
    address:           contact.address ?? '',
    postal_code:       contact.postal_code ?? '',
    locality:          contact.locality ?? '',
    birthdate:         contact.birthdate ?? '',
    notes:             contact.notes ?? '',
    is_active:         contact.is_active ?? true,
    // Funcionário
    employee_number:   contact.employee_number ?? '',
    position:          contact.position ?? '',
    department_id:     contact.department_id ?? '',
    hire_date:         contact.hire_date ?? '',
    termination_date:  contact.termination_date ?? '',
    employee_status:   contact.employee_status ?? '',
    contract_type:     contact.contract_type ?? '',
    emergency_contact: contact.emergency_contact ?? '',
    emergency_phone:   contact.emergency_phone ?? '',
  })

  function submitEdit(e: React.FormEvent) {
    e.preventDefault()
    form.patch(`/pessoas/${contact.id}`, { onSuccess: () => setEditing(false) })
  }

  function confirmDelete() {
    if (confirm(`Eliminar "${contact.name}"? Esta ação não pode ser desfeita.`)) {
      router.delete(`/pessoas/${contact.id}`)
    }
  }

  const isEmployee = contact.hire_date || contact.position || contact.employee_number

  return (
    <AdminLayout title={contact.name}>
      <Head title={`${contact.name} — JuntaOS`}/>
      <div className="p-4 md:p-6 space-y-5">

        {/* Cabeçalho */}
        <div className="flex items-start gap-3">
          <Link href="/pessoas" className="p-1.5 rounded-lg hover:bg-gray-100 mt-1">
            <ArrowLeft size={18} className="text-gray-600"/>
          </Link>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
              style={{ backgroundColor: color }}>
              {contact.initials ?? contact.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{contact.name}</h1>
                {contact.user_id && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <UserCheck size={11}/> Utilizador
                  </span>
                )}
                {!contact.is_active && (
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Inativo</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {contact.person_type && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: color + '22', color }}>
                    {contact.person_type.name}
                  </span>
                )}
                {contact.position && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Briefcase size={11}/> {contact.position}
                  </span>
                )}
                {contact.department && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Building2 size={11}/> {contact.department.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit3 size={14}/> Editar
            </button>
            <button onClick={confirmDelete}
              className="p-2 text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={15}/>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* Contacto */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Dados de Contacto</h2>
              <div className="space-y-3">
                {contact.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={15} className="text-gray-400 flex-shrink-0"/>
                    <a href={`mailto:${contact.email}`} className="text-primary-600 hover:underline">{contact.email}</a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={15} className="text-gray-400 flex-shrink-0"/>
                    <a href={`tel:${contact.phone}`} className="text-gray-700">{contact.phone}</a>
                  </div>
                )}
                {contact.mobile && (
                  <div className="flex items-center gap-3 text-sm">
                    <Smartphone size={15} className="text-gray-400 flex-shrink-0"/>
                    <a href={`tel:${contact.mobile}`} className="text-gray-700">{contact.mobile}</a>
                  </div>
                )}
                {(contact.address || contact.locality) && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={15} className="text-gray-400 flex-shrink-0 mt-0.5"/>
                    <div className="text-gray-700">
                      {contact.address && <div>{contact.address}</div>}
                      {(contact.postal_code || contact.locality) && (
                        <div>{[contact.postal_code, contact.locality].filter(Boolean).join(' ')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                {contact.nif && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">NIF</p>
                    <p className="text-gray-700 font-mono">{contact.nif}</p>
                  </div>
                )}
                {contact.birthdate && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Data de nascimento</p>
                    <p className="text-gray-700">{new Date(contact.birthdate).toLocaleDateString('pt-PT')}</p>
                  </div>
                )}
              </div>
              {contact.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Notas</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{contact.notes}</p>
                </div>
              )}
            </div>

            {/* Dados de funcionário */}
            {isEmployee && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <Briefcase size={14}/> Dados de Funcionário
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {contact.employee_number && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Nº funcionário</p>
                      <p className="text-gray-700 font-mono">{contact.employee_number}</p>
                    </div>
                  )}
                  {contact.position && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Cargo</p>
                      <p className="text-gray-700">{contact.position}</p>
                    </div>
                  )}
                  {contact.department && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Departamento</p>
                      <p className="text-gray-700">{contact.department.name}</p>
                    </div>
                  )}
                  {contact.contract_type && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Tipo de contrato</p>
                      <p className="text-gray-700">{contact.contract_type}</p>
                    </div>
                  )}
                  {contact.hire_date && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Data de admissão</p>
                      <p className="text-gray-700">{new Date(contact.hire_date).toLocaleDateString('pt-PT')}</p>
                    </div>
                  )}
                  {contact.termination_date && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Data de saída</p>
                      <p className="text-gray-700">{new Date(contact.termination_date).toLocaleDateString('pt-PT')}</p>
                    </div>
                  )}
                </div>
                {(contact.emergency_contact || contact.emergency_phone) && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <Shield size={11}/> Contacto de emergência
                    </p>
                    <p className="text-sm text-gray-700">
                      {[contact.emergency_contact, contact.emergency_phone].filter(Boolean).join(' — ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pedidos */}
            {contact.tickets?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">Pedidos ({contact.tickets.length})</h2>
                  <Link href={`/pedidos?contact_id=${contact.id}`} className="text-sm text-primary-600 hover:underline">Ver todos</Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {contact.tickets.map((t: any) => (
                    <Link key={t.id} href={`/pedidos/${t.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <FileText size={14} className="text-gray-400"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{t.title}</p>
                        <p className="text-xs text-gray-400">{t.reference}</p>
                      </div>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                        TICKET_STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-600')}>
                        {t.status?.replace('_', ' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Resumo</h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pedidos</span>
                  <span className="font-semibold text-gray-900">{contact.tickets?.length ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Estado</span>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                    contact.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    {contact.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {contact.employee_status && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Est. serviço</span>
                    <span className="text-xs text-gray-600 capitalize">{contact.employee_status}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card: Conta de acesso */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <KeyRound size={13}/> Conta de acesso
              </h2>

              {contact.user ? (
                /* ── Tem conta ───────────────────────────────────── */
                accountMode === 'edit' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Perfil</label>
                      <select value={accRole} onChange={e => setAccRole(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                        <option value="operacional">Operacional</option>
                        <option value="administrativo">Administrativo</option>
                        <option value="executivo">Executivo</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="acc-active" checked={accActive} onChange={e => setAccActive(e.target.checked)} className="rounded"/>
                      <label htmlFor="acc-active" className="text-xs text-gray-700">Conta ativa</label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nova password <span className="text-gray-400">(deixar vazio para não alterar)</span></label>
                      <div className="relative">
                        <input type={showPwd ? 'text' : 'password'} value={accPassword} onChange={e => setAccPassword(e.target.value)}
                          className="w-full px-3 py-2 pr-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Nova password…"/>
                        <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setAccountMode('idle')} className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
                      <button onClick={submitEdit} disabled={accountBusy}
                        className="flex-1 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                        {accountBusy ? 'A guardar…' : 'Guardar'}
                      </button>
                    </div>
                    <button onClick={removeAccount} className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                      <Trash2 size={12}/> Eliminar conta de acesso
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-green-50 border border-green-100">
                      <div className="w-8 h-8 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {contact.user.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{contact.user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{contact.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={clsx('px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[contact.user.role] ?? 'bg-gray-100 text-gray-600')}>
                        {ROLE_LABELS[contact.user.role] ?? contact.user.role}
                      </span>
                      <span className={clsx('flex items-center gap-1', contact.user.is_active ? 'text-green-600' : 'text-gray-400')}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full', contact.user.is_active ? 'bg-green-500' : 'bg-gray-300')}/>
                        {contact.user.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <button onClick={() => { setAccRole(contact.user.role); setAccActive(contact.user.is_active); setAccountMode('edit') }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                      <Edit3 size={12}/> Gerir acesso
                    </button>
                  </div>
                )
              ) : accountMode === 'create' ? (
                /* ── Criar conta ─────────────────────────────────── */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email de acesso</label>
                    <input type="email" value={accEmail} onChange={e => setAccEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} value={accPassword} onChange={e => setAccPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                      <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Perfil</label>
                    <select value={accRole} onChange={e => setAccRole(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                      <option value="operacional">Operacional</option>
                      <option value="administrativo">Administrativo</option>
                      <option value="executivo">Executivo</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setAccountMode('idle')} className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
                    <button onClick={submitCreate} disabled={!accEmail || !accPassword || accountBusy}
                      className="flex-1 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                      {accountBusy ? 'A criar…' : 'Criar conta'}
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Sem conta ───────────────────────────────────── */
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Esta pessoa não tem conta de acesso ao sistema.</p>
                  <button onClick={() => { setAccEmail(contact.email ?? ''); setAccountMode('create') }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                    <UserPlus size={14} className="text-primary-600"/> Criar conta de acesso
                  </button>
                </div>
              )}
            </div>

            {/* ── Funcionário ─────────────────────────────────── */}
            {contact.employee ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase size={13}/> Funcionário
                  </h3>
                  <Link href={`/rh/${contact.employee.id}`} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
                    Ver ficha <ChevronRight size={12}/>
                  </Link>
                </div>
                <div className="space-y-1.5 text-xs">
                  {contact.employee.position && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cargo</span>
                      <span className="font-medium text-gray-800">{contact.employee.position}</span>
                    </div>
                  )}
                  {contact.employee.department && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Departamento</span>
                      <span className="font-medium text-gray-800">{contact.employee.department.name}</span>
                    </div>
                  )}
                  {contact.employee.hire_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Data entrada</span>
                      <span className="font-medium text-gray-800">{new Date(contact.employee.hire_date).toLocaleDateString('pt-PT')}</span>
                    </div>
                  )}
                  {contact.employee.status && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estado</span>
                      <span className={clsx('px-1.5 py-0.5 rounded text-xs font-medium capitalize',
                        contact.employee.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                        {contact.employee.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Briefcase size={13}/> Funcionário
                </h3>
                <p className="text-xs text-gray-400 mb-2">Sem ficha de funcionário.</p>
                <Link href={`/rh/novo?contact_id=${contact.id}`}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Plus size={12}/> Criar ficha de funcionário
                </Link>
              </div>
            )}

            <Link href={`/pedidos/novo?contact_id=${contact.id}`}
              className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors">
              + Novo Pedido
            </Link>
          </div>
        </div>
      </div>

      {/* Painel de edição */}
      {editing && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditing(false)}/>
          <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Editar Pessoa</h2>
              <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={18}/>
              </button>
            </div>
            <form onSubmit={submitEdit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block te