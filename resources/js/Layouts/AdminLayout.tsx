import React, { ReactNode, useEffect, useRef } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import {
  LayoutDashboard, FileText, CheckSquare, CalendarDays,
  Users, Users2, Package, BookOpen, BarChart3, Settings,
  Bell, LogOut, Menu, X, ChevronLeft, ChevronRight, ClipboardList, MessageCircle,
  ChevronDown, CheckCircle, AlertCircle, User, Plus, Check, XCircle, Clock, Building2,
} from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'

// ─── Cada item do sidebar ──────────────────────────────────────────────────
interface NavItem {
  label:   string
  href:    string
  icon:    React.ElementType
  group:   string[]
}

const NAV: NavItem[] = [
  { label: 'Início',        href: '/',            icon: LayoutDashboard, group: ['/', '/dashboard'] },
  { label: 'Pedidos',       href: '/pedidos',     icon: FileText,        group: ['/pedidos'] },
  { label: 'Tarefas',       href: '/tarefas',     icon: CheckSquare,     group: ['/tarefas'] },
  { label: 'Agenda',        href: '/agenda',      icon: CalendarDays,    group: ['/agenda', '/reservas', '/espacos'] },
  { label: 'Reservas',      href: '/reservas',    icon: Building2,       group: ['/reservas', '/espacos'] },
  { label: 'Planeamento',   href: '/planeamento', icon: ClipboardList,   group: ['/planeamento'] },
  { label: 'Diretório',      href: '/pessoas',     icon: Users,           group: ['/pessoas', '/entidades', '/municipes', '/rh'] },
  { label: 'Equipas',        href: '/equipas',     icon: Users2,          group: ['/equipas'] },
  { label: 'Recursos',       href: '/inventario',  icon: Package,         group: ['/inventario'] },
  { label: 'Documentos',    href: '/documentos',  icon: BookOpen,        group: ['/documentos', '/atas'] },
  { label: 'Chat',          href: '/chat',        icon: MessageCircle,   group: ['/chat'] },
  { label: 'Relatórios',    href: '/relatorios',  icon: BarChart3,       group: ['/relatorios'] },
  { label: 'Configurações', href: '/configuracoes', icon: Settings,      group: ['/configuracoes', '/perfil', '/configuracoes/utilizadores', '/configuracoes/permissoes'] },
]

const DIVIDERS_BEFORE = new Set(['Pedidos','Diretório','Relatórios','Configurações','Planeamento','Equipas','Chat','Reservas'])

// ─── Sub-navegação ─────────────────────────────────────────────────────────
export const SUB_NAV: Record<string, { label: string; href: string }[]> = {
  '/agenda':    [{ label:'Agenda', href:'/agenda' }, { label:'Reservas', href:'/reservas' }, { label:'Espaços', href:'/espacos' }],
  '/reservas':  [{ label:'Agenda', href:'/agenda' }, { label:'Reservas', href:'/reservas' }, { label:'Espaços', href:'/espacos' }],
  '/espacos':   [{ label:'Agenda', href:'/agenda' }, { label:'Reservas', href:'/reservas' }, { label:'Espaços', href:'/espacos' }],

  '/pessoas':   [{ label:'Pessoas', href:'/pessoas' }, { label:'Entidades', href:'/entidades' }],
  '/entidades': [{ label:'Pessoas', href:'/pessoas' }, { label:'Entidades', href:'/entidades' }],
  // Legado (alias) — mantém sub-tabs de Pessoas
  '/municipes': [{ label:'Pessoas', href:'/pessoas' }, { label:'Entidades', href:'/entidades' }],
  '/rh':        [{ label:'Pessoas', href:'/pessoas' }, { label:'Entidades', href:'/entidades' }],

  '/inventario':             [{ label:'Catálogo', href:'/inventario' }, { label:'Stock', href:'/inventario/stock' }, { label:'Empréstimos', href:'/inventario/emprestimos' }, { label:'Requisições', href:'/inventario/requisicoes' }],
  '/inventario/stock':       [{ label:'Catálogo', href:'/inventario' }, { label:'Stock', href:'/inventario/stock' }, { label:'Empréstimos', href:'/inventario/emprestimos' }, { label:'Requisições', href:'/inventario/requisicoes' }],
  '/inventario/emprestimos': [{ label:'Catálogo', href:'/inventario' }, { label:'Stock', href:'/inventario/stock' }, { label:'Empréstimos', href:'/inventario/emprestimos' }, { label:'Requisições', href:'/inventario/requisicoes' }],
  '/inventario/requisicoes': [{ label:'Catálogo', href:'/inventario' }, { label:'Stock', href:'/inventario/stock' }, { label:'Empréstimos', href:'/inventario/emprestimos' }, { label:'Requisições', href:'/inventario/requisicoes' }],

  '/documentos': [{ label:'Documentos', href:'/documentos' }, { label:'Atas', href:'/atas' }],
  '/atas':       [{ label:'Documentos', href:'/documentos' }, { label:'Atas', href:'/atas' }],

  '/planeamento':             [{ label:'Planos', href:'/planeamento' }, { label:'Agenda', href:'/planeamento/agenda' }, { label:'Requisições', href:'/planeamento/requisicoes' }],
  '/planeamento/agenda':      [{ label:'Planos', href:'/planeamento' }, { label:'Agenda', href:'/planeamento/agenda' }, { label:'Requisições', href:'/planeamento/requisicoes' }],
  '/planeamento/requisicoes': [{ label:'Planos', href:'/planeamento' }, { label:'Agenda', href:'/planeamento/agenda' }, { label:'Requisições', href:'/planeamento/requisicoes' }],

  '/configuracoes':               [{ label:'Geral', href:'/configuracoes' }, { label:'Permissões', href:'/configuracoes/permissoes' }],
  '/configuracoes/perfis':        [{ label:'Geral', href:'/configuracoes' }, { label:'Permissões', href:'/configuracoes/permissoes' }],
  '/configuracoes/permissoes':    [{ label:'Geral', href:'/configuracoes' }, { label:'Permissões', href:'/configuracoes/permissoes' }],
  '/configuracoes/tipos-pessoa':  [{ label:'Geral', href:'/configuracoes' }, { label:'Permissões', href:'/configuracoes/permissoes' }],
}

export function SubNav() {
  const { url } = usePage()

  // For /planeamento sub-paths, base key is the full sub-path
  let base = '/' + (url.split('/')[1] ?? '')
  const second = url.split('/')[2]
  if (base === '/planeamento'  && second) base = '/planeamento/'  + second
  if (base === '/configuracoes' && second) base = '/configuracoes/' + second
  if (base === '/inventario'   && second) base = '/inventario/'   + second

  const tabs = SUB_NAV[base] ?? SUB_NAV['/' + url.split('/')[1]]
  if (!tabs) return null

  const activeTab = tabs.reduce<(typeof tabs)[0] | null>((best, t) => {
    const matches = url === t.href || url.startsWith(t.href + '/')
    if (!matches) return best
    if (!best) return t
    return t.href.length > best.href.length ? t : best
  }, null)

  return (
    <div className="flex items-center gap-1 px-4 md:px-6 pt-3 md:pt-4 pb-0 overflow-x-auto scrollbar-none">
      {tabs.map(t => {
        const active = activeTab?.href === t.href
        return (
          <Link
            key={t.href}
            href={t.href}
            className={clsx(
              'px-3 md:px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              active
                ? 'bg-primary-600 text-white'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            )}
          >
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}

// ─── Helper: converter VAPID public key base64url → Uint8Array ────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

// ─── Layout principal ──────────────────────────────────────────────────────
interface Props { children: ReactNode; title?: string; showSubNav?: boolean }

export default function AdminLayout({ children, title, showSubNav = true }: Props) {
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu, setUserMenu]     = useState(false)
  const [bellOpen, setBellOpen]     = useState(false)
  const [bellNotifs, setBellNotifs] = useState<any[]>([])
  const [bellLoading, setBellLoading] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const bellRef     = useRef<HTMLDivElement>(null)
  const { url, props } = usePage()
  const pathname = url.split('?')[0]
  const authUser = (props as any).auth?.user
  const user = authUser  // alias
  const nameParts = (authUser?.name ?? '').split(' ').filter(Boolean)
  const displayName = nameParts.length > 1
    ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
    : nameParts[0] ?? ''
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : (nameParts[0]?.[0] ?? 'U').toUpperCase()
  const unread = (props as any).unreadNotifications ?? 0
  const unreadMessages = (props as any).unreadMessages ?? 0
  const vapidPublicKey = (props as any).vapidPublicKey ?? ''
  const org = (props as any).organization
  const flash = (props as any).flash as { message?: string; error?: string } | undefined
  const pendingApprovals: any[] = (props as any).pendingApprovals ?? []

  // Sino dinâmico (polling a cada 20s)
  const [bellCount, setBellCount] = useState(unread)
  useEffect(() => { setBellCount(unread) }, [unread])
  useEffect(() => {
    if (!authUser) return
    const id = window.setInterval(async () => {
      try {
        const res = await fetch('/notificacoes/unread-count', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        if (res.ok) { const d = await res.json(); setBellCount(d.count ?? 0) }
      } catch {}
    }, 20000)
    return () => clearInterval(id)
  }, [authUser?.id])  // eslint-disable-line

  const totalBell = bellCount + pendingApprovals.length

  // Badge do chat dinâmico (polling a cada 15s para actualizar sem reload)
  const [chatBadge, setChatBadge] = useState(unreadMessages)
  useEffect(() => { setChatBadge(unreadMessages) }, [unreadMessages])
  useEffect(() => {
    if (!authUser) return
    const id = window.setInterval(async () => {
      try {
        const res = await fetch('/chat/global/unread', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        if (res.ok) { const d = await res.json(); setChatBadge(d.unread ?? 0) }
      } catch {}
    }, 15000)
    return () => clearInterval(id)
  }, [authUser?.id])  // eslint-disable-line

  // Estado do push: 'unknown' | 'prompt' | 'granted' | 'denied' | 'unsupported' | 'loading'
  const [pushState, setPushState] = useState<'unknown'|'prompt'|'granted'|'denied'|'unsupported'|'loading'>('unknown')
  const [pushError, setPushError] = useState<string|null>(null)
  const [pushDiag, setPushDiag] = useState<string[]>([])
  const [showDiag, setShowDiag] = useState(false)

  // Verificar suporte e estado actual ao montar
  useEffect(() => {
    if (!authUser || !vapidPublicKey) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setPushState('unsupported'); return
    }
    // iOS só suporta push em PWA (standalone mode)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    if (isIOS && !(navigator as any).standalone) {
      setPushState('unsupported'); return
    }
    const perm = Notification.permission
    if (perm === 'denied') { setPushState('denied'); return }
    // Verificar se já tem subscrição activa
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => {
        setPushState(sub ? 'granted' : 'prompt')
      })
    ).catch(() => setPushState('prompt'))
  }, [authUser?.id, vapidPublicKey])  // eslint-disable-line

  // Em browsers não-iOS, tentar subscrever automaticamente se permissão já foi dada
  useEffect(() => {
    if (pushState !== 'prompt' || !vapidPublicKey) return
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    if (isIOS) return
    if (Notification.permission === 'granted') doSubscribePush()
  }, [pushState, vapidPublicKey])  // eslint-disable-line

  function doSubscribePush() {
    const log = (msg: string) => {
      console.log('[Push]', msg)
      setPushDiag(d => [...d.slice(-9), msg])
    }

    const isIOS2 = /iPad|iPhone|iPod/.test(navigator.userAgent)
    log(`start — iOS:${isIOS2} standalone:${!!(navigator as any).standalone} SW:${'serviceWorker' in navigator} PM:${'PushManager' in window} Notif:${'Notification' in window}`)

    if (!vapidPublicKey || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      log('abort: falta vapid/SW/PM')
      return
    }
    setPushState('loading')
    setPushError(null)

    // Chamar requestPermission directamente (sem await) para garantir contexto de gesto no iOS
    Notification.requestPermission().then(permission => {
      log(`permission: ${permission}`)
      if (permission !== 'granted') {
        setPushState(permission === 'denied' ? 'denied' : 'prompt')
        return
      }

      log('aguardar SW ready…')
      navigator.serviceWorker.ready.then(reg => {
        log('SW ready, getSubscription…')
        return reg.pushManager.getSubscription().then(sub => {
          if (sub) { log('sub existente'); return sub }
          log('subscribe novo…')
          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          })
        })
      }).then(sub => {
        if (!sub) throw new Error('subscribe retornou null')
        log(`sub ok: ${sub.endpoint.slice(0, 40)}…`)
        const key  = sub.getKey('p256dh')
        const auth = sub.getKey('auth')
        const csrf = (document.querySelector('meta[name=csrf-token]') as any)?.content ?? ''
        log('POST /chat/push/subscribe…')
        return fetch('/chat/push/subscribe', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
          body: JSON.stringify({
            endpoint:   sub.endpoint,
            p256dh_key: key  ? btoa(String.fromCharCode(...new Uint8Array(key)))  : '',
            auth_key:   auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : '',
          }),
        })
      }).then(res => {
        log(`servidor: ${res.status}`)
        if (!res.ok) throw new Error(`Servidor: ${res.status}`)
        log('✓ subscrito com sucesso')
        setPushState('granted')
      }).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        log(`ERRO subscribe: ${msg}`)
        setPushError(msg)
        setPushState('prompt')
      })
    }).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err)
      log(`ERRO requestPermission: ${msg}`)
      setPushError(msg)
      setPushState('prompt')
    })
  }

  // Carregar notificações reais quando o sino abre
  async function openBell() {
    setBellOpen(o => {
      if (o) return false // fechar
      return true
    })
    setBellLoading(true)
    try {
      const res = await fetch('/notificacoes/recentes', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      if (res.ok) setBellNotifs(await res.json())
    } catch {}
    setBellLoading(false)
  }

  async function dismissNotif(id: number) {
    const csrf = (document.querySelector('meta[name=csrf-token]') as any)?.content ?? ''
    await fetch(`/notificacoes/${id}/lida-json`, { method: 'POST', headers: { 'X-CSRF-TOKEN': csrf } })
    setBellNotifs(prev => prev.filter(n => n.id !== id))
    setBellCount(prev => Math.max(0, prev - 1))
  }

  // Fechar menus ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenu(false)
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Sub-nav items por secção
  const subItems = (() => {
    const base = '/' + pathname.split('/').filter(Boolean)[0]
    const second = pathname.split('/').filter(Boolean)[1]
    const SUB_NAV: Record<string, { label: string; href: string }[]> = {
      '/configuracoes': [
        { label: 'Geral',        href: '/configuracoes' },
        { label: 'Permissões',   href: '/configuracoes/permissoes' },
      ],
      '/planeamento': [
        { label: 'Planos',     href: '/planeamento' },
        { label: 'Agenda',     href: '/planeamento/agenda' },
        { label: 'Requisições', href: '/planeamento/requisicoes' },
      ],
      '/inventario': [
        { label: 'Catálogo',   href: '/inventario' },
        { label: 'Stock',      href: '/inventario/stock' },
        { label: 'Empréstimos', href: '/inventario/emprestimos' },
        { label: 'Requisições', href: '/inventario/requisicoes' },
      ],
    }
    let key = base
    if (base === '/inventario' && second) key = '/inventario'
    return SUB_NAV[key] ?? []
  })()

  // Aplicar CSS variables dinamicamente (actualização em tempo real sem reload do Blade)
  useEffect(() => {
    const primary = org?.primary_color   ?? '#4f46e5'
    const accent  = org?.accent_color    ?? '#7c3aed'

    function hexRgb(hex: string) {
      const h = hex.replace('#','')
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)] as const
    }
    function shades(hex: string) {
      const [r,g,b] = hexRgb(hex)
      const lt = (f: number) => `rgb(${Math.round(r+(255-r)*f)},${Math.round(g+(255-g)*f)},${Math.round(b+(255-b)*f)})`
      const dk = (f: number) => `rgb(${Math.round(r*(1-f))},${Math.round(g*(1-f))},${Math.round(b*(1-f))})`
      return {'50':lt(.95),'100':lt(.88),'200':lt(.75),'300':lt(.55),'400':lt(.30),
              '500':lt(.10),'600':`rgb(${r},${g},${b})`,'700':dk(.15),'800':dk(.30),'900':dk(.45)}
    }
    const root = document.documentElement
    Object.entries(shades(primary)).forEach(([k,v]) => root.style.setProperty(`--p-${k}`,v))
    root.style.setProperty('--color-accent', accent)
    // Outras variáveis de tema
    const vars: Record<string,string> = {
      '--sidebar-bg':    org?.sidebar_color   ?? '#0f172a',
      '--header-bg':     org?.header_color    ?? '#ffffff',
      '--page-bg':       org?.page_bg_color   ?? '#f9fafb',
      '--card-bg':       org?.card_bg_color   ?? '#ffffff',
      '--heading-color': org?.heading_color   ?? '#111827',
      '--text-color':    org?.text_color      ?? '#374151',
      '--menu-text':     org?.menu_text_color ?? '#94a3b8',
    }
    Object.entries(vars).forEach(([k,v]) => root.style.setProperty(k,v))
  }, [org?.primary_color, org?.accent_color, org?.sidebar_color, org?.header_color,
      org?.page_bg_color, org?.card_bg_color, org?.heading_color, org?.text_color, org?.menu_text_color])

  // Atualizar favicon dinamicamente quando o logo secundário mudar
  useEffect(() => {
    if (org?.logo_secondary) {
      let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = org.logo_secondary
    }
  }, [org?.logo_secondary])

  function isActive(item: NavItem) {
    if (item.href === '/') return url === '/' || url === '/dashboard'
    return item.group.some(g => url === g || url.startsWith(g + '/') || url.startsWith(g + '?'))
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
      className={clsx(
        'flex flex-col h-full transition-all duration-300 text-white',
        mobile ? 'w-64' : collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-2.5 px-4 border-b border-white/10 flex-shrink-0',
        collapsed && !mobile ? 'h-16 justify-center px-0' : 'h-[68px]'
      )}>
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          {org?.logo
            ? <img src={org.logo} alt="logo" className="w-8 h-8 object-contain rounded"/>
            : <span className="text-xl leading-none">&#127963;</span>}
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="font-bold text-[14px] tracking-tight text-white leading-tight">JuntaOS</p>
            {org?.name && (
              <p className="text-[10.5px] leading-tight truncate max-w-[160px]" style={{ color: 'var(--menu-text)' }}>{org.name}</p>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV.map(item => {
          const Icon   = item.icon
          const active = isActive(item)
          const div    = DIVIDERS_BEFORE.has(item.label)

          return (
            <React.Fragment key={item.href}>
              {div && (
                <div className={clsx('my-2 mx-2 border-t border-white/10', collapsed && !mobile && 'mx-1')}/>
              )}
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed && !mobile ? item.label : undefined}
                style={active ? {} : { color: 'var(--menu-text)' }}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all',
                  active
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'hover:bg-white/10 hover:!text-white',
                  collapsed && !mobile && 'justify-center px-0'
                )}
              >
                <div className="relative flex-shrink-0">
                  <Icon size={18}/>
                  {item.label === 'Chat' && chatBadge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {chatBadge > 9 ? '9+' : chatBadge}
                    </span>
                  )}
                </div>
                {(!collapsed || mobile) && (
                  <span className="flex-1 flex items-center justify-between">
                    {item.label}

                    {item.label === 'Chat' && chatBadge > 0 && (
                      <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">
                        {chatBadge}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            </React.Fragment>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 pt-2 border-t border-white/10 flex-shrink-0">
        <Link
          href="/logout"
          method="post"
          as="button"
          style={{ color: 'var(--menu-text)' }}
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13.5px] hover:bg-white/10 hover:!text-white transition-all',
            collapsed && !mobile && 'justify-center px-0'
          )}
        >
          <LogOut size={18} className="flex-shrink-0"/>
          {(!collapsed || mobile) && <span>Sair</span>}
        </Link>
      </div>
    </aside>
  )

  return (
    <div className="flex overflow-hidden safe-top safe-bottom" style={{ backgroundColor: 'var(--page-bg)', height: '100dvh' }}>

      {/* Desktop sidebar */}
      <div className={clsx('hidden md:flex flex-col relative flex-shrink-0', collapsed ? 'w-16' : 'w-60')}>
        <SidebarContent/>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0"><SidebarContent mobile/></div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)}/>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden" style={{ maxWidth: '100vw' }}>
        {/* Top bar */}
        <header
          className="h-14 border-b border-black/10 flex items-center justify-between px-4 flex-shrink-0 min-w-0 max-w-full safe-right"
          style={{ backgroundColor: 'var(--header-bg)' }}
        >
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1" onClick={() => setMobileOpen(true)}>
              {mobileOpen ? <X size={22} className="text-gray-600"/> : <Menu size={22} className="text-gray-600"/>}
            </button>
            {title && <h1 className="text-[15px] font-semibold" style={{ color: 'var(--heading-color)' }}>{title}</h1>}
          </div>
          <div className="flex items-center gap-2">
            {/* Botão de activação de push + painel de diagnóstico */}
            {(pushState === 'prompt' || pushState === 'loading') && vapidPublicKey && (
              <div className="relative">
                <button
                  onClick={pushState === 'loading' ? undefined : doSubscribePush}
                  onLongPress={undefined}
                  disabled={pushState === 'loading'}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    pushState === 'loading'
                      ? 'bg-indigo-100 border-indigo-200 text-indigo-400 cursor-wait'
                      : pushError
                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                      : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                  }`}
                >
                  <Bell size={13}/>
                  <span className="hidden sm:inline">
                    {pushState === 'loading' ? 'A ativar…' : pushError ? 'Tentar novamente' : 'Ativar notif.'}
                  </span>
                </button>
                {/* Botão diagnóstico — toque longo ou duplo toque para ver log */}
                <button
                  onClick={() => setShowDiag(d => !d)}
                  className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-gray-300 text-gray-600 text-[9px] flex items-center justify-center leading-none"
                  title="Ver diagnóstico">?</button>
                {showDiag && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-72 bg-gray-900 text-green-300 text-[10px] font-mono rounded-lg p-2 shadow-xl overflow-y-auto max-h-52">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-400 font-bold">PUSH DIAG</span>
                      <button onClick={() => setShowDiag(false)} className="text-gray-500 hover:text-white">✕</button>
                    </div>
                    <div className="text-yellow-300 mb-1">estado: {pushState}</div>
                    {pushError && <div className="text-red-400 mb-1 break-all">erro: {pushError}</div>}
                    {pushDiag.length === 0 && <div className="text-gray-500">Sem passos ainda. Prime "Ativar notif." primeiro.</div>}
                    {pushDiag.map((l, i) => <div key={i} className="break-all border-b border-gray-800 pb-0.5 mb-0.5">{l}</div>)}
                  </div>
                )}
              </div>
            )}
            {/* Sino ─ dropdown de notificações e aprovações */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={openBell}
                className="relative p-2 rounded-lg hover:bg-black/5 transition-colors">
                <Bell size={19} className="text-gray-600"/>
                {totalBell > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {totalBell}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800">Notificações</h3>
                    {totalBell > 0 && (
                      <button
                        onClick={async () => {
                          const csrf = (document.querySelector('meta[name=csrf-token]') as any)?.content ?? ''
                          try {
                            await fetch('/notificacoes/marcar-todas', {
                              method: 'POST',
                              credentials: 'same-origin',
                              headers: { 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' },
                            })
                          } catch {}
                          setBellNotifs([])
                          setBellCount(0)
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        Limpar todas
                      </button>
                    )}
                  </div>

                  <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                    {/* Aprovações de RH pendentes */}
                    {pendingApprovals.length > 0 && (
                      <div>
                        <div className="px-4 py-1.5 bg-amber-50">
                          <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1">
                            <Clock size={10}/> Aprovações RH
                          </p>
                        </div>
                        {pendingApprovals.map((a: any) => (
                          <div key={a.id} className="px-4 py-3 hover:bg-gray-50">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{a.person}</p>
                                <p className="text-xs text-gray-500 truncate">
                                  {a.type.replace(/_/g, ' ')}{a.days ? ` · ${a.days} dias` : ''} · {a.start_date} → {a.end_date}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => { router.patch(`/ausencias/${a.id}/aprovar`, {}, { preserveScroll: true }); setBellOpen(false) }}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
                                <Check size={11}/> Aprovar
                              </button>
                              <button onClick={() => { router.patch(`/ausencias/${a.id}/rejeitar`, {}, { preserveScroll: true }); setBellOpen(false) }}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">
                                <XCircle size={11}/> Rejeitar
                              </button>
                              <Link href={`/pessoas/${a.contact_id}`} onClick={() => setBellOpen(false)}
                                className="px-2 py-1 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                                Ver
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Notificações gerais com conteúdo real */}
                    {bellLoading && (
                      <div className="px-4 py-4 text-center text-xs text-gray-400">A carregar…</div>
                    )}
                    {!bellLoading && bellNotifs.length > 0 && bellNotifs.map((n: any) => (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 group">
                        <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold
                          ${n.type === 'chat' ? 'bg-indigo-500' : n.type === 'tarefa' ? 'bg-amber-500' : 'bg-gray-400'}`}>
                          {n.type === 'chat' ? '💬' : n.type === 'tarefa' ? '✓' : '•'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{n.title}</p>
                          <p className="text-xs text-gray-500 truncate">{n.message}</p>
                          <p className="text-[10px] text-gray-300 mt-0.5">{n.created_at}</p>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {n.action_url && (
                            <Link href={n.action_url} onClick={() => { dismissNotif(n.id); setBellOpen(false) }}
                              className="px-2 py-0.5 text-[10px] font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100">
                              Abrir
                            </Link>
                          )}
                          <button onClick={() => dismissNotif(n.id)}
                            className="px-2 py-0.5 text-[10px] text-gray-400 bg-gray-50 rounded hover:bg-gray-100">
                            Limpar
                          </button>
                        </div>
                      </div>
                    ))}

                    {!bellLoading && totalBell === 0 && bellNotifs.length === 0 && pendingApprovals.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-gray-400">
                        Sem notificações pendentes.
                      </div>
                    )}

                    {bellNotifs.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-50">
                        <Link href="/notificacoes" onClick={() => setBellOpen(false)}
                          className="text-xs text-primary-600 hover:underline">
                          Ver todas →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
              >
                {authUser?.contact_avatar_url ? (
                  <img src={authUser.contact_avatar_url} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: authUser?.avatar_color ?? '#6366f1' }}>
                    {initials}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown size={14} className="text-gray-400 hidden sm:block"/>
              </button>

              {userMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <Link href="/perfil"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setUserMenu(false)}>
                    <User size={15}/> O meu perfil
                  </Link>
                  <Link href="/configuracoes"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setUserMenu(false)}>
                    <Settings size={15}/> Configurações
                  </Link>
                  <hr className="my-1 border-gray-100"/>
                  <Link href="/logout" method="post" as="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={15}/> Sair
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Sub-navigation */}
        {showSubNav && subItems.length > 0 && (
          <div className="h-10 border-b border-gray-200 flex items-center px-4 gap-1 flex-shrink-0 bg-white overflow-x-auto">
            {subItems.map(si => {
              const isActive = pathname === si.href || pathname.startsWith(si.href + '/')
              return (
                <Link key={si.href} href={si.href}
                  className={clsx(
                    'px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  )}>
                  {si.label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Flash message */}
        {flash?.message && (
          <div className="mx-4 mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-700">
            <CheckCircle size={15} className="flex-shrink-0"/>
            {flash.message}
          </div>
        )}
        {flash?.error && (
          <div className="mx-4 mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
            <AlertCircle size={15} className="flex-shrink-0"/>
            {flash.error}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
