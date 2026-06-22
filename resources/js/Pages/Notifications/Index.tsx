import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Bell, CheckCheck, Clock, Info, AlertTriangle, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

const typeIcons: Record<string, React.ElementType> = {
  info:    Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error:   AlertTriangle,
}

const typeColors: Record<string, string> = {
  info:    'text-blue-500 bg-blue-50',
  success: 'text-green-500 bg-green-50',
  warning: 'text-amber-500 bg-amber-50',
  error:   'text-red-500 bg-red-50',
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('pt-PT', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function NotificationsIndex({ notifications, unreadCount }: any) {
  const items = notifications?.data ?? []

  function markRead(id: number) {
    router.post(`/notificacoes/${id}/lida`, {}, { preserveScroll: true })
  }

  function markAllRead() {
    router.post('/notificacoes/marcar-todas', {}, { preserveScroll: true })
  }

  return (
    <AdminLayout title="Notificações">
      <Head title="Notificações — JuntaOS"/>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notificações</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">{unreadCount} por ler</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCheck size={15}/> Marcar todas como lidas
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-20 text-center text-gray-400">
            <Bell size={40} className="mx-auto mb-3 opacity-25"/>
            <p className="font-medium">Sem notificações</p>
            <p className="text-sm mt-1">Ficará a saber aqui quando houver novidades.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item: any) => {
              const n = item.notification ?? {}
              const type = n.type ?? 'info'
              const Icon = typeIcons[type] ?? Info
              const isUnread = !item.read_at

              return (
                <div
                  key={item.id}
                  className={clsx(
                    'bg-white rounded-xl border px-5 py-4 flex items-start gap-4 transition-colors',
                    isUnread ? 'border-primary-200 shadow-sm' : 'border-gray-200'
                  )}
                >
                  <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', typeColors[type] ?? 'bg-gray-100 text-gray-500')}>
                    <Icon size={18}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    {n.title && <p className={clsx('text-sm font-semibold', isUnread ? 'text-gray-900' : 'text-gray-600')}>{n.title}</p>}
                    {n.message && <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>}
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <Clock size={11}/> {formatDate(item.created_at)}
                    </p>
                  </div>
                  {isUnread && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary-500"/>
                      <button
                        onClick={() => markRead(item.id)}
                        className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                        title="Marcar como lida"
                      >
                        <CheckCheck size={15}/>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {notifications?.last_page > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            {notifications.links?.filter((l: any) => l.url).map((l: any, i: number) => (
              <Link
                key={i}
                href={l.url}
                className={clsx(
                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                  l.active
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                )}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
