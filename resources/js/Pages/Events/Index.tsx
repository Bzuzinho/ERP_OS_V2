import React, { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, CalendarDays, Trash2 } from 'lucide-react'
import clsx from 'clsx'

const typeColors: Record<string, string> = {
  interno: 'bg-gray-100 text-gray-700',
  público: 'bg-green-100 text-green-700',
  reunião: 'bg-purple-100 text-purple-700',
  reserva: 'bg-blue-100 text-blue-700',
  planeamento: 'bg-orange-100 text-orange-700',
}

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function EventsIndex({ events, spaces }: any) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [showForm, setShowForm] = useState(false)

  const { data, setData, post, processing, reset } = useForm({
    title: '', description: '', starts_at: '', ends_at: '',
    all_day: false, type: 'interno', visibility: 'interno',
    space_id: '', location: '', color: '#0284c7',
  })

  const navigate = (dir: number) => {
    let m = month + dir, y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }
    setMonth(m); setYear(y)
    router.get('/agenda', { month: m, year: y }, { preserveState: true })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/agenda', { onSuccess: () => { reset(); setShowForm(false) } })
  }

  // Build calendar grid
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDay   = new Date(year, month - 1, 1).getDay()
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1
    return day >= 1 && day <= daysInMonth ? day : null
  })

  const eventsByDay: Record<number, any[]> = {}
  ;(events ?? []).forEach((e: any) => {
    const d = new Date(e.starts_at).getDate()
    if (!eventsByDay[d]) eventsByDay[d] = []
    eventsByDay[d].push(e)
  })

  return (
    <AdminLayout title="Agenda">
      <Head title="Agenda — JuntaOS" />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">‹</button>
            <h2 className="text-lg font-semibold text-gray-800 min-w-[160px] text-center">{MONTHS[month-1]} {year}</h2>
            <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">›</button>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Novo evento
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Criar Evento</h3>
            <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Início *</label>
                <input type="datetime-local" value={data.starts_at} onChange={e => setData('starts_at', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fim *</label>
                <input type="datetime-local" value={data.ends_at} onChange={e => setData('ends_at', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={data.type} onChange={e => setData('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {['interno','público','reunião','reserva','planeamento'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibilidade</label>
                <select value={data.visibility} onChange={e => setData('visibility', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="interno">Interno</option><option value="público">Público</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Espaço</label>
                <select value={data.space_id} onChange={e => setData('space_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Sem espaço</option>
                  {spaces?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                <input type="color" value={data.color} onChange={e => setData('color', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg px-2 cursor-pointer" />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={processing}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors">
                  {processing ? 'A criar...' : 'Criar'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
            {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => (
              <div key={i} className={clsx('min-h-[90px] p-1.5 border-b border-r border-gray-50',
                day === now.getDate() && month === now.getMonth()+1 && year === now.getFullYear()
                  ? 'bg-primary-50' : day ? 'hover:bg-gray-50' : 'bg-gray-25 opacity-40')}>
                {day && (
                  <>
                    <p className={clsx('text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
                      day === now.getDate() && month === now.getMonth()+1 && year === now.getFullYear()
                        ? 'bg-primary-600 text-white' : 'text-gray-700')}>{day}</p>
                    <div className="space-y-0.5">
                      {(eventsByDay[day] ?? []).slice(0,3).map((e: any) => (
                        <div key={e.id} className="text-xs px-1.5 py-0.5 rounded truncate text-white"
                          style={{ backgroundColor: e.color ?? '#0284c7' }}>{e.title}</div>
                      ))}
                      {(eventsByDay[day]?.length ?? 0) > 3 && (
                        <p className="text-xs text-gray-400 px-1">+{eventsByDay[day].length - 3}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Event list */}
        {(events ?? []).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Eventos do mês</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {(events ?? []).map((e: any) => (
                <div key={e.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.color ?? '#0284c7' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{e.title}</p>
                    <p className="text-xs text-gray-400">{new Date(e.starts_at).toLocaleString('pt-PT',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</p>
                  </div>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full', typeColors[e.type])}>{e.type}</span>
                  <button onClick={() => router.delete(`/agenda/${e.id}`)} className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
