import React, { useState, useRef } from 'react'
import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import {
  Plus, BookOpen, Search, FileText, FileImage, FileSpreadsheet,
  File, CheckCircle, Clock, Upload, X, ChevronRight,
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

function fileIcon(mime?: string) {
  if (!mime) return <File size={16} className="text-gray-400" />
  if (mime.startsWith('image/'))                              return <FileImage       size={16} className="text-purple-500" />
  if (mime === 'application/pdf')                             return <FileText        size={16} className="text-red-500" />
  if (mime.includes('spreadsheet') || mime.includes('excel')) return <FileSpreadsheet size={16} className="text-green-600" />
  if (mime.includes('word') || mime.includes('document'))    return <FileText        size={16} className="text-blue-500" />
  return <File size={16} className="text-gray-400" />
}

function fmtSize(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function DocumentsIndex({ documents, filters }: any) {
  const [showForm, setShowForm]   = useState(false)
  const [search, setSearch]       = useState(filters?.search ?? '')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const [selectedFile, setFile]   = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    title: '', description: '', type: 'documento', visibility: 'interno', meeting_date: '',
  })

  const applyFilter = (key: string, value: string) =>
    router.get('/documentos', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true })

  const handleFileChange = (file: File | null) => {
    setFile(file)
    if (file && !form.title) {
      setForm(f => ({ ...f, title: file.name.replace(/\.[^/.]+$/, '') }))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileChange(file)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
    if (selectedFile) fd.append('file', selectedFile)

    router.post('/documentos', fd as any, {
      forceFormData: true,
      onFinish: () => setUploading(false),
      onSuccess: () => {
        setShowForm(false)
        setForm({ title: '', description: '', type: 'documento', visibility: 'interno', meeting_date: '' })
        setFile(null)
      },
    })
  }

  return (
    <AdminLayout title="Documentos">
      <Head title="Documentos — JuntaOS" />
      <div className="p-4 md:p-6 space-y-5">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={e => { e.preventDefault(); applyFilter('search', search) }} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar documentos…"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </form>
          <div className="flex gap-2 flex-wrap">
            <select value={filters?.type ?? ''} onChange={e => applyFilter('type', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todos os tipos</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filters?.visibility ?? ''} onChange={e => applyFilter('visibility', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Visibilidade</option>
              {['público', 'interno', 'restrito'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <button onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0">
              <Plus size={16} /><span className="hidden sm:inline">Novo documento</span>
            </button>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-5">Novo Documento</h3>
            <form onSubmit={submit} className="space-y-4">

              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={clsx(
                  'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors select-none',
                  dragOver
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50',
                )}>
                <input ref={fileRef} type="file" className="hidden"
                  onChange={e => handleFileChange(e.target.files?.[0] ?? null)} />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    {fileIcon(selectedFile.type)}
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400">{fmtSize(selectedFile.size)}</p>
                    </div>
                    <button type="button"
                      onClick={e => { e.stopPropagation(); setFile(null) }}
                      className="ml-2 p-1 rounded hover:bg-gray-200 text-gray-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      Arraste um ficheiro ou <span className="text-primary-600 font-medium">clique para selecionar</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, Word, imagens, folhas de cálculo — até 50 MB</p>
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
                  <textarea rows={2} value={form.description}
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
                  {uploading ? 'A carregar…' : 'Criar documento'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {(documents?.data ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <BookOpen size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Sem documentos encontrados.</p>
              <button onClick={() => setShowForm(true)}
                className="mt-4 text-sm text-primary-600 hover:underline font-medium">
                + Adicionar primeiro documento
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Documento', 'Tipo', 'Visibilidade', 'Criado por', 'Data', 'Estado'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                    <th className="px-4 py-3 w-6" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(documents?.data ?? []).map((d: any) => (
                    <tr key={d.id}
                      onClick={() => router.visit(`/documentos/${d.id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {fileIcon(d.mime_type)}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate max-w-[200px] md:max-w-xs">{d.title}</p>
                            {d.original_name && (
                              <p className="text-[11px] text-gray-400 truncate">
                                {d.original_name}{d.file_size ? ` · ${fmtSize(d.file_size)}` : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 capitalize">{TYPE_LABELS[d.type] ?? d.type}</td>
                      <td className="px-4 py-3.5">
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', VIS_COLORS[d.visibility])}>
                          {d.visibility}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs">{d.creator?.name ?? '—'}</td>
                      <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(d.created_at).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="px-4 py-3.5">
                        {d.is_approved
                          ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle size={13} /> Aprovado</span>
                          : <span className="flex items-center gap-1 text-xs text-amber-600"><Clock size={13} /> Pendente</span>}
                      </td>
                      <td className="px-4 py-3.5 text-gray-300 group-hover:text-gray-400 transition-colors">
                        <ChevronRight size={16} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {(documents?.last_page ?? 1) > 1 && (
          <div className="flex justify-center gap-2 flex-wrap">
            {documents.links?.map((link: any, i: number) => (
              <button key={i} disabled={!link.url}
                onClick={() => link.url && router.visit(link.url)}
                className={clsx('px-3 py-1.5 text-sm rounded-lg border transition-colors', {
                  'bg-primary-600 text-white border-primary-600': link.active,
                  'border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40': !link.active,
                })}
                dangerouslySetInnerHTML={{ __html: link.label }} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
