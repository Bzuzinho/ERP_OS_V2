import React, { ReactNode } from 'react'
import { Link, usePage } from '@inertiajs/react'
import {
  LayoutDashboard, FileText, CheckSquare, CalendarDays,
  Users, Package, BookOpen, BarChart3, Settings,
  Bell, LogOut, Menu, X, ChevronLeft, ChevronRight, ClipboardList,
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
  { label: 'Planeamento',   href: '/planeamento', icon: ClipboardList,   group: ['/planeamento'] },
  { label: 'Pessoas',       href: '/municipes',   icon: Users,           group: ['/municipes', '/rh', '/equipas'] },
  { label: 'Recursos',      href: '/inventario',  icon: Package,         group: ['/inventario', '/manutencoes'] },
  { label: 'Documentos',    href: '/documentos',  icon: BookOpen,        group: ['/documentos', '/atas'] },
  { label: 'Relatórios',    href: '/relatorios',  icon: BarChart3,       group: ['/relatorios'] },
  { label: 'Configurações', href: '/configuracoes', icon: Settings,      group: ['/configuracoes', '/perfil'] },
]

const DIVIDERS_BEFORE = new Set(['Pedidos','Pessoas','Relatórios','Configurações','Planeamento'])

// ─── Sub-navegação ─────────────────────────────────────────────────────────
export const SUB_NAV: Record<string, { label: string; href: string }[]> = {
  '/agenda':    [{ label:'Agenda', href:'/agenda' }, { label:'Reservas', href:'/reservas' }, { label:'Espaços', href:'/espacos' }],
  '/reservas':  [{ label:'Agenda', href:'/agenda' }, { label:'Reservas', href:'/reservas' }, { label:'Espaços', href:'/espacos' }],
  '/espacos':   [{ label:'Agenda', href:'/agenda' }, { label:'Reservas', href:'/reservas' }, { label:'Espaços', href:'/espacos' }],

  '/municipes': [{ label:'Munícipes', href:'/municipes' }, { label:'Funcionários', href:'/rh' }, { label:'Equipas', href:'/equipas' }],
  '/rh':        [{ label:'Munícipes', href:'/municipes' }, { label:'Funcionários', href:'/rh' }, { label:'Equipas', href:'/equipas' }],
  '/equipas':   [{ label:'Munícipes', href:'/municipes' }, { label:'Funcionários', href:'/rh' }, { label:'Equipas', href:'/equipas' }],

  '/inventario':  [{ label:'Inventário', href:'/inventario' }, { label:'Manutenções', href:'/manutencoes' }],
  '/manutencoes': [{ label:'Inventário', href:'/inventario' }, { label:'Manutenções', href:'/manutencoes' }],

  '/documentos': [{ label:'Documentos', href:'/documentos' }, { label:'Atas', href:'/atas' }],
  '/atas':       [{ label:'Documentos', href:'/documentos' }, { label:'Atas', href:'/atas' }],

  '/planeamento':             [{ label:'Planos', href:'/planeamento' }, { label:'Agenda', href:'/planeamento/agenda' }, { label:'Requisições', href:'/planeamento/requisicoes' }, { label:'Recursos', href:'/planeamento/recursos' }],
  '/planeamento/agenda':      [{ label:'Planos', href:'/planeamento' }, { label:'Agenda', href:'/planeamento/agenda' }, { label:'Requisições', href:'/planeamento/requisicoes' }, { label:'Recursos', href:'/planeamento/recursos' }],
  '/planeamento/requisicoes': [{ label:'Planos', href:'/planeamento' }, { label:'Agenda', href:'/planeamento/agenda' }, { label:'Requisições', href:'/planeamento/requisicoes' }, { label:'Recursos', href:'/planeamento/recursos' }],
  '/planeamento/recursos':    [{ label:'Planos', href:'/planeamento' }, { label:'Agenda', href:'/planeamento/agenda' }, { label:'Requisições', href:'/planeamento/requisicoes' }, { label:'Recursos', href:'/planeamento/recursos' }],

  '/configuracoes':             [{ label:'Geral', href:'/configuracoes' }, { label:'Utilizadores', href:'/configuracoes/usuarios' }, { label:'Tipos de Pessoa', href:'/configuracoes/tipos-pessoa' }],
  '/configuracoes/usuarios':    [{ label:'Geral', href:'/configuracoes' }, { label:'Utilizadores', href:'/configuracoes/usuarios' }, { label:'Tipos de Pessoa', href:'/configuracoes/tipos-pessoa' }],
  '/configuracoes/tipos-pessoa':[{ label:'Geral', href:'/configuracoes' }, { label:'Utilizadores', href:'/configuracoes/usuarios' }, { label:'Tipos de Pessoa', href:'/configuracoes/tipos-pessoa' }],
}

export function SubNav() {
  const { url } = usePage()

  // For /planeamento sub-paths, base key is the full sub-path
  let base = '/' + (url.split('/')[1] ?? '')
  const second = url.split('/')[2]
  if (base === '/planeamento' && second) base = '/planeamento/' + second
  if (base === '/configuracoes' && second) base = '/configuracoes/' + second

  const tabs = SUB_NAV[base] ?? SUB_NAV['/' + url.split('/')[1]]
  if (!tabs) return null

  const activeTab = tabs.reduce<(typeof tabs)[0] | null>((best, t) => {
    const matches = url === t.href || url.startsWith(t.href + '/')
    if (!matches) return best
    if (!best) return t
    return t.href.length > best.href.length ? t : best
  }, null)

  return (
    <div className="flex items-center gap-1 px-6 pt-4 pb-0">
      {tabs.map(t => {
        const active = activeTab?.href === t.href
        return (
          <Link
            key={t.href}
            href={t.href}
            className={clsx(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
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

// ─── Layout principal ──────────────────────────────────────────────────────
interface Props { children: ReactNode; title?: string; showSubNav?: boolean }

export default function AdminLayout({ children, title, showSubNav = true }: Props) {
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { url, props } = usePage()
  const user = (props as any).auth?.user
  const unread = (props as any).unreadNotifications ?? 0

  function isActive(item: NavItem) {
    if (item.href === '/') return url === '/' || url === '/dashboard'
    return item.group.some(g => url === g || url.startsWith(g + '/') || url.startsWith(g + '?'))
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={clsx(
      'flex flex-col bg-slate-900 text-white h-full transition-all duration-300',
      mobile ? 'w-64' : collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={clsx(
        'flex items-center h-16 px-4 border-b border-slate-700/60 flex-shrink-0',
        collapsed && !mobile && 'justify-center px-0'
      )}>
        <span className="text-xl">&#127963;</span>
        {(!collapsed || mobile) && (
          <span className="ml-2.5 font-bold text-[15px] tracking-tight text-white">JuntaOS</span>
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
                <div className={clsx('my-2 mx-2 border-t border-slate-700/50', collapsed && !mobile && 'mx-1')}/>
              )}
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed && !mobile ? item.label : undefined}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all',
                  active
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                  collapsed && !mobile && 'justify-center px-0'
                )}
              >
                <Icon size={18} className="flex-shrink-0"/>
                {(!collapsed || mobile) && <span>{item.label}</span>}
              </Link>
            </React.Fragment>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 pt-2 border-t border-slate-700/60 flex-shrink-0">
        <Link
          href="/logout"
          method="post"
          as="button"
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13.5px] text-slate-400 hover:bg-slate-800 hover:text-white transition-all',
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
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Desktop sidebar */}
      <div className={clsx('hidden md:flex flex-col relative flex-shrink-0', collapsed ? 'w-16' : 'w-60')}>
        <SidebarContent/>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1" onClick={() => setMobileOpen(true)}>
              {mobileOpen ? <X size={22} className="text-gray-600"/> : <Menu size={22} className="text-gray-600"/>}
            </button>
            {title && <h1 className="text-[15px] font-semibold text-gray-800">{title}</h1>}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notificacoes" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={19} className="text-gray-600"/>
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
            <Link href="/perfil" className="flex items-center gap-2 hover:opacity-80 transition-opacity ml-1">
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <span className="hidden md:block text-[13.5px] font-medium text-gray-700 max-w-[120px] truncate">
                {user?.name ?? ''}
              </span>
            </Link>
          </div>
        </header>

        {/* Sub-navegação */}
        {showSubNav && <SubNav/>}

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

// This file has been extended — SUB_NAV entries for Configuracoes are patched below.
// (No action needed — AdminLayout.tsx is imported, not run at startup)
