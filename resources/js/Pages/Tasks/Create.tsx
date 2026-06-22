import React, { useState } from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'

export default function TaskCreate({ users = [], serviceAreas = [], teams = [], plans = [], inventory = [] }: any) {
  const [checklistItems, setChecklistItems] = useState<string[]>([])
  const [newItem, setNewItem] = useState('')

  const { data, setData, post, processing, errors } = useForm({
    title:               '',
    description:         '',
    priority:            'medium',
    status:              'pending',
    assigned_to:         '',
    team_id:             '',
    plan_id:             '',
    service_area_id:     '',
    due_date:            '',
    validation_status:   'nao_aplicavel',
    recurrence:          'nenhuma',
    recurrence_ends_at:  '',
    checklist:           [] as { title: string }[],
    materials:           [] as { inventory_item_id: string; quantity: number; usage_type: string }[],
  })

  function addChecklist() {
    if (!newItem.trim()) return
    const updated = [...checklistItems, newItem.trim()]
    setChecklistItems(updated)
    setData('checklist', updated.map(t => ({ title: t })))
    setNewItem('')
  }

  function removeChecklist(i: number) {
    const updated = checklistItems.filter((_, idx) => idx !== i)
    setChecklistItems(updated)
    setData('checklist', updated.map(t => ({ title: t })))
  }

  function addMaterial() {
    setData('materials', [...data.materials, { inventory_item_id: '', quantity: 1, usage_type: 'consumido' }])
  }

  function updateMaterial(i: number, field: string, value: any) {
    const updated = data.materials.map((m, idx) => idx === i ? { ...m, [field]: value } : m)
    setData('materials', updated)
  }

  function removeMaterial(i: number) {
    setData('materials', data.materials.filter((_, idx) => idx !== i))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/tarefas')
  }

  return (
    <AdminLayout title="Nova Tarefa">
      <Head title="Nova Tarefa — JuntaOS"/>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/tarefas" className="hover:text-primary-600 flex items-center gap-1"><ChevronLeft size={14}/>Tarefas</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Nova tarefa</span>
        </div>

        <form onSubmit={submit} className="space-y-5">

          {/* Main info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Informação da tarefa</h2>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Título *</label>
              <input value={data.title} onChange={e => setData('title', e.target.value)} required
                placeholder="Descreva a tarefa..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"/>
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Descrição</label>
              <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={3}
                placeholder="Detalhes adicionais..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"/>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Prioridade</label>
                <select value={data.priority} onChange={e => setData('priority', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Estado inicial</label>
                <select value={data.status} onChange={e => setData('status', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em progresso</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Data limite</label>
                <input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"/>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Responsável</label>
                <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Não atribuído</option>
                  {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Equipa</label>
                <select value={data.team_id} onChange={e => setData('team_id', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Sem equipa</option>
                  {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Área de serviço</label>
                <select value={data.service_area_id} onChange={e => setData('service_area_id', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Sem área</option>
                  {serviceAreas.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Plano operacional</label>
                <select value={data.plan_id} onChange={e => setData('plan_id', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="">Sem plano</option>
                  {plans.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Validação necessária</label>
                <select value={data.validation_status} onChange={e => setData('validation_status', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="nao_aplicavel">Não aplicável</option>
                  <option value="pendente">Sim — pendente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recorrência */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-800">Recorrência</h2>
              <p className="text-xs text-gray-400 mt-0.5">Ao concluir esta tarefa, a próxima ocorrência é criada automaticamente.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Padrão</label>
                <select value={data.recurrence} onChange={e => setData('recurrence', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option value="nenhuma">Sem recorrência</option>
                  <option value="diária">Diária</option>
                  <option value="semanal">Semanal</option>
                  <option value="quinzenal">Quinzenal</option>
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
              {data.recurrence !== 'nenhuma' && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Termina em (opcional)</label>
                  <input type="date" value={data.recurrence_ends_at}
                    onChange={e => setData('recurrence_ends_at', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"/>
                </div>
              )}
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">Checklist</h2>
            <ul className="space-y-1.5">
              {checklistItems.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"/>
                  <span className="flex-1">{item}</span>
                  <button type="button" onClick={() => removeChecklist(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={13}/>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChecklist() } }}
                placeholder="Novo item do checklist..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"/>
              <button type="button" onClick={addChecklist}
                className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 text-gray-600 transition-colors">
                <Plus size={14}/> Adicionar
              </button>
            </div>
          </div>

          {/* Materials */}
          {inventory.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Materiais</h2>
                <button type="button" onClick={addMaterial}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  <Plus size={13}/> Adicionar material
                </button>
              </div>
              {data.materials.length === 0 && (
                <p className="text-xs text-gray-400">Nenhum material adicionado. Clique em "Adicionar material" para começar.</p>
              )}
              {data.materials.map((m, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-end">
                  <select value={m.inventory_item_id} onChange={e => updateMaterial(i, 'inventory_item_id', e.target.value)}
                    className="col-span-1 text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                    <option value="">Selecionar item...</option>
                    {inventory.map((inv: any) => <option key={inv.id} value={inv.id}>{inv.name} ({inv.current_stock} {inv.unit})</option>)}
                  </select>
                  <input type="number" min="0.001" step="any" value={m.quantity}
                    onChange={e => updateMaterial(i, 'quantity', parseFloat(e.target.value))}
                    placeholder="Qtd."
                    className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400"/>
                  <div className="flex gap-2">
                    <select value={m.usage_type} onChange={e => updateMaterial(i, 'usage_type', e.target.value)}
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-primary-400">
                      <option value="consumido">Consumido</option>
                      <option value="utilizado">Utilizado</option>
                      <option value="alocado">Alocado</option>
                    </select>
                    <button type="button" onClick={() => removeMaterial(i)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button type="submit" disabled={processing}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl disabled:opacity-60 transition-colors">
              {processing ? 'A criar…' : 'Criar Tarefa'}
            </button>
            <Link href="/tarefas" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
