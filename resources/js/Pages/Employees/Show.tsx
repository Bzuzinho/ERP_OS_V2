import React, { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { ArrowLeft, Mail, Phone, Smartphone, MapPin, Edit3, Calendar, Plus, UserCheck } from 'lucide-react'
import clsx from 'clsx'

const statusColors: Record<string, string> = {
  ativo:   'bg-green-100 text-green-700',
  inativo: 'bg-gray-100 text-gray-600',
  ferias:  'bg-blue-100 text-blue-700',
  ausente: 'bg-orange-100 text-orange-700',
}
const statusLabels: Record<string, string> = {
  ativo: 'Ativo', inativo: 'Inativo', ferias: 'Férias', ausente: 'Ausente',
}
const absenceTypeLabels: Record<string, string> = {
  ferias: 'Férias', doenca: 'Doença', formacao: 'Formação', outro: 'Outro',
}

export default function EmployeeShow({ employee }: any) {
  const [addingAbsence, setAddingAbsence] = useState(false)
  const { data, setData, post, processing, reset } = useForm({
    type: 'ferias', starts_at: '', ends_at: '', notes: '',
  })

  function submitAbsence(e: React.FormEvent) {
    e.preventDefault()
    post(`/rh/${employee.id}/ausencias`, {
      onSuccess: () => { setAddingAbsence(false); reset() },
    })
  }

  return (
    <AdminLayout title={employee.name}>
      <Head title={`${employee.name} — JuntaOS`}/>
      <div className="p-6 max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/rh" className="p-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={18} className="text-gray-600"/>
          </Link>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {employee.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 truncate">{employee.name}</h1>
                {employee.user && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                    <UserCheck size={11}/> Utilizador
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{[employee.position, employee.department?.name].filter(Boolean).join(' · ')}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', statusColors[employee.status] ?? 'bg-gray-100 text-gray-600')}>
              {statusLabels[employee.status] ?? employee.status}
            </span>
            <Link href={`/rh/${employee.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit3 size={14}/> Editar
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* Contacto */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Dados de Contacto</h2>
              <div className="space-y-3">
                {employee.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={15} className="text-gray-400"/>
                    <a href={`mailto:${employee.email}`} className="text-primary-600 hover:underline">{employee.email}</a>
                  </div>
                )}
                {employee.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={15} className="text-gray-400"/>
                    <a href={`tel:${employee.phone}`} className="text-gray-700">{employee.phone}</a>
                  </div>
                )}
                {employee.mobile && (
                  <div className="flex items-center gap-3 text-sm">
                    <Smartphone size={15} className="text-gray-400"/>
                    <a href={`tel:${employee.mobile}`} className="text-gray-700">{employee.mobile}</a>
                  </div>
                )}
                {(employee.address || employee.locality) && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={15} className="text-gray-400 mt-0.5"/>
                    <div className="text-gray-700">
                      {employee.address && <div>{employee.address}</div>}
                      {(employee.postal_code || employee.locality) && (
                        <div>{[employee.postal_code, employee.locality].filter(Boolean).join(' ')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {(employee.nif || employee.birthdate) && (
                <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                  {employee.nif && (
                    <div><p className="text-xs text-gray-400 mb-0.5">NIF</p><p className="font-mono text-gray-700">{employee.nif}</p></div>
                  )}
                  {employee.birthdate && (
                    <div><p className="text-xs text-gray-400 mb-0.5">Nascimento</p><p className="text-gray-700">{new Date(employee.birthdate).toLocaleDateString('pt-PT')}</p></div>
                  )}
                </div>
              )}

              {(employee.emergency_contact || employee.emergency_phone) && (
                <div className="pt-3 border-t border-gray-100 text-sm">
                  <p className="text-xs text-gray-400 mb-1">Contacto de emergência</p>
                  <p className="text-gray-700">{employee.emergency_contact}{employee.emergency_phone ? ` · ${employee.emergency_phone}` : ''}</p>
                </div>
              )}

              {employee.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Notas</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{employee.notes}</p>
                </div>
              )}
            </div>

            {/* Ausências */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Ausências</h2>
                <button onClick={() => setAddingAbsence(v => !v)}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:underline">
                  <Plus size={14}/> Registar
                </button>
              </div>

              {addingAbsence && (
                <form onSubmit={submitAbsence} className="p-5 border-b border-gray-100 space-y-3 bg-gray-50">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                      <select value={data.type} onChange={e => setData('type', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                        {Object.entries(absenceTypeLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Início</label>
                      <input type="date" value={data.starts_at} onChange={e => setData('starts_at', e.target.value)} required
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Fim</label>
                      <input type="date" value={data.ends_at} onChange={e => setData('ends_at', e.target.value)} required
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
                    <input value={data.notes} onChange={e => setData('notes', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setAddingAbsence(false)}
                      className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">Cancelar</button>
                    <button type="submit" disabled={processing}
                      className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60">Guardar</button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-gray-50">
                {employee.absences?.length === 0 && !addingAbsence && (
                  <p className="px-5 py-8 text-sm text-gray-400 text-center">Sem ausências registadas.</p>
                )}
                {employee.absences?.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <Calendar size={14} className="text-gray-400 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{absenceTypeLabels[a.type] ?? a.type}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(a.starts_at).toLocaleDateString('pt-PT')} → {new Date(a.ends_at).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">RH</h2>
              <div className="text-sm space-y-2">
                {employee.employee_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nº Funcionário</span>
                    <span className="font-mono text-gray-700">{employee.employee_number}</span>
                  </div>
                )}
                {employee.contract_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contrato</span>
                    <span className="text-gray-700 capitalize">{employee.contract_type}</span>
                  </div>
                )}
                {employee.hire_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data entrada</span>
                    <span className="text-gray-700">{new Date(employee.hire_date).toLocaleDateString('pt-PT')}</span>
                  </div>
                )}
                {employee.termination_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data saída</span>
                    <span className="text-gray-700">{new Date(employee.termination_date).toLocaleDateString('pt-PT')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
