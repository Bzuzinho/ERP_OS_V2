import React, { useState } from 'react'
import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ChevronDown, ChevronUp, Pencil, Trash2, Plus, X, Check } from 'lucide-react'

// ── Tipos ────────────────────────────────────────────────────────────────────
interface Team { id: number; name: string; type?: string }
interface ServiceArea {
  id: number
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  is_active: boolean
  teams: Team[]
}

// ── Card por área ────────────────────────────────────────────────────────────
function AreaCard({ area, allTeams }: { area: ServiceArea; allTeams: Team[] }) {
  const [open, setOpen] = useState(false)
  const [showTeamPicker, setShowTeamPicker] = useState(false)

  const form = useForm({
    name:        area.name,
    description: area.description ?? '',
    color:       area.color ?? '#6366f1',
    is_active:   area.is_active,
    team_ids:    area.teams.map(t => t.id) as number[],
  })

  function save() {
    form.patch(`/configuracoes/areas/${area.id}`, {
      onSuccess: () => setOpen(false),
    })
  }

  function destroy() {
    if (!confirm(`Eliminar "${area.name}"? Esta área será removida das equipas e pedidos associados.`)) return
    router.delete(`/configuracoes/areas/${area.id}`)
  }

  function toggleTeam(id: number) {
    const ids = form.data.team_ids
    form.setData('team_ids', ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  }

  const selectedTeams = allTeams.filter(t => form.data.team_ids.includes(t.id))
  const dot = area.color ?? '#6366f1'

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: dot }} />
        <span className="font-medium text-gray-800 flex-1">{area.name}</span>
        {!area.is_active && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">inactivo</span>
        )}
        <div className="flex items-center gap-1">
          <button onClick={destroy}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
          <button onClick={() => setOpen(o => !o)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Equipas em resumo */}
      {!open && area.teams.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {area.teams.map(t => (
            <span key={t.id} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2 py-0.5">
              {t.name}
            </span>
          ))}
        </div>
      )}

      {/* Expanded */}
      {open && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
              <input value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent" />
              {form.errors.name && <p className="text-xs text-red-500 mt-0.5">{form.errors.name}</p>}
            </div>
            <div className="flex items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cor</label>
                <input type="color" value={form.data.color}
                  onChange={e => form.setData('color', e.target.value)}
                  className="h-9 w-14 border border-gray-300 rounded-lg cursor-pointer" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.data.is_active}
                    onChange={e => form.setData('is_active', e.target.checked)}
                    className="rounded text-primary-600" />
                  <span className="text-sm text-gray-700">Activa</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
            <textarea value={form.data.description} onChange={e => form.setData('description', e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none" />
          </div>

          {/* Equipas */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Equipas desta área</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedTeams.length === 0 && (
                <span className="text-xs text-gray-400 italic">Nenhuma equipa associada</span>
              )}
              {selectedTeams.map(t => (
                <span key={t.id}
                  className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2 py-0.5">
                  {t.name}
                  <button onClick={() => toggleTeam(t.id)} className="hover:text-red-500 transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
              <button onClick={() => setShowTeamPicker(p => !p)}
                className="flex items-center gap-1 text-xs bg-white border border-dashed border-gray-300 text-gray-500 rounded-full px-2 py-0.5 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                <Plus size={11} /> Adicionar
              </button>
            </div>

            {showTeamPicker && (
              <div className="border border-gray-200 rounded-lg bg-white shadow-sm max-h-40 overflow-y-auto">
                {allTeams.map(t => {
                  const checked = form.data.team_ids.includes(t.id)
                  return (
                    <label key={t.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                      <input type="checkbox" checked={checked} onChange={() => toggleTeam(t.id)}
                        className="rounded text-indigo-600" />
                      <span className="text-gray-800">{t.name}</span>
                      {t.type && <span className="text-xs text-gray-400">{t.type}</span>}
                    </label>
                  )
                })}
                {allTeams.length === 0 && (
                  <p className="px-3 py-2 text-sm text-gray-400">Sem equipas disponíveis</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button onClick={save} disabled={form.processing}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              <Check size={14} /> Guardar alterações
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Formulário criar nova área ───────────────────────────────────────────────
function CreateAreaForm({ allTeams }: { allTeams: Team[] }) {
  const [show, setShow] = useState(false)
  const [showTeamPicker, setShowTeamPicker] = useState(false)

  const form = useForm({
    name:        '',
    description: '',
    color:       '#6366f1',
    is_active:   true,
    team_ids:    [] as number[],
  })

  function submit() {
    form.post('/configuracoes/areas', {
      onSuccess: () => { form.reset(); setShow(false); setShowTeamPicker(false) },
    })
  }

  function toggleTeam(id: number) {
    const ids = form.data.team_ids
    form.setData('team_ids', ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  }

  const selectedTeams = allTeams.filter(t => form.data.team_ids.includes(t.id))

  if (!show) {
    return (
      <button onClick={() => setShow(true)}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors">
        <Plus size={15} /> Nova área funcional
      </button>
    )
  }

  return (
    <div className="border border-primary-200 rounded-xl bg-primary-50 p-4 space-y-3">
      <h3 className="font-semibold text-primary-800 text-sm">Nova área funcional</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
          <input value={form.data.name} onChange={e => form.setData('name', e.target.value)}
            placeholder="ex: Manutenção e Obras"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white" />
          {form.errors.name && <p className="text-xs text-red-500 mt-0.5">{form.errors.name}</p>}
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cor</label>
            <input type="color" value={form.data.color}
              onChange={e => form.setData('color', e.target.value)}
              className="h-9 w-14 border border-gray-300 rounded-lg cursor-pointer bg-white" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.data.is_active}
                onChange={e => form.setData('is_active', e.target.checked)}
                className="rounded text-primary-600" />
              <span className="text-sm text-gray-700">Activa</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
        <input value={form.data.description} onChange={e => form.setData('description', e.target.value)}
          placeholder="Descrição opcional"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white" />
      </div>

      {/* Equipas */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Equipas</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTeams.map(t => (
            <span key={t.id}
              className="flex items-center gap-1 text-xs bg-white text-indigo-700 border border-indigo-200 rounded-full px-2 py-0.5">
              {t.name}
              <button onClick={() => toggleTeam(t.id)} className="hover:text-red-500"><X size={11} /></button>
            </span>
          ))}
          <button onClick={() => setShowTeamPicker(p => !p)}
            className="flex items-center gap-1 text-xs bg-white border border-dashed border-gray-300 text-gray-500 rounded-full px-2 py-0.5 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
            <Plus size={11} /> Adicionar equipa
          </button>
        </div>
        {showTeamPicker && (
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm max-h-36 overflow-y-auto">
            {allTeams.map(t => (
              <label key={t.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                <input type="checkbox" checked={form.data.team_ids.includes(t.id)}
                  onChange={() => toggleTeam(t.id)} className="rounded text-indigo-600" />
                <span>{t.name}</span>
              </label>
            ))}
            {allTeams.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Sem equipas</p>}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => { setShow(false); form.reset() }}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          Cancelar
        </button>
        <button onClick={submit} disabled={form.processing || !form.data.name.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
          <Check size={14} /> Criar área
        </button>
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function SettingsAreas({ serviceAreas, allTeams }: {
  serviceAreas: ServiceArea[]
  allTeams: Team[]
}) {
  const active   = serviceAreas.filter(a => a.is_active)
  const inactive = serviceAreas.filter(a => !a.is_active)

  return (
    <AdminLayout>
      <Head title="Áreas Funcionais" />
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Topo */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Áreas Funcionais</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Define as divisões operacionais da junta e as equipas associadas a cada uma.
              Os pedidos são encaminhados para uma área, e as equipas dessa área executam o trabalho.
            </p>
          </div>
          <CreateAreaForm allTeams={allTeams} />
        </div>

        {/* Lista activas */}
        {active.length === 0 && inactive.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
            Sem áreas funcionais. Cria a primeira acima.
          </div>
        )}

        {active.length > 0 && (
          <div className="space-y-3">
            {active.map(area => (
              <AreaCard key={area.id} area={area} allTeams={allTeams} />
            ))}
          </div>
        )}

        {/* Inactivas */}
        {inactive.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Inactivas</h2>
            <div className="space-y-2">
              {inactive.map(area => (
                <AreaCard key={area.id} area={area} allTeams={allTeams} />
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-1">
          <p><strong>Área Funcional</strong> — categoria administrativa de encaminhamento (onde o trabalho pertence).</p>
          <p><strong>Equipa</strong> — grupo operacional que executa o trabalho. Um pedido pode ter várias equipas atribuídas.</p>
          <p>As equipas aqui associadas aparecem em destaque quando se encaminha um pedido para esta área.</p>
        </div>
      </div>
    </AdminLayout>
  )
}
