'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { childrenApi } from '@/lib/api'
import { ChildrenFilters } from '@/types'
import { toChildListItem } from '@/lib/transform'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { calcularIdade } from '@/lib/utils'

interface Props {
  filters: ChildrenFilters
  onMetaChange?: (meta: { total: number; page: number; totalPages: number }) => void
  onChange?: (filters: ChildrenFilters) => void
}

const AREA_LABELS = {
  ok: { label: 'OK', class: 'bg-teal-100 text-teal-800' },
  alerta: { label: 'Alerta', class: 'bg-orange-100 text-orange-800' },
  sem_dados: { label: 'Sem dados', class: 'bg-gray-100 text-gray-500' },
}

export default function ChildrenList({ filters, onMetaChange }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['children', filters],
    queryFn: () => childrenApi.list(filters),
  })

  useEffect(() => {
    if (data?.meta) onMetaChange?.(data.meta)
  }, [data?.meta, onMetaChange])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 rounded bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="text-sm text-destructive">Erro ao carregar crianças.</p>
  }

  if (!data?.data.length) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma criança encontrada.</p>
  }

  const children = data.data.map(toChildListItem)

  return (
    <div className="-mx-4 sm:mx-0">
      <div className="inline-block min-w-full shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Bairro
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                Saúde
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                Educação
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                Assistência
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {children.map((child) => (
              <tr key={child.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <Link href={`/children/${child.id}`} className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-rio-blue/10 text-rio-blue flex items-center justify-center font-semibold text-xs shrink-0">
                      {child.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium group-hover:text-rio-blue transition-colors">{child.nome}</p>
                      <p className="text-gray-500 text-xs">{calcularIdade(child.dataNascimento)} anos</p>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-700">{child.bairro}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm hidden md:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${AREA_LABELS[child.areas.saude].class}`}>
                    {AREA_LABELS[child.areas.saude].label}
                  </span>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm hidden md:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${AREA_LABELS[child.areas.educacao].class}`}>
                    {AREA_LABELS[child.areas.educacao].label}
                  </span>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm hidden md:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${AREA_LABELS[child.areas.assistencia_social].class}`}>
                    {AREA_LABELS[child.areas.assistencia_social].label}
                  </span>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                  {child.revisado ? (
                    <span className="flex items-center gap-1 text-teal-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs hidden sm:inline">Revisado</span>
                    </span>
                  ) : child.alertasCount > 0 ? (
                    <span className="flex items-center gap-1 text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs hidden sm:inline">{child.alertasCount} alerta{child.alertasCount > 1 ? 's' : ''}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs hidden sm:inline">Pendente</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}