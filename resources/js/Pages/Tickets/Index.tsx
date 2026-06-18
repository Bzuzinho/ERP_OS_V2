import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Plus, Search, FileText, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const statusColors: Record<string, string> = {
  aberto: 'bg-blue-100 text-blue-700',
  em_analise: 'bg-yellow-100 text-yellow-700',
  em_progresso: 'bg-indigo-100 text-indigo-700',
  aguarda_resposta: 'bg-orange-100 text-orange-700',
  resolvido: 'bg-green-100 text-green-700',
  encerrado: 'bg-gray-100 text-gray-600',
}

const priorityColors: Record<string, string> = {
  baixa: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-600',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
}

export default function TicketsIndex({ tickets, filters, serviceAreas, stats }: any) {
  const [search, setSearch] = useState(filters?.search ?? '')

  const applyFilter = (key: string, value: string) =>
    router.get('/pedidos', { ...filters, [key]: value || undefined }, { preserveState: true })

  return (
    <AdminLayout title="Pedidos">
      <Head title="Pedidos — JuntaOS" />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats?.total ?? 0, color: 'text-gray-700' },
            { label: 'Abertos', value: stats?.aberto ?? 0, color: 'text-blue-600' },
            { label: 'Em progresso', value: stats?.em_progresso ?? 0, color: 'text-indigo-600' },
            { label: 'Resolvidos', value: stats?.resolvido ?? 0, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={clsx('text-2xl font-bold', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={e => { e.preventDefault(); applyFilter('search', search) }} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </form>
          <div className="flex gap-2 flex-wrap">
            <select value={filters?.status ?? ''} onChange={e => applyFilter('status', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todos os estados</option>
              {['aberto','em_analise','em_progresso','aguarda_resposta','resolvido','encerrado'].map(s => (
                <option key={s} value={s}>{s.replace('_',' ')}</option>
              ))}
            </select>
            <select value={filters?.priority ?? ''} onChange={e => applyFilter('priority', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todas prioridades</option>
              {['baixa','normal','alta','urgente'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <Link href="/pedidos/novo" className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus size={16} /> Novo pedido
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {(tickets?.data ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Sem pedidos encontrados.</p>
              <Link href="/pedidos/novo" className="mt-4 text-sm text-primary-600 hover:underline">Criar primeiro pedido</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Referência','Título','Estado','Prioridade','Área','Responsável','Data',''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(tickets?.data ?? []).map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.reference}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{t.title}</td>
                    <td className="px-4 py-3"><span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[t.status])}>{t.status?.replace('_',' ')}</span></td>
                    <td className="px-4 py-3"><span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', priorityColors[t.priority])}>{t.priority}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{t.service_area?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{t.assignee?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(t.created_at).toLocaleDateString('pt-PT')}</td>
                    <td className="px-4 py-3"><Link href={`/pedidos/${t.id}`} className="text-gray-400 hover:text-primary-600"><ChevronRight size={16} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tickets?.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Página {tickets.current_page} de {tickets.last_page}</p>
              <div className="flex gap-2">
                {tickets.prev_page_url && <Link href={tickets.prev_page_url} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Anterior</Link>}
                {tickets.next_page_url && <Link href={tickets.next_page_url} className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Próxima</Link>}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
