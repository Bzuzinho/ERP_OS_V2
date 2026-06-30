import React, { useState, useRef, useEffect } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import axios from 'axios'
import clsx from 'clsx'
import {
  Building2, Shield, Upload, X, Trash2,
  Check, Palette, Save, Image as ImageIcon,
  ChevronDown, ChevronUp, FileImage,
  MapPin, Users, Clock, Plus, Pencil, ToggleLeft, ToggleRight, ChevronRight,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Org {
  id: number; name: string; email?: string; phone?: string
  address?: string; city?: string; district?: string; county?: string
  postal_code?: string; nif?: string; diggov_code?: string; website?: string
  description?: string
  primary_color?: string; accent_color?: string
  sidebar_color?: string; header_color?: string; page_bg_color?: string
  card_bg_color?: string; heading_color?: string; text_color?: string; menu_text_color?: string
  logo?: string; logo_secondary?: string
  logo_url?: string | null; logo_secondary_url?: string | null
}

type PermMatrix = Record<string, Record<string, { can_view: boolean; can_edit: boolean; can_delete: boolean }>>

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador', executivo: 'Executivo',
  administrativo: 'Administrativo', operacional: 'Operacional',
}
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700', executivo: 'bg-purple-100 text-purple-700',
  administrativo: 'bg-blue-100 text-blue-700', operacional: 'bg-green-100 text-green-700',
}

function csrf() {
  return (document.querySelector('meta[name="csrf-token"]') as any)?.content ?? ''
}

// ─── Sub-tab interna para Geral ───────────────────────────────────────────────
function InnerTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={clsx('px-4 py-1.5 text-sm font-medium rounded-full transition-colors',
        active ? 'bg-primary-600 text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100')}>
      {label}
    </button>
  )
}

// ─── Secção: Instituição (só campos de texto) ─────────────────────────────────
function InstituicaoForm({ org, onSaved }: { org: Org | null; onSaved?: () => void }) {
  const { data, setData, processing } = useForm({
    name:        org?.name        ?? '',
    email:       org?.email       ?? '',
    phone:       org?.phone       ?? '',
    address:     org?.address     ?? '',
    city:        org?.city        ?? '',
    district:    org?.district    ?? '',
    county:      org?.county      ?? '',
    postal_code: org?.postal_code ?? '',
    nif:         org?.nif         ?? '',
    diggov_code: org?.diggov_code ?? '',
    website:     org?.website     ?? '',
    description: org?.description ?? '',
    primary_color: org?.primary_color ?? '#4f46e5',
    accent_color:  org?.accent_color  ?? '#7c3aed',
  })
  const [saved, setSaved] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, v as string))
    axios.post('/configuracoes/instituicao', fd, { headers: { 'X-CSRF-TOKEN': csrf() } })
      .then(() => { setSaved(true); setTimeout(() => setSaved(false), 3000); onSaved?.() })
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Junta de Freguesia *</label>
          <input value={data.name} onChange={e => setData('name', e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="ex: Junta de Freguesia de Santa Maria"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input value={data.phone} onChange={e => setData('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
          <input value={data.nif} onChange={e => setData('nif', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código DigGov</label>
          <input value={data.diggov_code} onChange={e => setData('diggov_code', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="ex: 040101"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input type="url" value={data.website} onChange={e => setData('website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://..."/>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Morada</label>
          <input value={data.address} onChange={e => setData('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Localidade</label>
          <input value={data.city} onChange={e => setData('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
          <input value={data.postal_code} onChange={e => setData('postal_code', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="1000-001"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Concelho</label>
          <input value={data.county} onChange={e => setData('county', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
          <input value={data.district} onChange={e => setData('district', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Apresentação</label>
          <textarea value={data.description} onChange={e => setData('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"/>
        </div>
      </div>
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button type="submit" disabled={processing}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
          {saved ? <><Check size={15}/> Guardado!</> : <><Save size={15}/> Guardar</>}
        </button>
      </div>
    </form>
  )
}

// ─── Secção: Logótipos ────────────────────────────────────────────────────────
function LogotiposForm({ org }: { org: Org | null }) {
  const logoRef  = useRef<HTMLInputElement>(null)
  const logo2Ref = useRef<HTMLInputElement>(null)

  const [logoPreview,  setLogoPreview]  = useState<string | null>(org?.logo_url ?? null)
  const [logo2Preview, setLogo2Preview] = useState<string | null>(org?.logo_secondary_url ?? null)
  const [logoFile,     setLogoFile]     = useState<File | null>(null)
  const [logo2File,    setLogo2File]    = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, secondary: boolean) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (secondary) { setLogo2File(file); setLogo2Preview(url) }
    else           { setLogoFile(file);  setLogoPreview(url) }
  }

  async function save() {
    setSaving(true)
    const fd = new FormData()
    // Enviar também o campo name obrigatório para não falhar a validação
    fd.append('name', org?.name ?? 'JuntaOS')
    if (logoFile)  fd.append('logo', logoFile)
    if (logo2File) fd.append('logo_secondary', logo2File)
    await axios.post('/configuracoes/instituicao', fd, { headers: { 'X-CSRF-TOKEN': csrf() } })
    setSaving(false); setSaved(true)
    setTimeout(() => { router.reload(); setSaved(false) }, 800)
  }

  async function removeLogo(field: string) {
    await axios.delete('/configuracoes/instituicao/logo', {
      data: { field }, headers: { 'X-CSRF-TOKEN': csrf() }
    })
    if (field === 'logo') { setLogoPreview(null); setLogoFile(null) }
    else                  { setLogo2Preview(null); setLogo2File(null) }
    router.reload()
  }

  const logos = [
    { label: 'Logótipo principal', hint: 'Aparece no canto superior esquerdo da sidebar', preview: logoPreview, ref: logoRef, field: 'logo', secondary: false },
    { label: 'Logótipo secundário / favicon', hint: 'Usado como ícone do separador do browser', preview: logo2Preview, ref: logo2Ref, field: 'logo_secondary', secondary: true },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-6">
      {logos.map(({ label, hint, preview, ref, field, secondary }) => (
        <div key={field}>
          <p className="text-sm font-medium text-gray-700 mb-0.5">{label}</p>
          <p className="text-xs text-gray-400 mb-3">{hint}</p>
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
              {preview
                ? <img src={preview} alt="logo" className="w-full h-full object-contain p-2"/>
                : <FileImage size={28} className="text-gray-300"/>}
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => ref.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <Upload size={14}/> Escolher ficheiro
              </button>
              {preview && (
                <button type="button" onClick={() => removeLogo(field)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14}/> Remover
                </button>
              )}
              <input type="file" ref={ref} className="hidden" accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={e => handleChange(e, secondary)}/>
            </div>
          </div>
        </div>
      ))}

      {(logoFile || logo2File) && (
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
            {saved ? <><Check size={15}/> Guardado!</> : saving ? 'A guardar…' : <><Save size={15}/> Guardar logótipos</>}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Secção: Cores ────────────────────────────────────────────────────────────
// ─── Picker de cor reutilizável ───────────────────────────────────────────────
function ColorPicker({ label, hint, value, onChange, presets }: {
  label: string; hint: string; value: string
  onChange: (v: string) => void; presets?: string[]
}) {
  const P = presets ?? ['#4f46e5','#7c3aed','#0ea5e9','#16a34a','#d97706','#dc2626','#0f172a','#f9fafb','#ffffff','#111827','#374151','#94a3b8']
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-0.5">{label}</p>
      <p className="text-xs text-gray-400 mb-2">{hint}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5 flex-shrink-0"/>
        <input type="text" value={value} maxLength={7} onChange={e => onChange(e.target.value)}
          className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"/>
        <div className="flex gap-1 flex-wrap">
          {P.map(c => (
            <button key={c} type="button" onClick={() => onChange(c)}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 flex-shrink-0"
              style={{ background: c, borderColor: value === c ? '#1e293b' : 'transparent' }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

function CoresForm({ org }: { org: Org | null }) {
  const defaults = {
    primary_color:   org?.primary_color   ?? '#4f46e5',
    accent_color:    org?.accent_color    ?? '#7c3aed',
    sidebar_color:   org?.sidebar_color   ?? '#0f172a',
    header_color:    org?.header_color    ?? '#ffffff',
    page_bg_color:   org?.page_bg_color   ?? '#f9fafb',
    card_bg_color:   org?.card_bg_color   ?? '#ffffff',
    heading_color:   org?.heading_color   ?? '#111827',
    text_color:      org?.text_color      ?? '#374151',
    menu_text_color: org?.menu_text_color ?? '#94a3b8',
  }
  const [vals, setVals] = useState(defaults)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  useEffect(() => { setVals(defaults) }, [
    org?.primary_color, org?.accent_color, org?.sidebar_color, org?.header_color,
    org?.page_bg_color, org?.card_bg_color, org?.heading_color, org?.text_color, org?.menu_text_color,
  ])

  const set = (k: keyof typeof vals) => (v: string) => setVals(p => ({ ...p, [k]: v }))

  async function save() {
    setSaving(true)
    const fd = new FormData()
    fd.append('name', org?.name ?? 'JuntaOS')
    Object.entries(vals).forEach(([k, v]) => fd.append(k, v))
    await axios.post('/configuracoes/instituicao', fd, { headers: { 'X-CSRF-TOKEN': csrf() } })
    setSaving(false); setSaved(true)
    setTimeout(() => { router.reload(); setSaved(false) }, 800)
  }

  const DARK  = ['#0f172a','#1e293b','#111827','#1f2937','#18181b','#0a0a0a','#0c0c0c','#171717']
  const LIGHT = ['#ffffff','#f9fafb','#f3f4f6','#f8fafc','#fafafa','#fffbeb','#f0fdf4','#eff6ff']
  const TEXT  = ['#111827','#1f2937','#374151','#4b5563','#6b7280','#94a3b8','#cbd5e1','#ffffff']

  return (
    <div className="space-y-5">
      {/* Grupo: Cores de destaque */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Palette size={14}/> Cores de destaque</h3>
        <ColorPicker label="Cor principal" hint="Botões, itens activos, elementos primários" value={vals.primary_color} onChange={set('primary_color')}/>
        <ColorPicker label="Cor de destaque" hint="Badges, links e indicadores secundários" value={vals.accent_color} onChange={set('accent_color')}/>
      </div>

      {/* Grupo: Fundos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Palette size={14}/> Cores de fundo</h3>
        <ColorPicker label="Fundo do menu lateral" hint="Cor de fundo da sidebar esquerda" value={vals.sidebar_color} onChange={set('sidebar_color')} presets={DARK}/>
        <ColorPicker label="Fundo do cabeçalho" hint="Barra de topo com notificações e perfil" value={vals.header_color} onChange={set('header_color')} presets={LIGHT}/>
        <ColorPicker label="Fundo principal" hint="Cor de fundo da área de conteúdo" value={vals.page_bg_color} onChange={set('page_bg_color')} presets={LIGHT}/>
        <ColorPicker label="Fundo dos cards" hint="Cor de fundo de tabelas, painéis e cards" value={vals.card_bg_color} onChange={set('card_bg_color')} presets={LIGHT}/>
      </div>

      {/* Grupo: Tipografia */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Palette size={14}/> Cores de texto</h3>
        <ColorPicker label="Cor dos cabeçalhos" hint="Títulos h1, h2, h3 e rótulos de secção" value={vals.heading_color} onChange={set('heading_color')} presets={TEXT}/>
        <ColorPicker label="Cor do texto geral" hint="Corpo de texto, parágrafos e descrições" value={vals.text_color} onChange={set('text_color')} presets={TEXT}/>
        <ColorPicker label="Cor do texto do menu" hint="Itens inactivos da barra lateral" value={vals.menu_text_color} onChange={set('menu_text_color')} presets={TEXT}/>
      </div>

      {/* Pré-visualização rápida */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
          Pré-visualização
        </div>
        <div className="flex h-24">
          <div className="w-28 flex flex-col p-3 gap-1.5" style={{ background: vals.sidebar_color }}>
            <div className="h-2.5 rounded-sm w-full" style={{ background: vals.primary_color }}/>
            <div className="h-2 rounded-sm w-3/4 opacity-50" style={{ background: vals.menu_text_color }}/>
            <div className="h-2 rounded-sm w-2/3 opacity-50" style={{ background: vals.menu_text_color }}/>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="h-8 border-b border-gray-100 flex items-center px-3 gap-2" style={{ background: vals.header_color }}>
              <div className="h-2 w-16 rounded-sm" style={{ background: vals.heading_color }}/>
            </div>
            <div className="flex-1 p-3" style={{ background: vals.page_bg_color }}>
              <div className="rounded-md p-2" style={{ background: vals.card_bg_color, border: '1px solid #e5e7eb' }}>
                <div className="h-1.5 w-20 rounded mb-1" style={{ background: vals.heading_color }}/>
                <div className="h-1 w-24 rounded opacity-60" style={{ background: vals.text_color }}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
          {saved ? <><Check size={15}/> Guardado!</> : saving ? 'A guardar…' : <><Palette size={15}/> Guardar cores</>}
        </button>
      </div>
    </div>
  )
}

// ─── Secção Geral (com 3 sub-tabs) ───────────────────────────────────────────
function GeralSection({ org }: { org: Org | null }) {
  const [tab, setTab] = useState<'instituicao' | 'logotipos' | 'cores'>('instituicao')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 flex-wrap">
        <InnerTab active={tab === 'instituicao'} onClick={() => setTab('instituicao')} label="Instituição"/>
        <InnerTab active={tab === 'logotipos'}   onClick={() => setTab('logotipos')}   label="Logótipos"/>
        <InnerTab active={tab === 'cores'}        onClick={() => setTab('cores')}       label="Cores da Interface"/>
      </div>
      {tab === 'instituicao' && <InstituicaoForm org={org}/>}
      {tab === 'logotipos'   && <LogotiposForm org={org}/>}
      {tab === 'cores'       && <CoresForm org={org}/>}
    </div>
  )
}

// ─── Secção: Perfis & Acessos ─────────────────────────────────────────────────
const PERM_ROLE_DESC: Record<string, string> = {
  executivo:      'Aprova e supervisiona. Pode ver e editar tudo por omissão.',
  administrativo: 'Gestão administrativa. Acesso de edição aos módulos atribuídos.',
  operacional:    'Tarefas e campo. Acesso de leitura por omissão.',
}

function PerfisSection({
  matrix, modules, roles,
}: { matrix: PermMatrix; modules: Record<string,string>; roles: string[] }) {
  const [perms, setPerms] = useState<PermMatrix>(matrix)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [expandedRole, setExpandedRole] = useState<string | null>(roles[0] ?? null)

  function toggle(role: string, mod: string, field: 'can_view' | 'can_edit' | 'can_delete') {
    setPerms(prev => {
      const cur  = prev[role]?.[mod] ?? { can_view: true, can_edit: false, can_delete: false }
      const next = { ...cur, [field]: !cur[field] }
      if ((field === 'can_edit' || field === 'can_delete') && next[field]) next.can_view = true
      if (field === 'can_view' && !next.can_view) { next.can_edit = false; next.can_delete = false }
      return { ...prev, [role]: { ...prev[role], [mod]: next } }
    })
  }

  function setAll(role: string, field: 'can_view' | 'can_edit' | 'can_delete', value: boolean) {
    setPerms(prev => {
      const rp = { ...prev[role] }
      Object.keys(modules).forEach(mod => {
        const cur  = rp[mod] ?? { can_view: true, can_edit: false, can_delete: false }
        const next = { ...cur, [field]: value }
        if (value && (field === 'can_edit' || field === 'can_delete')) next.can_view = true
        if (!value && field === 'can_view') { next.can_edit = false; next.can_delete = false }
        rp[mod] = next
      })
      return { ...prev, [role]: rp }
    })
  }

  async function save() {
    setSaving(true)
    const permissions: any[] = []
    roles.forEach(role => {
      Object.keys(modules).forEach(mod => {
        const p = perms[role]?.[mod] ?? { can_view: true, can_edit: false, can_delete: false }
        permissions.push({ role, module: mod, ...p })
      })
    })
    await axios.post('/configuracoes/permissoes', { permissions }, { headers: { 'X-CSRF-TOKEN': csrf() } })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Shield size={16} className="text-amber-600 mt-0.5 flex-shrink-0"/>
        <div>
          <p className="text-sm font-semibold text-amber-800">Perfil Administrador</p>
          <p className="text-xs text-amber-700 mt-0.5">Acesso total e irrestrito a todos os módulos. Não configurável.</p>
        </div>
      </div>

      {roles.map(role => {
        const isOpen = expandedRole === role
        return (
          <div key={role} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <button type="button"
              onClick={() => setExpandedRole(isOpen ? null : role)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className={clsx('px-2.5 py-1 rounded-full text-xs font-semibold', ROLE_COLORS[role])}>
                  {ROLE_LABELS[role]}
                </span>
                <p className="text-sm text-gray-500 hidden sm:block">{PERM_ROLE_DESC[role]}</p>
              </div>
              {isOpen ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
            </button>

            {isOpen && (
              <div className="border-t border-gray-100">
                <div className="grid grid-cols-[1fr_80px_80px_80px] border-b border-gray-100 bg-gray-50 px-5 py-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Módulo</div>
                  {(['can_view','can_edit','can_delete'] as const).map(f => {

                    const labels = { can_view: 'Ver', can_edit: 'Editar', can_delete: 'Apagar' }
                    const allOn = Object.keys(modules).every(m => perms[role]?.[m]?.[f] ?? (f === 'can_view'))
                    return (
                      <div key={f} className="text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{labels[f]}</p>
                        <button type="button" onClick={() => setAll(role, f, !allOn)}
                          className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors',
                            allOn ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                          {allOn ? 'Todos' : 'Nenhum'}
                        </button>
                      </div>
                    )
                  })}
                </div>
                {Object.entries(modules).map(([mod, label]) => (
                  <div key={mod} className="grid grid-cols-[1fr_80px_80px_80px] items-center px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <span className="text-sm text-gray-700">{label}</span>
                    {(['can_view','can_edit','can_delete'] as const).map(f => {
                      const val = perms[role]?.[mod]?.[f] ?? (f === 'can_view')
                      return (
                        <div key={f} className="flex justify-center">
                          <button type="button" onClick={() => toggle(role, mod, f)}
                            className={clsx('w-5 h-5 rounded flex items-center justify-center transition-colors border',
                              val ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 hover:border-primary-400')}>
                            {val && <Check size={11}/>}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="flex justify-end pt-2">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
          {saved ? <><Check size={15}/> Guardado!</> : saving ? 'A guardar...' : <><Save size={15}/> Guardar permissoes</>}
        </button>
      </div>
    </div>
  )
}

// ─── Espaços Section ──────────────────────────────────────────────────────────
const DAYS_PT: Record<string,string> = {
  monday:'Segunda', tuesday:'Terça', wednesday:'Quarta',
  thursday:'Quinta', friday:'Sexta', saturday:'Sábado', sunday:'Domingo',
}
const DAY_KEYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

const SPACE_TYPES = ['Sala de Reunião','Auditório','Salão','Sala Polivalente','Espaço Exterior','Arquivo','Outro']
function SpaceForm({ space, users, teams, onClose }: {
  space?: any; users: any[]; teams: any[]; onClose: () => void
}) {
  const isEdit = !!space
  const { data, setData, post, patch, processing, errors, reset } = useForm({
    name: space?.name ?? '', type: space?.type ?? SPACE_TYPES[0],
    description: space?.description ?? '', capacity: space?.capacity ?? '',
    location: space?.location ?? '', color: space?.color ?? '',
    is_active: space?.is_active ?? true, is_public: space?.is_public ?? false,
    responsible_user_id: space?.responsible_user?.id ?? '',
    responsible_team_id: space?.responsible_team?.id ?? '',
    requirements: space?.requirements ?? '', notes: space?.notes ?? '',
    schedule: (space?.schedule ?? {}) as Record<string, { open: string; close: string; closed?: boolean }>,
  })
  const toggleDay = (day: string) => {
    const s = { ...(data.schedule as any) }
    s[day] = s[day]?.closed === false || !s[day]
      ? { open: '09:00', close: '18:00', closed: false }
      : { ...s[day], closed: true }
    setData('schedule', s)
  }
  const setDayTime = (day: string, field: 'open' | 'close', val: string) => {
    const s = { ...(data.schedule as any) }
    s[day] = { ...(s[day] ?? { open: '09:00', close: '18:00' }), [field]: val, closed: false }
    setData('schedule', s)
  }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    isEdit
      ? patch(`/configuracoes/espacos/${space.id}`, { onSuccess: onClose })
      : post('/configuracoes/espacos', { onSuccess: () => { reset(); onClose() } })
  }
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{isEdit ? 'Editar Espaço' : 'Novo Espaço'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Nome *</label>
              <input value={data.name} onChange={e => setData('name', e.target.value)} className={inp} required/>
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo</label>
              <select value={data.type} onChange={e => setData('type', e.target.value)} className={inp}>
                {SPACE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Localização</label>
              <input value={data.location} onChange={e => setData('location', e.target.value)} className={inp}/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Capacidade</label>
              <input type="number" value={data.capacity} onChange={e => setData('capacity', e.target.value)} className={inp} min={1}/>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Descrição</label>
            <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2} className={inp}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Responsável (pessoa)</label>
              <select value={data.responsible_user_id} onChange={e => setData('responsible_user_id', e.target.value)} className={inp}>
                <option value="">Sem responsável</option>
                {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Equipa responsável</label>
              <select value={data.responsible_team_id} onChange={e => setData('responsible_team_id', e.target.value)} className={inp}>
                <option value="">Sem equipa</option>
                {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Horário</label>
            <div className="space-y-2 bg-gray-50 rounded-xl p-3">
              {DAY_KEYS.map(day => {
                const sc = (data.schedule as any)[day]
                const open = sc && !sc.closed
                return (
                  <div key={day} className="flex items-center gap-3">
                    <button type="button" onClick={() => toggleDay(day)}
                      className={clsx('text-xs font-medium w-24 text-left rounded px-2 py-1', open ? 'text-primary-700 bg-primary-50' : 'text-gray-400 bg-white border border-gray-200')}>
                      {DAYS_PT[day]}
                    </button>
                    {open ? (
                      <>
                        <input type="time" value={sc?.open ?? '09:00'} onChange={e => setDayTime(day,'open',e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-xs w-24"/>
                        <span className="text-xs text-gray-400">ate</span>
                        <input type="time" value={sc?.close ?? '18:00'} onChange={e => setDayTime(day,'close',e.target.value)} className="border border-gray-200 rounded px-2 py-1 text-xs w-24"/>
                      </>
                    ) : <span className="text-xs text-gray-400">Fechado</span>}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Requisitos</label>
              <textarea value={data.requirements} onChange={e => setData('requirements', e.target.value)} rows={3} className={inp} placeholder="Ex: Projetor, AC"/>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Notas internas</label>
              <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3} className={inp}/>
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded"/> Ativo
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={data.is_public} onChange={e => setData('is_public', e.target.checked)} className="rounded"/> Publico
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={processing}
              className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">
              {processing ? 'A guardar...' : isEdit ? 'Atualizar' : 'Criar Espaco'}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EspacosSection({ spaces, users, teams }: { spaces: any[]; users: any[]; teams: any[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<any>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const deleteSpace = (id: number) => {
    if (!confirm('Remover este espaco?')) return
    router.delete(`/configuracoes/espacos/${id}`)
  }
  const toggleActive = (space: any) => {
    router.patch(`/configuracoes/espacos/${space.id}`, { is_active: !space.is_active })
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Gestao de Espacos</h2>
          <p className="text-xs text-gray-500 mt-0.5">Crie e configure os espacos disponiveis para reserva</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium">
          <Plus size={14}/> Novo Espaco
        </button>
      </div>
      {spaces.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <MapPin size={32} className="mx-auto text-gray-300 mb-2"/>
          <p className="text-sm text-gray-500">Nenhum espaco criado ainda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {spaces.map((sp: any) => (
            <div key={sp.id} className={clsx('bg-white rounded-xl border transition-all', expanded === sp.id ? 'border-primary-200 shadow-sm' : 'border-gray-100')}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-800">{sp.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{sp.type}</span>
                    {!sp.is_active && <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Inativo</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {sp.location && <span className="text-xs text-gray-400">{sp.location}</span>}
                    {sp.capacity && <span className="text-xs text-gray-400">{sp.capacity} pessoas</span>}
                    {sp.responsible_user && <span className="text-xs text-gray-400">{sp.responsible_user.name}</span>}
                    {sp.responsible_team && <span className="text-xs text-gray-400">{sp.responsible_team.name}</span>}
                    <span className="text-xs text-gray-300">{sp.reservations_count} reserva(s)</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(sp)} title={sp.is_active ? 'Desativar' : 'Ativar'}
                    className={clsx('p-1.5 rounded-lg', sp.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50')}>
                    {sp.is_active ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
                  </button>
                  <button onClick={() => { setEditing(sp); setShowForm(false) }} title="Editar"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50">
                    <Pencil size={14}/>
                  </button>
                  <button onClick={() => deleteSpace(sp.id)} title="Remover"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 size={14}/>
                  </button>
                  <button onClick={() => setExpanded(expanded === sp.id ? null : sp.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50">
                    <ChevronRight size={14} className={clsx('transition-transform', expanded === sp.id && 'rotate-90')}/>
                  </button>
                </div>
              </div>
              {expanded === sp.id && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-50 grid grid-cols-2 gap-4">
                  {sp.requirements && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Requisitos</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{sp.requirements}</p>
                    </div>
                  )}
                  {sp.notes && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Notas</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{sp.notes}</p>
                    </div>
                  )}
                  {sp.schedule && Object.keys(sp.schedule).length > 0 && (
                    <div className="col-span-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">Horario</p>
                      <div className="flex flex-wrap gap-2">
                        {DAY_KEYS.map(day => {
                          const s = sp.schedule[day]
                          if (!s) return null
                          return (
                            <span key={day} className={clsx('text-xs px-2 py-1 rounded-lg',
                              s.closed ? 'bg-gray-50 text-gray-400' : 'bg-primary-50 text-primary-700')}>
                              {DAYS_PT[day]}: {s.closed ? 'Fechado' : `${s.open}-${s.close}`}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {(showForm || editing) && (
        <SpaceForm space={editing ?? undefined} users={users} teams={teams}
          onClose={() => { setShowForm(false); setEditing(null) }}/>
      )}
    </div>
  )
}

export default function SettingsIndex({
  section, institution, rolePermissions, modules, roles,
  spaces, users, teams,
}: {
  section: 'geral' | 'perfis' | 'espacos'
  institution: any
  rolePermissions: PermMatrix
  modules: Record<string,string>
  roles: string[]
  spaces?: any[]
  users?: any[]
  teams?: any[]
}) {
  return (
    <>
      <Head title="Configuracoes"/>
      <AdminLayout title="Configuracoes">
        <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
          {section === 'geral'   && <GeralSection org={institution}/>}
          {section === 'perfis'  && <PerfisSection matrix={rolePermissions} modules={modules} roles={roles}/>}
          {section === 'espacos' && <EspacosSection spaces={spaces ?? []} users={users ?? []} teams={teams ?? []}/>}
        </div>
      </AdminLayout>
    </>
  )
}
