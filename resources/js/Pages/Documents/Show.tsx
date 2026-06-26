import React, { useState, useRef } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  ArrowLeft, Download, Trash2, CheckCircle, Clock, Edit2,
  FileText, FileImage, FileSpreadsheet, File, Upload, X,
  Eye, EyeOff, Calendar, User, Tag, Send, XCircle, Bell,
} from 'lucide-react'
import clsx from 'clsx'

const VIS_COLORS: Record<string, string> = {
  público:  'bg-green-100 text-green-700',
  interno:  'bg-gray-100 text-gray-600',
  restrito: 'bg-red-100 text-red-700',
}

const TYPE_LABELS: Record<string, string> = {
  documento:    'Documento',
  ata:          'Ata',
  regulamento:  'Regulamento',
  'formulário': 'Formulário',
  outro:        'Outro',
}

function fmtSize(bytes?: number) {
  if (!bytes) return '—'
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function FileIconLarge({ mime }: { mime?: string }) {
  const cls = 'w-10 h-10'
  if (!mime)                                                    return <File            className={clsx(cls, 'text-gray-400')} />
  if (mime.startsWith('image/'))                                return <FileImage       className={clsx(cls, 'text-purple-500')} />
  if (mime === 'application/pdf')                               return <FileText        className={clsx(cls, 'text-red-500')} />
  if (mime.includes('spreadsheet') || mime.includes('excel'))   return <FileSpreadsheet className={clsx(cls, 'text-green-600')} />
  if (mime.includes('word') || mime.includes('document'))       return <FileText        className={clsx(cls, 'text-blue-500')} />
  return <File className={clsx(cls, 'text-gray-400')} />
}

function DocumentViewer({ doc }: { doc: any }) {
  const mime: string = doc.mime_type ?? ''
  const url: string  = doc.file_url ?? ''

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
        <File size={48} className="mb-4 opacity-30" />
        <p className="text-sm">Nenhum ficheiro associado a este documento.</p>
      </div>
    )
  }

  if (mime === 'application/pdf') {
    return (
      <iframe
        src={url}
        title={doc.title}
        className="w-full rounded-xl border border-gray-100"
        style={{ minHeight: '75vh' }}
      />
    )
  }

  if (mime.startsWith('image/')) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 p-4" style={{ minHeight: '50vh' }}>
        <img src={url} alt={doc.title} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-gray-50 rounded-xl border border-gray-100">
      <FileIconLarge mime={mime} />
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">{doc.original_name ?? doc.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{fmtSize(doc.file_size)}</p>
      </div>
      <a href={`/documentos/${doc.id}/download`}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
        <Download size={15} /> Descarregar ficheiro
      </a>
      <p className="text-xs text-gray-400">Pré-visualização não disponível para este tipo de ficheiro</p>
    </div>
  )
}

// ── Modal "Solicitar aprovação" ────────────────────────────────────────────────
function RequestApprovalModal({
  docId, users, onClose,
}: {
  docId: number
  users: { id: number; name: string }[]
  onClose: () => void
}) {
  const [selected, setSelected] = useState<number[]>([])
  const [notes, setNotes]       = useState('')
  const [sending, setSending]   = useState(false)
  const [search, setSearch]     = useState('')

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))

  const toggle = (id: number) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selected.length === 0) return
    setSending(true)
    router.post(`/documentos/${docId}/solicitar-aprovacao`, { user_ids: selected, notes }, {
      onFinish: () => setSending(false),
      onSuccess: () => onClose(),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Solicitar aprovação</h3>
            <p className="text-xs text-gray-400 mt-0.5">Seleciona as pessoas que devem aprovar</p>
          </div>
          <button onClick={onClose}><X size={16} className="text-gray-400"/></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <input
              type="text" placeholder="Pesquisar pessoa…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-center py-6 text-gray-400 text-sm">Nenhum utilizador encontrado</p>
            )}
            {filtered.map(u => (
              <label key={u.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggle(u.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                <span className="text-sm text-gray-700">{u.name}</span>
              </label>
            ))}
          </div>

          {selected.length > 0 && (
            <div className="text-xs text-primary-600 font-medium">
              {selected.length} pessoa{selected.length > 1 ? 's' : ''} selecionada{selected.length > 1 ? 's' : ''}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nota (opcional)</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Por favor aprova até sexta-feira…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={sending || selected.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 transition-colors">
              {sending
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : <Send size={14}/>}
              Enviar pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function DocumentShow({
  document: doc,
  users,
}: {
  document: any
  users: { id: number; name: string }[]
}) {
  const [editing, setEditing]             = useState(false)
  const [uploading, setUploading]         = useState(false)
  const [dragOver, setDragOver]           = useState(false)
  const [newFile, setNewFile]             = useState<File | null>(null)
  const [showApprovalModal, setApproval]  = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title:        doc.title        ?? '',
    description:  doc.description  ?? '',
    type:         doc.type         ?? 'documento',
    visibility:   doc.visibility   ?? 'interno',
    meeting_date: doc.meeting_date ? doc.meeting_date.substring(0, 10) : '',
  })

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) setNewFile(file)
  }

  // ── Fix: pass plain object + forceFormData (NOT raw FormData) ────────────
  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    const payload: Record<string, any> = { ...form }
    if (newFile) payload.file = newFile

    router.post(`/documentos/${doc.id}`, payload, {
      forceFormData: true,
      onFinish: () => setUploading(false),
      onSuccess: () => { setEditing(false); setNewFile(null) },
    })
  }

  const handleApprove = () => {
    if (confirm('Aprovar este documento?')) {
      router.post(`/documentos/${doc.id}/aprovar`)
    }
  }

  const handleUnapprove = () => {
    if (confirm('Retirar a aprovação? O documento volta a "Pendente de aprovação".')) {
      router.post(`/documentos/${doc.id}/desaprovar`)
    }
  }

  const handleDelete = () => {
    if (confirm('Eliminar este documento? Esta ação não pode ser revertida.')) {
      router.delete(`/documentos/${doc.id}`)
    }
  }

  const hasPendingRequest = !!doc.approval_requested_at && !doc.is_approved

  return (
    <AdminLayout title="Documentos">
      <Head title={`${doc.title} — Documentos`} />
      <div className="p-4 md:p-6 space-y-5 max-w-6xl">

        {/* Header */}
        <div className="flex items-start gap-4">
          <Link href="/documentos"
            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors mt-0.5">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', VIS_COLORS[doc.visibility])}>
                {doc.visibility}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium capitalize">
                {TYPE_LABELS[doc.type] ?? doc.type}
              </span>
              {doc.is_approved
                ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle size={12}/> Aprovado
                  </span>
                : hasPendingRequest
                  ? <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <Bell size={12}/> Aguarda aprovação de {doc.approval_requested_from?.name ?? '—'}
                    </span>
                  : <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Clock size={12}/> Pendente de aprovação
                    </span>
              }
            </div>
            <h1 className="text-xl font-bold text-gray-900 truncate">{doc.title}</h1>
            {doc.description && <p className="text-sm text-gray-500 mt-1">{doc.description}</p>}
            {hasPendingRequest && doc.approval_notes && (
              <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mt-2 border border-amber-100">
                Nota: {doc.approval_notes}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            {doc.file_url && (
              <a href={`/documentos/${doc.id}/download`}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Download size={14}/><span className="hidden sm:inline">Descarregar</span>
              </a>
            )}

            {/* Approval actions */}
            {doc.is_approved ? (
              <button onClick={handleUnapprove}
                className="flex items-center gap-1.5 px-3 py-2 border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg text-sm transition-colors">
                <XCircle size={14}/><span className="hidden sm:inline">Retirar aprovação</span>
              </button>
            ) : (
              <>
                <button onClick={handleApprove}
                  className="flex items-center gap-1.5 px-3 py-2 border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg text-sm transition-colors">
                  <CheckCircle size={14}/><span className="hidden sm:inline">Aprovar</span>
                </button>
                <button onClick={() => setApproval(true)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors">
                  <Send size={14}/><span className="hidden sm:inline">Solicitar aprovação</span>
                </button>
              </>
            )}

            <button onClick={() => setEditing(!editing)}
              className={clsx('flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-colors',
                editing
                  ? 'border-primary-300 text-primary-700 bg-primary-50'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
              <Edit2 size={14}/><span className="hidden sm:inline">Editar</span>
            </button>
            <button onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
              <Trash2 size={14}/>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Main content */}
          <div className="lg:col-span-3">
            {editing ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-5">Editar documento</h3>
                <form onSubmit={submitEdit} className="space-y-4">

                  {/* File replace drop zone */}
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={clsx(
                      'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors select-none',
                      dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50',
                    )}>
                    <input ref={fileRef} type="file" className="hidden"
                      onChange={e => setNewFile(e.target.files?.[0] ?? null)} />
                    {newFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText size={16} className="text-primary-500"/>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-700">{newFile.name}</p>
                          <p className="text-xs text-gray-400">{fmtSize(newFile.size)}</p>
                        </div>
                        <button type="button"
                          onClick={e => { e.stopPropagation(); setNewFile(null) }}
                          className="ml-2 p-1 rounded hover:bg-gray-200 text-gray-400">
                          <X size={14}/>
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} className="mx-auto mb-1.5 text-gray-300"/>
                        {doc.file_url
                          ? <p className="text-sm text-gray-500">
                              Substituir ficheiro actual <span className="text-primary-600 font-medium">(opcional)</span>
                            </p>
                          : <p className="text-sm text-gray-500">
                              Adicionar ficheiro — <span className="text-primary-600 font-medium">clique aqui</span>
                            </p>}
                        {doc.original_name && (
                          <p className="text-xs text-gray-400 mt-0.5">Actual: {doc.original_name}</p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                      <input type="text" required value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Visibilidade</label>
                      <select value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        {['público', 'interno', 'restrito'].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    {form.type === 'ata' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data da reunião</label>
                        <input type="date" value={form.meeting_date}
                          onChange={e => setForm(f => ({ ...f, meeting_date: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea rows={3} value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={uploading}
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors flex items-center gap-2">
                      {uploading && (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      )}
                      {uploading ? 'A guardar…' : 'Guardar alterações'}
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setNewFile(null) }}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <DocumentViewer doc={doc} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* File card */}
            {doc.file_url && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ficheiro</h4>
                <div className="flex items-center gap-3 mb-3">
                  <FileIconLarge mime={doc.mime_type}/>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{doc.original_name ?? 'Ficheiro'}</p>
                    <p className="text-xs text-gray-400">{fmtSize(doc.file_size)}</p>
                  </div>
                </div>
                <a href={`/documentos/${doc.id}/download`}
                  className="flex items-center justify-center gap-2 w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Download size={14}/> Descarregar
                </a>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Informação</h4>

              <div className="flex items-start gap-2.5">
                <Tag size={14} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                <div>
                  <p className="text-xs text-gray-400">Tipo</p>
                  <p className="text-sm text-gray-700 font-medium">{TYPE_LABELS[doc.type] ?? doc.type}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {doc.visibility === 'público'
                  ? <Eye size={14} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                  : <EyeOff size={14} className="text-gray-400 mt-0.5 flex-shrink-0"/>}
                <div>
                  <p className="text-xs text-gray-400">Visibilidade</p>
                  <span className={clsx('inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5', VIS_COLORS[doc.visibility])}>
                    {doc.visibility}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                <div>
                  <p className="text-xs text-gray-400">Criado por</p>
                  <p className="text-sm text-gray-700">{doc.creator?.name ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                <div>
                  <p className="text-xs text-gray-400">Data de criação</p>
                  <p className="text-sm text-gray-700">
                    {new Date(doc.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {doc.meeting_date && (
                <div className="flex items-start gap-2.5">
                  <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0"/>
                  <div>
                    <p className="text-xs text-gray-400">Data da reunião</p>
                    <p className="text-sm text-gray-700">
                      {new Date(doc.meeting_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}

              {/* Approval status */}
              <div className="pt-1 border-t border-gray-50">
                {doc.is_approved ? (
                  <div className="flex items-start gap-2.5">
                    <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0"/>
                    <div>
                      <p className="text-xs text-gray-400">Aprovado por</p>
                      <p className="text-sm text-gray-700 font-medium">{doc.approver?.name ?? '—'}</p>
                      {doc.approved_at && (
                        <p className="text-xs text-gray-400">
                          {new Date(doc.approved_at).toLocaleDateString('pt-PT')}
                        </p>
                      )}
                    </div>
                  </div>
                ) : hasPendingRequest ? (
                  <div className="flex items-start gap-2.5">
                    <Bell size={14} className="text-amber-500 mt-0.5 flex-shrink-0"/>
                    <div>
                      <p className="text-xs text-gray-400">Aprovação solicitada a</p>
                      <p className="text-sm text-amber-700 font-medium">{doc.approval_requested_from?.name ?? '—'}</p>
                      {doc.approval_requested_at && (
                        <p className="text-xs text-gray-400">
                          {new Date(doc.approval_requested_at).toLocaleDateString('pt-PT')}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <Clock size={14} className="text-amber-400 mt-0.5 flex-shrink-0"/>
                    <div>
                      <p className="text-xs text-gray-400">Estado de aprovação</p>
                      <p className="text-sm text-amber-600">Pendente</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal "Solicitar aprovação" */}
      {showApprovalModal && (
        <RequestApprovalModal
          docId={doc.id}
          users={users}
          onClose={() => setApproval(false)}
        />
      )}
    </AdminLayout>
  )
}
