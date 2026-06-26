import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import clsx from 'clsx'
import {
  Send, Paperclip, Mic, MicOff, X, Plus, Users, Search,
  MoreVertical, ChevronLeft, Check, CheckCheck, Image as ImageIcon,
  FileText, Download, Play, Pause, Smile, Reply, Trash2,
  ClipboardList, Ticket, Volume2, StopCircle, UserPlus,
} from 'lucide-react'
import axios from 'axios'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Attachment {
  id: number; original_name: string; mime_type: string;
  size: number; url: string; duration?: number; width?: number; height?: number;
}
interface Msg {
  id: number; conversation_id: number; user_id: number;
  body: string | null; type: string; created_at: string; is_edited: boolean;
  parent_message_id: number | null; deleted_at: string | null;
  user: { id: number; name: string; avatar?: string };
  parent?: { id: number; body: string | null; user: { name: string } };
  attachments: Attachment[];
  linked_task?: { id: number; title: string } | null;
  linked_ticket?: { id: number; title: string; reference: string } | null;
}
interface Participant { id: number; name: string; avatar?: string }
interface Conv {
  id: number; type: 'direct' | 'group'; name: string; avatar_color: string;
  participants: Participant[]; others: Participant[];
  latest_message?: { body: string; type: string; user_name: string; created_at: string } | null;
  unread_count: number; last_message_at: string | null; is_observer?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function avatar(name: string, color = '#6366f1', size = 36) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div style={{ width: size, height: size, background: color, flexShrink: 0, fontSize: size * 0.38 }}
      className="rounded-full flex items-center justify-center text-white font-semibold">
      {initials}
    </div>
  )
}

function timeStr(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 86400 && d.getDate() === now.getDate())
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800)
    return d.toLocaleDateString('pt-PT', { weekday: 'short' })
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── Audio Player ──────────────────────────────────────────────────────────────
function AudioPlayer({ url, duration }: { url: string; duration?: number }) {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState(duration ?? 0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.ontimeupdate = () => setCurrent(Math.floor(a.currentTime))
    a.onloadedmetadata = () => setTotal(Math.floor(a.duration))
    a.onended = () => { setPlaying(false); setCurrent(0) }
  }, [])

  function toggle() {
    const a = audioRef.current!
    if (playing) { a.pause(); setPlaying(false) }
    else { a.play(); setPlaying(true) }
  }

  const pct = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      <audio ref={audioRef} src={url} preload="metadata"/>
      <button onClick={toggle} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 hover:bg-white/30">
        {playing ? <Pause size={14}/> : <Play size={14}/>}
      </button>
      <div className="flex-1">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            if (audioRef.current) audioRef.current.currentTime = pct * total
          }}>
          <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${pct}%` }}/>
        </div>
        <span className="text-[10px] text-white/70 mt-0.5 block">{formatDuration(current)} / {formatDuration(total)}</span>
      </div>
    </div>
  )
}

// ─── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({
  msg, isMine, showName, onReply, onDelete, onCreateTask, onCreateTicket, othersReadAt, isAdmin
}: {
  msg: Msg; isMine: boolean; showName: boolean; othersReadAt: string | null; isAdmin: boolean;
  onReply: (m: Msg) => void; onDelete: (m: Msg) => void;
  onCreateTask: (m: Msg) => void; onCreateTicket: (m: Msg) => void;
}) {
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu) return
    const close = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menu])

  if (msg.type === 'system') {
    return (
      <div className="flex justify-center my-1">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msg.body}</span>
      </div>
    )
  }

  const isDeleted = !!msg.deleted_at

  return (
    <div className={clsx('flex items-end gap-1.5 group', isMine ? 'flex-row-reverse' : 'flex-row')}>
      {!isMine && (
        <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-0.5">
          {msg.user.name[0].toUpperCase()}
        </div>
      )}

      <div className={clsx('max-w-[72%] relative', isMine ? 'items-end' : 'items-start', 'flex flex-col')}>
        {showName && !isMine && (
          <span className="text-[11px] font-semibold text-indigo-600 mb-0.5 ml-1">{msg.user.name}</span>
        )}

        {/* Reply preview */}
        {msg.parent && (
          <div className={clsx(
            'text-xs px-2 py-1 rounded-t-xl border-l-2 border-indigo-400 mb-0.5 max-w-full truncate',
            isMine ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
          )}>
            <span className="font-semibold">{msg.parent.user.name}: </span>
            {msg.parent.body ?? '📎 Anexo'}
          </div>
        )}

        <div className={clsx(
          'relative px-3 py-2 rounded-2xl shadow-sm',
          isMine
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100',
          isDeleted && 'opacity-60 italic'
        )}>
          {isDeleted ? (
            <span className="text-sm">🗑 Mensagem apagada</span>
          ) : (
            <>
              {/* Attachments */}
              {msg.attachments.map(att => (
                <div key={att.id} className="mb-1.5">
                  {att.mime_type.startsWith('image/') ? (
                    <a href={att.url} target="_blank" rel="noopener noreferrer">
                      <img src={att.url} alt={att.original_name}
                        className="rounded-xl max-w-[240px] max-h-[300px] object-cover cursor-zoom-in"/>
                    </a>
                  ) : att.mime_type.startsWith('audio/') ? (
                    <div className={clsx('rounded-xl px-3 py-2', isMine ? 'bg-indigo-700' : 'bg-gray-100')}>
                      <AudioPlayer url={att.url} duration={att.duration}/>
                    </div>
                  ) : (
                    <a href={att.url} download={att.original_name}
                      className={clsx(
                        'flex items-center gap-2 rounded-xl px-3 py-2 text-sm',
                        isMine ? 'bg-indigo-700 text-white' : 'bg-gray-100 text-gray-700'
                      )}>
                      <FileText size={16} className="flex-shrink-0"/>
                      <div className="min-w-0">
                        <div className="truncate max-w-[160px] font-medium">{att.original_name}</div>
                        <div className="text-xs opacity-70">{Math.round(att.size / 1024)} KB</div>
                      </div>
                      <Download size={14} className="flex-shrink-0 ml-auto"/>
                    </a>
                  )}
                </div>
              ))}

              {/* Text body */}
              {msg.body && (
                <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
              )}

              {/* Linked actions */}
              {msg.linked_task && (
                <a href={`/tarefas/${msg.linked_task.id}`}
                  className={clsx('flex items-center gap-1.5 text-xs mt-1.5 px-2 py-1 rounded-lg',
                    isMine ? 'bg-indigo-700/60 text-indigo-100' : 'bg-indigo-50 text-indigo-700')}>
                  <ClipboardList size={11}/> Tarefa: {msg.linked_task.title}
                </a>
              )}
              {msg.linked_ticket && (
                <a href={`/pedidos/${msg.linked_ticket.id}`}
                  className={clsx('flex items-center gap-1.5 text-xs mt-1.5 px-2 py-1 rounded-lg',
                    isMine ? 'bg-indigo-700/60 text-indigo-100' : 'bg-amber-50 text-amber-700')}>
                  <Ticket size={11}/> {msg.linked_ticket.reference}: {msg.linked_ticket.title}
                </a>
              )}
            </>
          )}

          {/* Timestamp + read receipt */}
          <div className={clsx('text-[10px] mt-0.5 text-right flex items-center justify-end gap-1',
            isMine ? 'text-indigo-200' : 'text-gray-400')}>
            {msg.is_edited && <span>editado</span>}
            {timeStr(msg.created_at)}
            {isMine && (() => {
              const isRead = othersReadAt
                ? new Date(msg.created_at) <= new Date(othersReadAt)
                : false
              return (
                <CheckCheck
                  size={11}
                  className={isRead ? 'text-sky-300' : 'text-indigo-300/60'}
                  title={isRead ? 'Visto' : 'Enviado'}
                />
              )
            })()}
          </div>
        </div>

        {/* Context menu button */}
        {!isDeleted && (
          <div className={clsx(
            'absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity',
            isMine ? '-left-7' : '-right-7'
          )}>
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenu(!menu)}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shadow-sm">
                <MoreVertical size={12} className="text-gray-500"/>
              </button>
              {menu && (
                <div className={clsx(
                  'absolute z-50 top-7 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px]',
                  isMine ? 'right-0' : 'left-0'
                )}>
                  <button onClick={() => { onReply(msg); setMenu(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Reply size={14}/> Responder
                  </button>
                  {msg.body && (
                    <>
                      <button onClick={() => { onCreateTask(msg); setMenu(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <ClipboardList size={14}/> Criar tarefa
                      </button>
                      <button onClick={() => { onCreateTicket(msg); setMenu(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Ticket size={14}/> Criar pedido
                      </button>
                    </>
                  )}
                  {(isMine || isAdmin) && (
                    <button onClick={() => { onDelete(msg); setMenu(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 size={14}/> Apagar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── New Conversation Modal ────────────────────────────────────────────────────
function NewConvModal({ users, onClose }: { users: Participant[]; onClose: () => void }) {
  const [type, setType] = useState<'direct' | 'group'>('direct')
  const [selected, setSelected] = useState<number[]>([])
  const [groupName, setGroupName] = useState('')
  const [search, setSearch] = useState('')

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))

  function toggle(id: number) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function submit() {
    if (selected.length === 0) return
    router.post('/chat', {
      type,
      user_ids: selected,
      name: type === 'group' ? groupName : undefined,
    }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Nova conversa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            {(['direct', 'group'] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className={clsx('flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
                  type === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                {t === 'direct' ? 'Direto' : 'Grupo'}
              </button>
            ))}
          </div>

          {type === 'group' && (
            <input value={groupName} onChange={e => setGroupName(e.target.value)}
              placeholder="Nome do grupo..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          )}

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar utilizador..."
              className="w-full pl-8 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1">
            {filtered.map(u => (
              <button key={u.id} onClick={() => toggle(u.id)}
                className={clsx('flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-colors',
                  selected.includes(u.id) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700')}>
                <div className="w-7 h-7 rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold">
                  {u.name[0].toUpperCase()}
                </div>
                <span className="flex-1 text-left">{u.name}</span>
                {selected.includes(u.id) && <Check size={14} className="text-indigo-600"/>}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5">
          <button onClick={submit} disabled={selected.length === 0}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
            {type === 'direct' ? 'Iniciar conversa' : `Criar grupo (${selected.length} membros)`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Create Task/Ticket Modal ──────────────────────────────────────────────────
function ActionModal({
  type, message, users, onClose
}: {
  type: 'task' | 'ticket'; message: Msg; users: Participant[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState(message.body?.slice(0, 100) ?? '')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<{ id: number; ref?: string } | null>(null)

  async function submit() {
    setLoading(true)
    try {
      const url = `/chat/${message.conversation_id}/messages/${message.id}/${type === 'task' ? 'task' : 'ticket'}`
      const res = await axios.post(url, {
        title, priority,
        ...(type === 'task' ? { due_date: dueDate, assigned_to: assignedTo || undefined } : {}),
      })
      setDone({ id: res.data[type === 'task' ? 'task_id' : 'ticket_id'], ref: res.data.ticket?.reference })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            {type === 'task' ? '📋 Criar tarefa' : '🎫 Criar pedido'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
        </div>

        {done ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check size={24} className="text-green-600"/>
            </div>
            <p className="font-medium text-gray-800">
              {type === 'task' ? 'Tarefa criada!' : `Pedido ${done.ref} criado!`}
            </p>
            <div className="flex gap-2">
              <a href={type === 'task' ? `/tarefas/${done.id}` : `/pedidos/${done.id}`}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm text-center font-medium">
                Ver {type === 'task' ? 'tarefa' : 'pedido'}
              </a>
              <button onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div className="bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-600 italic line-clamp-2">
              "{message.body}"
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Título *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Prioridade</label>
                <select value={priority} onChange={e => setPriority(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              {type === 'task' && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Data limite</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              )}
            </div>
            {type === 'task' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Atribuir a</label>
                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Não atribuído</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={submit} disabled={!title || loading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                {loading ? 'A criar...' : 'Criar'}
              </button>
              <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ChatIndex({
  conversations: initConvs = [],
  users = [],
  activeId,
  activeConversation,
  messages: initMessages = [],
  isAdmin: initIsAdmin = false,
  othersReadAt: initOthersReadAt = null,
}: any) {
  const { props } = usePage()
  const authUser = (props as any).auth?.user

  const isAdmin = initIsAdmin || authUser?.role === 'admin'

  const [convs, setConvs] = useState<Conv[]>(initConvs)
  const [messages, setMessages] = useState<Msg[]>(initMessages)
  const [active, setActive] = useState<Conv | null>(activeConversation ?? null)
  const [othersReadAt, setOthersReadAt] = useState<string | null>(initOthersReadAt)
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<Msg | null>(null)

  const [showNew, setShowNew] = useState(false)
  const [actionModal, setActionModal] = useState<{ type: 'task' | 'ticket'; msg: Msg } | null>(null)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(!activeId) // mobile: show sidebar if no active

  // Audio recording
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordTimerRef = useRef<number | null>(null)

  // File input
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<number | null>(null)
  const lastMsgTimeRef = useRef<string | null>(initMessages.length > 0 ? initMessages[initMessages.length - 1].created_at : null)

  // Sincronizar props → estado (após redirects Inertia)
  // Usar JSON stringify como dependência para evitar loops com arrays re-criados a cada render
  const initConvsKey = JSON.stringify(initConvs.map((c: Conv) => c.id))
  const initMsgsKey  = JSON.stringify(initMessages.map((m: Msg) => m.id))
  const activeConvId = activeConversation?.id ?? null

  useEffect(() => { setConvs(initConvs) }, [initConvsKey])           // eslint-disable-line
  useEffect(() => { if (activeConversation) setActive(activeConversation) }, [activeConvId]) // eslint-disable-line
  useEffect(() => {
    setMessages(initMessages)
    lastMsgTimeRef.current = initMessages.length > 0
      ? initMessages[initMessages.length - 1].created_at
      : null
  }, [initMsgsKey])  // eslint-disable-line

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Polling
  const startPolling = useCallback((convId: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = window.setInterval(async () => {
      try {
        const res = await axios.get(`/chat/${convId}/poll`, {
          params: { since: lastMsgTimeRef.current }
        })
        // Actualizar read receipts independentemente de novas mensagens
        if (res.data.others_read_at) {
          setOthersReadAt(prev =>
            !prev || new Date(res.data.others_read_at) > new Date(prev)
              ? res.data.others_read_at
              : prev
          )
        }
        if (res.data.messages.length > 0) {
          setMessages(prev => {
            const ids = new Set(prev.map((m: Msg) => m.id))
            const newMsgs = res.data.messages.filter((m: Msg) => !ids.has(m.id))
            if (newMsgs.length === 0) return prev
            lastMsgTimeRef.current = newMsgs[newMsgs.length - 1].created_at
            const merged = [...prev, ...newMsgs]
            // Garantir ordem cronológica independentemente da origem
            merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            return merged
          })
          // Actualizar posição da conversa na lista (mais recente no topo)
          setConvs(prev => {
            const lastMsg = res.data.messages[res.data.messages.length - 1]
            const updated = prev.map(c => c.id === convId ? {
              ...c,
              last_message_at: lastMsg.created_at,
              latest_message: { body: lastMsg.body ?? '📎', type: lastMsg.type, user_name: lastMsg.user?.name, created_at: lastMsg.created_at },
            } : c)
            return updated.sort((a, b) => {
              if (!a.last_message_at) return 1
              if (!b.last_message_at) return -1
              return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
            })
          })
        }
      } catch {}
    }, 3000)
  }, [])

  useEffect(() => {
    if (active) startPolling(active.id)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [active, startPolling])

  // Navigate to conversation
  function openConversation(conv: Conv) {
    setActive(conv)
    setSidebarOpen(false)
    setMessages([])
    setOthersReadAt(null)
    lastMsgTimeRef.current = null
    router.visit(`/chat/${conv.id}`, { preserveScroll: false })
  }

  // Send message
  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault()
    if (!active) return
    if (!body.trim() && !fileInputRef.current?.files?.length) return

    const form = new FormData()
    if (body.trim()) form.append('body', body.trim())
    if (replyTo) form.append('parent_message_id', String(replyTo.id))
    const files = fileInputRef.current?.files
    if (files) {
      Array.from(files).forEach(f => form.append('files[]', f))
    }
    form.append('_method', 'POST')

    setBody('')
    setReplyTo(null)
    if (fileInputRef.current) fileInputRef.current.value = ''

    try {
      const res = await axios.post(`/chat/${active.id}/messages`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessages(prev => {
        const merged = [...prev, res.data]
        merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        return merged
      })
      lastMsgTimeRef.current = res.data.created_at
      setConvs(prev => {
        const updated = prev.map(c => c.id === active.id ? {
          ...c,
          latest_message: { body: body || '📎', type: 'text', user_name: authUser?.name, created_at: res.data.created_at },
          last_message_at: res.data.created_at,
        } : c)
        return updated.sort((a, b) => {
          if (!a.last_message_at) return 1
          if (!b.last_message_at) return -1
          return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        })
      })
    } catch {}
  }

  // Start audio recording
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      audioChunksRef.current = []
      mr.ondataavailable = e => audioChunksRef.current.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' })
        const form = new FormData()
        form.append('files[]', file)
        form.append('type', 'audio')
        if (replyTo) form.append('parent_message_id', String(replyTo.id))
        try {
          const res = await axios.post(`/chat/${active!.id}/messages`, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          setMessages(prev => [...prev, res.data])
          lastMsgTimeRef.current = res.data.created_at
        } catch {}
      }
      mr.start()
      mediaRecorderRef.current = mr
      setRecording(true)
      setRecordSeconds(0)
      recordTimerRef.current = window.setInterval(() => setRecordSeconds(s => s + 1), 1000)
    } catch {
      alert('Não foi possível aceder ao microfone.')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    if (recordTimerRef.current) clearInterval(recordTimerRef.current)
    setRecording(false)
    setRecordSeconds(0)
    setReplyTo(null)
  }

  // Delete message
  async function deleteMessage(msg: Msg) {
    await axios.delete(`/chat/${active!.id}/messages/${msg.id}`)
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, deleted_at: new Date().toISOString() } : m))
  }

  function deleteConversation() {
    if (!active) return
    const label = active.type === 'group' ? `o grupo "${active.name}"` : `a conversa com "${active.name}"`
    if (!confirm(`Tens a certeza que queres apagar ${label}? Esta acção é irreversível.`)) return
    router.delete(`/chat/${active.id}`)
  }

  const filteredConvs = convs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const totalUnread = convs.reduce((sum, c) => sum + c.unread_count, 0)

  // Group messages by date (always sorted chronologically)
  function groupMessages(msgs: Msg[]) {
    const sorted = [...msgs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const groups: { date: string; msgs: Msg[] }[] = []
    sorted.forEach(m => {
      const d = new Date(m.created_at).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })
      const last = groups[groups.length - 1]
      if (last?.date === d) last.msgs.push(m)
      else groups.push({ date: d, msgs: [m] })
    })
    return groups
  }

  return (
    <AdminLayout title="Chat" showSubNav={false}>
      <Head title="Chat — JuntaOS"/>

      <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-gray-50">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className={clsx(
          'flex flex-col bg-white border-r border-gray-200 flex-shrink-0',
          'w-full md:w-80',
          !sidebarOpen && active ? 'hidden md:flex' : 'flex'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
              💬 Chat
              {totalUnread > 0 && (
                <span className="text-xs bg-indigo-600 text-white rounded-full px-1.5 py-0.5 font-semibold">
                  {totalUnread}
                </span>
              )}
            </h2>
            <button onClick={() => setShowNew(true)}
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white transition-colors">
              <Plus size={16}/>
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar conversas..."
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"/>
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                <p>Sem conversas</p>
                <button onClick={() => setShowNew(true)} className="mt-2 text-indigo-600 font-medium text-sm">
                  Iniciar conversa
                </button>
              </div>
            )}
            {filteredConvs.map(conv => (
              <button key={conv.id} onClick={() => openConversation(conv)}
                className={clsx(
                  'flex items-center gap-3 w-full px-4 py-3 transition-colors text-left',
                  active?.id === conv.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                )}>
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {conv.type === 'group' ? (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: conv.avatar_color }}>
                      {conv.name[0].toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {conv.name[0]?.toUpperCase()}
                    </div>
                  )}
                  {conv.type === 'group' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Users size={8} className="text-white"/>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium text-gray-800 text-sm truncate">{conv.name}</span>
                    {conv.latest_message && (
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                        {timeStr(conv.latest_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    {conv.latest_message ? (
                      <span className="text-xs text-gray-500 truncate">
                        {conv.type === 'group' && conv.latest_message.user_name && (
                          <span className="font-medium">{conv.latest_message.user_name.split(' ')[0]}: </span>
                        )}
                        {conv.latest_message.body}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sem mensagens</span>
                    )}
                    {conv.unread_count > 0 && (
                      <span className="ml-1 flex-shrink-0 w-5 h-5 bg-indigo-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat area ────────────────────────────────────────────────────── */}
        <div className={clsx(
          'flex-1 flex flex-col min-w-0',
          sidebarOpen && !active ? 'hidden md:flex' : 'flex'
        )}>
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-3">
              <div className="text-6xl">💬</div>
              <p className="font-medium text-gray-600">Seleciona uma conversa</p>
              <button onClick={() => setShowNew(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                <Plus size={16}/> Nova conversa
              </button>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
                <button onClick={() => { setSidebarOpen(true) }} className="md:hidden text-gray-500">
                  <ChevronLeft size={20}/>
                </button>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: active.avatar_color }}>
                  {active.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm">{active.name}</div>
                  {active.type === 'group' && (
                    <div className="text-xs text-gray-400 truncate">
                      {active.participants.map(p => p.name.split(' ')[0]).join(', ')}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={deleteConversation}
                    title="Apagar conversa"
                    className="ml-2 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16}/>
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
                style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)' }}>
                {groupMessages(messages).map(group => (
                  <div key={group.date}>
                    <div className="flex justify-center my-3">
                      <span className="text-[11px] text-gray-500 bg-white/80 px-3 py-1 rounded-full shadow-sm capitalize">
                        {group.date}
                      </span>
                    </div>
                    {group.msgs.map((msg, i) => {
                      const isMine = msg.user_id === authUser?.id
                      const prevMsg = group.msgs[i - 1]
                      const showName = active.type === 'group' && !isMine &&
                        msg.user_id !== prevMsg?.user_id
                      return (
                        <MessageBubble
                          key={msg.id}
                          msg={msg}
                          isMine={isMine}
                          showName={showName}
                          othersReadAt={othersReadAt}
                          isAdmin={isAdmin}
                          onReply={setReplyTo}
                          onDelete={deleteMessage}
                          onCreateTask={msg => setActionModal({ type: 'task', msg })}
                          onCreateTicket={msg => setActionModal({ type: 'ticket', msg })}
                        />
                      )
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef}/>
              </div>

              {/* Reply preview */}
              {replyTo && (
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border-t border-indigo-100">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-indigo-600">{replyTo.user.name}</span>
                    <p className="text-xs text-gray-600 truncate">{replyTo.body ?? '📎 Anexo'}</p>
                  </div>
                  <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={14}/>
                  </button>
                </div>
              )}

              {/* Input area */}
              <div className="bg-white border-t border-gray-200 px-3 py-3 flex-shrink-0">
                {recording ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-2.5">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
                      <span className="text-sm text-red-600 font-medium">A gravar... {formatDuration(recordSeconds)}</span>
                    </div>
                    <button onClick={stopRecording}
                      className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">
                      <StopCircle size={18}/>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={sendMessage} className="flex items-end gap-2">
                    {/* File attachment */}
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                      <Paperclip size={18}/>
                    </button>
                    <input ref={fileInputRef} type="file" multiple accept="*/*" className="hidden"
                      onChange={() => { if (fileInputRef.current?.files?.length) sendMessage() }}/>

                    {/* Text input */}
                    <div className="flex-1 relative">
                      <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
                        }}
                        rows={1}
                        placeholder="Mensagem..."
                        style={{ maxHeight: 120, resize: 'none' }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent overflow-hidden"
                        onInput={e => {
                          const t = e.currentTarget
                          t.style.height = 'auto'
                          t.style.height = Math.min(t.scrollHeight, 120) + 'px'
                        }}
                      />
                    </div>


                    {/* Send or mic */}
                    {body.trim() ? (
                      <button type="submit"
                        className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors">
                        <Send size={16}/>
                      </button>
                    ) : (
                      <button type="button" onClick={startRecording}
                        className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                        <Mic size={18}/>
                      </button>
                    )}
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal nova conversa */}
      {showNew && (
        <NewConvModal
          users={users}
          onClose={() => setShowNew(false)}
        />
      )}
    </AdminLayout>
  )
}
