import React, { useState } from 'react'
import { Head, Link, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft, MessageSquare, Lock, Globe, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

const statusColors: Record<string, string> = {
  aberto: 'bg-blue-100 text-blue-700',
  em_analise: 'bg-yellow-100 text-yellow-700',
  em_progresso: 'bg-indigo-100 text-indigo-700',
  aguarda_resposta: 'bg-orange-100 text-orange-700',
  resolvido: 'bg-green-100 text-green-700',
  encerrado: 'bg-gray-100 text-gray-600',
}

export default function TicketShow({ ticket, users, serviceAreas }: any) {
  const [commentType, setCommentType] = useState<'public'|'internal'>('public')
  const commentForm = useForm({ body: '', type: 'public' })

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault()
    commentForm.setData('type', commentType)
    commentForm.post(`/pedidos/${ticket.id}/comentarios`, { onSuccess: () => commentForm.reset() })
  }

  const updateStatus = (status: string) =>
    router.patch(`/pedidos/${ticket.id}`, { status })

  return (
    <AdminLayout title={`Pedido ${ticket.reference}`}>
      <Head title={`${ticket.reference} — JuntaOS`} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Link href="/pedidos" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft size={16} /> Pedidos</Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-mono text-gray-400 mb-1">{ticket.reference}</p>
                  <h1 className="text-xl font-semibold text-gray-800">{ticket.title}</h1>
                </div>
                <span className={clsx('text-sm px-3 py-1 rounded-full font-medium', statusColors[ticket.status])}>{ticket.status?.replace('_',' ')}</span>
              </div>
              {ticket.description && <p className="text-sm text-gray-600 leading-relaxed">{ticket.description}</p>}
            </div>

            {/* Comments timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><MessageSquare size={16} /> Comunicação</h2>
              <div className="space-y-4 mb-6">
                {(ticket.comments ?? []).length === 0 && <p className="text-sm text-gray-400">Sem comentários ainda.</p>}
                {(ticket.comments ?? []).map((c: any) => (
                  <div key={c.id} className={clsx('flex gap-3', c.type === 'internal' && 'opacity-80')}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {c.user?.name?.[0] ?? '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-700">{c.user?.name ?? 'Desconhecido'}</span>
                        <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString('pt-PT')}</span>
                        {c.type === 'internal'
                          ? <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded"><Lock size={10}/> Nota interna</span>
                          : <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded"><Globe size={10}/> Público</span>}
                      </div>
                      <div className={clsx('text-sm text-gray-700 p-3 rounded-lg', c.type === 'internal' ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50')}>
                        {c.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={submitComment} className="space-y-3">
                <div className="flex gap-2 mb-2">
                  {(['public','internal'] as const).map(type => (
                    <button key={type} type="button" onClick={() => setCommentType(type)}
                      className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        commentType === type ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                      {type === 'public' ? <Globe size={12}/> : <Lock size={12}/>}
                      {type === 'public' ? 'Resposta pública' : 'Nota interna'}
                    </button>
                  ))}
                </div>
                <textarea value={commentForm.data.body} onChange={e => commentForm.setData('body', e.target.value)}
                  rows={3} placeholder={commentType === 'public' ? 'Escrever resposta ao munícipe...' : 'Nota interna (não visível no portal)...'}
                  className={clsx('w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                    commentType === 'internal' ? 'border-amber-300 bg-amber-50' : 'border-gray-300')} />
                <button type="submit" disabled={commentForm.processing || !commentForm.data.body}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors">
                  Enviar
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">Detalhes</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Estado', value: ticket.status?.replace('_',' ') },
                  { label: 'Prioridade', value: ticket.priority },
                  { label: 'Origem', value: ticket.origin },
                  { label: 'Contacto', value: ticket.contact?.name },
                  { label: 'Responsável', value: ticket.assignee?.name },
                  { label: 'Área', value: ticket.service_area?.name },
                  { label: 'Criado em', value: new Date(ticket.created_at).toLocaleDateString('pt-PT') },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-800">{value ?? '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">Alterar Estado</h3>
              <div className="space-y-2">
                {['aberto','em_analise','em_progresso','aguarda_resposta','resolvido','encerrado'].map(s => (
                  <button key={s} onClick={() => updateStatus(s)}
                    className={clsx('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      ticket.status === s ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-700')}>
                    {s.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>

            {(ticket.tasks ?? []).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">Tarefas</h3>
                <div className="space-y-2">
                  {ticket.tasks.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className={t.status === 'completed' ? 'text-green-500' : 'text-gray-300'} />
                      <span className="text-gray-700 truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
