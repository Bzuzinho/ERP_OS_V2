import React, { useState, useRef } from 'react'
import { Head, Link, router, useForm, usePage } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  ArrowLeft, Mail, Phone, Smartphone, MapPin, FileText, Edit3, Edit2,
  UserCheck, Trash2, Briefcase, Building2, Calendar, Shield,
  AlertTriangle, X, Check, Plus, LogIn, UserPlus, Unlink,
  KeyRound, Eye, EyeOff, Camera,
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

const ABSENCE_TYPES = [
  { value: 'férias',               label: 'Férias' },
  { value: 'falta_justificada',    label: 'Falta Justificada' },
  { value: 'falta_injustificada',  label: 'Falta Injustificada' },
  { value: 'doença',               label: 'Doença / Baixa' },
  { value: 'licença_parental',     label: 'Licença Parental' },
  { value: 'licença_paternidade',  label: 'Licença Paternidade' },
  { value: 'outro',                label: 'Outro' },
]

const ABSENCE_STATUS_COLORS: Record<string, string> = {
  pendente:  'bg-yellow-100 text-yellow-700',
  aprovado:  'bg-green-100 text-green-700',
  rejeitado: 'bg-red-100 text-red-700',
}

const ABSENCE_TYPE_COLORS: Record<string, string> = {
  'disponível':          'bg-green-100 text-green-700',
  'férias':              'bg-sky-100 text-sky-700',
  'falta_justificada':   'bg-orange-100 text-orange-700',
  'falta_injustificada': 'bg-red-100 text-red-700',
  'doença':              'bg-purple-100 text-purple-700',
  'licença_parental':    'bg-pink-100 text-pink-700',
  'licença_paternidade': 'bg-indigo-100 text-indigo-700',
  'outro':               'bg-gray-100 text-gray-600',
}

export default function PessoasShow({ contact, personTypes, departments }: any) {
  const [editing, setEditing] = useState(false)
  const color = contact.person_type?.color ?? '#6b7280'

  // ── Foto de perfil ──────────────────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState<string | null>(contact.avatar_url ?? null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    const formData = new FormData()
    formData.append('avatar', file)
    router.post(`/pessoas/${contact.id}/avatar`, formData, { preserveScroll: true })
  }

  // ── Conta de acesso ─────────────────────────────────────────────────────────
  const [accountMode, setAccountMode] = useState<'idle' | 'create' | 'edit'>('idle')
  const [accEmail,    setAccEmail]    = useState(contact.email ?? '')
  const [showPwd,     setShowPwd]     = useState(false)

  const [accBusy, setAccBusy] = useState(false)
  const accEditForm = useForm({
    role:      contact.user?.role      ?? 'operacional',
    is_active: contact.user?.is_active ?? true,
    password:  '',
  })

  const accCreateForm = useForm({
    role:     'operacional',
    password: '',
  })

  function submitCreate() {
    accCreateForm.post(`/pessoas/${contact.id}/criar-conta`, {
      onSuccess: () => { setAccountMode('idle'); accCreateForm.reset() },
    })
  }

  function submitAccountEdit() {
    const payload: Record<string, any> = {
      role:      accEditForm.data.role,
      is_active: accEditForm.data.is_active,
    }
    if (accEditForm.data.password) payload.password = accEditForm.data.password
    setAccBusy(true)
    router.patch(`/pessoas/${contact.id}/acesso`, payload, {
      preserveScroll: true,
      onSuccess: () => { setAccountMode('idle'); accEditForm.setData('password', ''); accEditForm.clearErrors() },
      onError:   (errors) => accEditForm.setError(errors as any),
      onFinish:  () => setAccBusy(false),
    })
  }

  function removeAccount() {
    if (!confirm('Eliminar conta de acesso? A pessoa ficará sem acesso ao sistema.')) return
    router.delete(`/pessoas/${contact.id}/remover-conta`)
  }

  // ── Registos RH ─────────────────────────────────────────────────────────────
  const [absenceForm, setAbsenceForm] = useState(false)
  const [editingAbsence, setEditingAbsence] = useState<any>(null)
  const [absData, setAbsData] = useState({
    type: 'férias', start_date: '', end_date: '', days: '', status: 'pendente', notes: ''
  })

  function openNewAbsence() {
    setAbsData({ type: 'férias', start_date: '', end_date: '', days: '', status: 'pendente', notes: '' })
    setEditingAbsence(null)
    setAbsenceForm(true)
  }

  function openEditAbsence(abs: any) {
    setAbsData({
      type:       abs.type,
      start_date: abs.start_date?.split('T')[0] ?? '',
      end_date:   abs.end_date?.split('T')[0] ?? '',
      days:       abs.days ?? '',
      status:     abs.status,
      notes:      abs.notes ?? '',
    })
    setEditingAbsence(abs)
    setAbsenceForm(true)
  }

  function submitAbsence() {
    const payload = { ...absData, days: absData.days || undefined }
    if (editingAbsence) {
      router.patch(`/pessoas/${contact.id}/ausencias/${editingAbsence.id}`, payload, {
        onSuccess: () => setAbsenceForm(false),
      })
    } else {
      router.post(`/pessoas/${contact.id}/ausencias`, payload, {
        onSuccess: () => setAbsenceForm(false),
      })
    }
  }

  function deleteAbsence(abs: any) {
    if (!confirm('Eliminar este registo?')) return
    router.delete(`/pessoas/${contact.id}/ausencias/${abs.id}`)
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
      router.delete(`/pessoas/${contact.id}`, {
        onError: (errors) => alert(errors.error ?? 'Não foi possível eliminar esta pessoa.'),
      })
    }
  }

  const isEmployee = !!(contact.hire_date || contact.position || contact.employee_number)
  const [showEmployeeFields, setShowEmployeeFields] = useState(isEmployee)
  const { errors } = usePage().props as any

  return (
    <AdminLayout title={contact.name}>
      <Head title={`${contact.name} — JuntaOS`}/>
      <div className="p-4 md:p-6 space-y-5">

        {/* Erro de operação (ex: tentativa de apagar com conta activa) */}
        {errors?.error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5"/>
            <p>{errors.error}</p>
          </div>
        )}

        {/* Cabeçalho */}
        <div className="flex items-start gap-3">
          <Link href="/pessoas" className="p-1.5 rounded-lg hover:bg-gray-100 mt-1">
            <ArrowLeft size={18} className="text-gray-600"/>
          </Link>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="relative group w-12 h-12 rounded-full flex-shrink-0 cursor-pointer"
              onClick={() => avatarInputRef.current?.click()}
              title="Clica para alterar a foto"
            >
              {avatarPreview
                ? <img src={avatarPreview} alt={contact.name} className="w-12 h-12 rounded-full object-cover"/>
                : <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: color }}>
                    {contact.initials ?? contact.name?.[0]?.toUpperCase()}
                  </div>
              }
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={14} className="text-white"/>
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{contact.name}</h1>
                {/* Estado da pessoa — toggle rápido */}
                <button
                  onClick={() => router.patch(`/pessoas/${contact.id}`, { is_active: !contact.is_active }, { preserveScroll: true })}
                  className={clsx('flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium transition-colors',
                    contact.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  )}
                  title="Clica para alternar estado">
                  <span className={clsx('w-1.5 h-1.5 rounded-full', contact.is_active ? 'bg-green-500' : 'bg-red-400')}/>
                  {contact.is_active ? 'Ativo' : 'Inativo'}
                </button>
                {contact.user && (
                  <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    <UserCheck size={11}/> Utilizador
                  </span>
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
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <Briefcase size={14}/> Dados de Funcionário
                  </h2>
                  <button onClick={() => setEditing(true)}
                    className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                    <Edit2 size={11}/> Editar
                  </button>
                </div>
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
                      <p className="text-gray-700 capitalize">{contact.contract_type.replace(/_/g, ' ')}</p>
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
                  {contact.employee_status && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Disponibilidade</p>
                      <span className={clsx('inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize',
                        ABSENCE_TYPE_COLORS[contact.employee_status] ?? 'bg-green-100 text-green-700')}>
                        {contact.employee_status === 'disponível' ? 'Disponível'
                          : ABSENCE_TYPES.find(t => t.value === contact.employee_status)?.label
                          ?? contact.employee_status}
                      </span>
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

            {/* ── Registos RH ──────────────────────────────────────── */}
            {isEmployee && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar size={15} className="text-gray-400"/> Registos RH
                    {contact.absences?.length > 0 && (
                      <span className="text-xs font-normal text-gray-400">({contact.absences.length})</span>
                    )}
                  </h2>
                  <button onClick={openNewAbsence}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                    <Plus size={12}/> Novo registo
                  </button>
                </div>

                {/* Formulário inline */}
                {absenceForm && (
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                        <select value={absData.type} onChange={e => setAbsData(p => ({...p, type: e.target.value}))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                          {ABSENCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                        <select value={absData.status} onChange={e => setAbsData(p => ({...p, status: e.target.value}))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                          <option value="pendente">Pendente</option>
                          <option value="aprovado">Aprovado</option>
                          <option value="rejeitado">Rejeitado</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Data início</label>
                        <input type="date" value={absData.start_date} onChange={e => setAbsData(p => ({...p, start_date: e.target.value}))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Data fim</label>
                        <input type="date" value={absData.end_date} onChange={e => setAbsData(p => ({...p, end_date: e.target.value}))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Dias úteis</label>
                        <input type="number" min="1" value={absData.days} onChange={e => setAbsData(p => ({...p, days: e.target.value}))}
                          placeholder="auto"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                      <input value={absData.notes} onChange={e => setAbsData(p => ({...p, notes: e.target.value}))}
                        placeholder="Opcional..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button onClick={() => setAbsenceForm(false)}
                        className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800">Cancelar</button>
                      <button onClick={submitAbsence}
                        className="px-4 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                        {editingAbsence ? 'Guardar' : 'Criar registo'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de registos */}
                {contact.absences?.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {contact.absences.map((abs: any) => {
                      const typeInfo = ABSENCE_TYPES.find(t => t.value === abs.type)
                      return (
                        <div key={abs.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 group">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium',
                                ABSENCE_TYPE_COLORS[abs.type] ?? 'bg-gray-100 text-gray-600')}>
                                {typeInfo?.label ?? abs.type}
                              </span>
                              <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium',
                                ABSENCE_STATUS_COLORS[abs.status] ?? 'bg-gray-100 text-gray-600')}>
                                {abs.status}
                              </span>
                              {abs.days && (
                                <span className="text-xs text-gray-400">{abs.days} dias úteis</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {abs.start_date ? new Date(abs.start_date).toLocaleDateString('pt-PT') : '—'}
                              {' → '}
                              {abs.end_date ? new Date(abs.end_date).toLocaleDateString('pt-PT') : '—'}
                            </p>
                            {abs.notes && (
                              <p className="text-xs text-gray-400 mt-0.5 italic">{abs.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditAbsence(abs)}
                              className="p-1 text-gray-400 hover:text-primary-600 rounded">
                              <Edit2 size={13}/>
                            </button>
                            <button onClick={() => deleteAbsence(abs)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded">
                              <Trash2 size={13}/>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  !absenceForm && (
                    <div className="px-5 py-6 text-center text-sm text-gray-400">
                      Sem registos RH. Clica em "Novo registo" para adicionar.
                    </div>
                  )
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
                {isEmployee && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Disponibilidade</span>
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium capitalize',
                      contact.employee_status === 'disponível' || !contact.employee_status
                        ? 'bg-green-100 text-green-700'
                        : ABSENCE_TYPE_COLORS[contact.employee_status] ?? 'bg-gray-100 text-gray-600')}>
                      {!contact.employee_status || contact.employee_status === 'disponível'
                        ? 'Disponível'
                        : ABSENCE_TYPES.find(t => t.value === contact.employee_status)?.label ?? contact.employee_status}
                    </span>
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
                      <select value={accEditForm.data.role} onChange={e => accEditForm.setData('role', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                        <option value="operacional">Operacional</option>
                        <option value="administrativo">Administrativo</option>
                        <option value="executivo">Executivo</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="acc-active" checked={accEditForm.data.is_active} onChange={e => accEditForm.setData('is_active', e.target.checked)} className="rounded"/>
                      <label htmlFor="acc-active" className="text-xs text-gray-700">Conta ativa</label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nova password <span className="text-gray-400">(deixar vazio para não alterar)</span></label>
                      <div className="relative">
                        <input type={showPwd ? 'text' : 'password'} value={accEditForm.data.password} onChange={e => accEditForm.setData('password', e.target.value)}
                          className={clsx('w-full px-3 py-2 pr-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
                            accEditForm.errors.password ? 'border-red-400' : 'border-gray-300')}
                          placeholder="Nova password…"/>
                        <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      </div>
                      {accEditForm.errors.password && (
                        <p className="text-xs text-red-500 mt-1">{accEditForm.errors.password}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setAccountMode('idle'); accEditForm.reset() }} className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
                      <button onClick={submitAccountEdit} disabled={accBusy}
                        className="flex-1 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                        {accBusy ? 'A guardar…' : 'Guardar'}
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
                        {contact.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
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
                    <button onClick={() => {
                        accEditForm.setData({ role: contact.user.role, is_active: contact.user.is_active, password: '' })
                        setAccountMode('edit')
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                      <Edit3 size={12}/> Gerir acesso
                    </button>
                  </div>
                )
              ) : accountMode === 'create' ? (
                /* ── Criar conta ─────────────────────────────────── */
                <div className="space-y-3">
                  {/* Email é sempre o da pessoa — mostrar como info */}
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-600 flex items-center gap-1.5">
                    <Mail size={11}/> Login: <span className="font-medium">{contact.email ?? '—'}</span>
                  </div>
                  {!contact.email && (
                    <p className="text-xs text-red-500">A pessoa não tem email. Adiciona um email primeiro.</p>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} value={accCreateForm.data.password} onChange={e => accCreateForm.setData('password', e.target.value)}
                        className={clsx('w-full px-3 py-2 pr-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
                          accCreateForm.errors.password ? 'border-red-400' : 'border-gray-300')}/>
                      <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                    {accCreateForm.errors.password && (
                      <p className="text-xs text-red-500 mt-1">{accCreateForm.errors.password}</p>
                    )}
                    {(accCreateForm.errors as any).error && (
                      <p className="text-xs text-red-500 mt-2 bg-red-50 px-2 py-1 rounded">{(accCreateForm.errors as any).error}</p>
                    )}
                    {(accCreateForm.errors as any).error && (
                      <p className="text-xs text-red-500 mt-1">{(accCreateForm.errors as any).error}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Perfil</label>
                    <select value={accCreateForm.data.role} onChange={e => accCreateForm.setData('role', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                      <option value="operacional">Operacional</option>
                      <option value="administrativo">Administrativo</option>
                      <option value="executivo">Executivo</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setAccountMode('idle'); accCreateForm.reset() }} className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
                    <button onClick={submitCreate} disabled={!contact.email || !accCreateForm.data.password || accCreateForm.processing}
                      className="flex-1 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                      {accCreateForm.processing ? 'A criar…' : 'Criar conta'}
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
              {/* Estado da pessoa */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-700">Estado da pessoa</p>
                  <p className="text-xs text-gray-400 mt-0.5">Controla se a pessoa aparece como ativa no sistema</p>
                </div>
                <button type="button"
                  onClick={() => form.setData('is_active', !form.data.is_active)}
                  className={clsx('relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
                    form.data.is_active ? 'bg-green-500' : 'bg-gray-300')}>
                  <span className={clsx('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    form.data.is_active ? 'translate-x-6' : 'translate-x-1')}/>
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome *</label>
                <input value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                <select value={form.data.person_type_id} onChange={e => form.setData('person_type_id', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="">— Sem tipo —</option>
                  {personTypes.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Telefone</label>
                  <input value={form.data.phone} onChange={e => form.setData('phone', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">NIF</label>
                <input value={form.data.nif} onChange={e => form.setData('nif', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Morada</label>
                <input value={form.data.address} onChange={e => form.setData('address', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Localidade</label>
                  <input value={form.data.city} onChange={e => form.setData('city', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Código Postal</label>
                  <input value={form.data.postal_code} onChange={e => form.setData('postal_code', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
                <textarea value={form.data.notes} onChange={e => form.setData('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"/>
              </div>

              {/* ── Dados de Funcionário ─────────────────────── */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase size={12}/> Dados de Funcionário
                  </p>
                  <button type="button" onClick={() => setShowEmployeeFields(v => !v)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${showEmployeeFields ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                    {showEmployeeFields ? '✓ É Funcionário' : '+ Marcar como Funcionário'}
                  </button>
                </div>
                {showEmployeeFields && <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nº Funcionário</label>
                      <input value={form.data.employee_number} onChange={e => form.setData('employee_number', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"/>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cargo</label>
                      <input value={form.data.position} onChange={e => form.setData('position', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Departamento</label>
                    <select value={form.data.department_id} onChange={e => form.setData('department_id', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                      <option value="">— Sem departamento —</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Contrato</label>
                      <select value={form.data.contract_type} onChange={e => form.setData('contract_type', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                        <option value="">—</option>
                        <option value="efetivo">Efetivo</option>
                        <option value="termo_certo">A Termo Certo</option>
                        <option value="termo_incerto">A Termo Incerto</option>
                        <option value="prestacao_servicos">Prestação de Serviços</option>
                        <option value="avenca">Avença</option>
                        <option value="estagio">Estágio</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Disponibilidade</label>
                      <select value={form.data.employee_status} onChange={e => form.setData('employee_status', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                        <option value="disponível">Disponível</option>
                        <option value="férias">Férias</option>
                        <option value="falta_justificada">Falta Justificada</option>
                        <option value="falta_injustificada">Falta Injustificada</option>
                        <option value="doença">Doença / Baixa</option>
                        <option value="licença_parental">Licença Parental</option>
                        <option value="licença_paternidade">Licença Paternidade</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Data de Admissão</label>
                      <input type="date" value={form.data.hire_date} onChange={e => form.setData('hire_date', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Data de Saída</label>
                      <input type="date" value={form.data.termination_date} onChange={e => form.setData('termination_date', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Contacto Emergência</label>
                      <input value={form.data.emergency_contact} onChange={e => form.setData('emergency_contact', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Telefone Emergência</label>
                      <input value={form.data.emergency_phone} onChange={e => form.setData('emergency_phone', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                    </div>
                  </div>
                </div>}
              </div>

              {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
            </form>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                Cancelar
              </button>
              <button onClick={submitEdit} disabled={form.processing}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {form.processing ? 'A guardar...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
