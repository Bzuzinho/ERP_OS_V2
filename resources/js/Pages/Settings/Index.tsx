import React, { useState, useRef, useEffect } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import axios from 'axios'
import clsx from 'clsx'
import {
  Building2, Users, Shield, Upload, X, Plus, Edit2, Trash2,
  Check, Palette, Save, Image as ImageIcon,
  ChevronDown, ChevronUp, Link2, FileImage,
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
}
interface UserRow { id: number; name: string; email: string; role: string; is_active: boolean; created_at: string; contact?: any }
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

  const toUrl = (path?: string | null) => path ? `/storage/${path}` : null
  const [logoPreview,  setLogoPreview]  = useState<string | null>(toUrl(org?.logo))
  const [logo2Preview, setLogo2Preview] = useState<string | null>(toUrl(org?.logo_secondary))
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

// ─── Formulário de utilizador ─────────────────────────────────────────────────
function UserForm({ onClose, initial, pessoasWithoutUser = [] }: {
  onClose: () => void; initial?: any; pessoasWithoutUser?: any[]
}) {
  const isEdit = !!initial
  const linkedContact = initial?.contact ?? null

  const { data, setData, post, patch, processing, errors } = useForm({
    name:       initial?.name  ?? '',
    email:      initial?.email ?? '',
    password:   '',
    role:       initial?.role  ?? 'operacional',
    is_active:  initial?.is_active ?? true,
    contact_id: linkedContact?.id?.toString() ?? '',
  })

  function handleContactChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    setData('contact_id', id)
    if (!isEdit && id) {
      const p = pessoasWithoutUser.find((p: any) => p.id.toString() === id)
      if (p) {
        if (!data.name)  setData('name',  p.name)
        if (!data.email && p.email) setData('email', p.email)
      }
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit) patch(`/configuracoes/usuarios/${initial.id}`)
    else        post('/configuracoes/usuarios')
  }

  const pessoaOptions = isEdit && linkedContact
    ? [linkedContact, ...pessoasWithoutUser.filter((p: any) => p.id !== linkedContact.id)]
    : pessoasWithoutUser

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-primary-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{isEdit ? `Editar — ${initial.name}` : 'Novo Utilizador'}</h3>
        <button type="button" onClick={onClose}><X size={16} className="text-gray-400"/></button>
      </div>

      {/* Pessoa associada */}
      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
          <Link2 size={13} className="text-blue-500"/> Pessoa associada
          <span className="text-xs font-normal text-gray-400 ml-1">(opcional)</span>
        </label>
        {pessoaOptions.length > 0 ? (
          <select value={data.contact_id} onChange={handleContactChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">— Sem pessoa associada —</option>
            {pessoaOptions.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}{p.email ? ` (${p.email})` : ''}</option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-gray-400 italic py-1">Sem pessoas disponíveis para associar.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input value={data.name} onChange={e => setData('name', e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isEdit ? 'Nova Password (opcional)' : 'Password *'}
          </label>
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
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer col-span-2">
            <input type="checkbox" checked={data.is_active}
              onChange={e => setData('is_active', e.target.checked)}
              className="rounded border-gray-300 text-primary-600"/>
            Conta ativa
          </label>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
        <button type="submit" disabled={processing}
          className="px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg">
          {processing ? 'A guardar…' : (isEdit ? 'Guardar' : 'Criar')}
        </button>
      </div>
    </form>
  )
}

// ─── Secção: Utilizadores ─────────────────────────────────────────────────────
function UtilizadoresSection({ users, pessoasWithoutUser }: { users: UserRow[]; pessoasWithoutUser: any[] }) {
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  function destroy(u: UserRow) {
    if (confirm(`Eliminar "${u.name}"?`)) router.delete(`/configuracoes/usuarios/${u.id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{users.length} utilizador(es) registados</p>
        <button onClick={() => { setShowCreate(true); setEditId(null) }}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg">
          <Plus size={15}/> Novo Utilizador
        </button>
      </div>

      {showCreate && (
        <UserForm onClose={() => setShowCreate(false)} pessoasWithoutUser={pessoasWithoutUser}/>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Utilizador</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Perfil</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 hidden lg:table-cell">Criado</th>
              <th className="px-4 py-3"/>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <React.Fragment key={u.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {u.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                        {u.contact && (
                          <p className="text-xs text-blue-600 flex items-center gap-0.5 mt-0.5">
                            <Link2 size={10}/> {u.contact.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium',
                      ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600')}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={clsx('flex items-center gap-1 text-xs font-medium',
                      u.is_active ? 'text-green-600' : 'text-gray-400')}>
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
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><Edit2 size={14}/></button>
                      <button onClick={() => destroy(u)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
                {editId === u.id && (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 bg-gray-50">
                      <UserForm initial={u} onClose={() => setEditId(null)} pessoasWithoutUser={pessoasWithoutUser}/>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
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

// --- Pagina principal ---
export default function SettingsIndex({
  section, institution, users, pessoasWithoutUser, rolePermissions, modules, roles,
}: {
  section: 'geral' | 'utilizadores' | 'perfis'
  institution: any
  users: UserRow[]
  pessoasWithoutUser: any[]
  rolePermissions: PermMatrix
  modules: Record<string,string>
  roles: string[]
}) {
  return (
    <>
      <Head title="Configuracoes"/>
      <AdminLayout title="Configuracoes">
        <div className="max-w-4xl mx-auto space-y-6">
          {section === 'geral'       && <GeralSection org={institution}/>}
          {section === 'utilizadores' && (
            <UtilizadoresSection
              users={users}
              pessoasWithoutUser={pessoasWithoutUser}
            />
          )}
          {section === 'perfis' && (
            <PerfisSection
              matrix={rolePermissions}
              modules={modules}
              roles={roles}
            />
          )}
        </div>
      </AdminLayout>
    </>
  )
}
