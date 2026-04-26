'use client'

import { useEffect } from 'react'
import { ChildrenFilters, ChildListItem } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { childrenApi } from '@/lib/api'
import { toChildListItem } from '@/lib/transform'
import { MapPin, HeartPulse, BookOpen, HandHeart, CheckCircle2, AlertTriangle, CircleSlash, Clock } from 'lucide-react'
import Link from 'next/link'

interface Props {
  filters: ChildrenFilters
  onMetaChange?: (meta: { total: number; page: number; totalPages: number }) => void
  onChange?: (filters: ChildrenFilters) => void
}

function calcularIdade(dataNascimento: string) {
  const hoje = new Date()
  const nascimento = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const m = hoje.getMonth() - nascimento.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--
  return idade
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}



const areaConfig = {
  saude: { label: 'Saúde', Icon: HeartPulse },
  educacao: { label: 'Educação', Icon: BookOpen },
  assistencia_social: { label: 'Social', Icon: HandHeart },
}

const areaBadgeConfig = {
  ok: { cls: 'bg-green-500/10 text-green-600 border-green-500/20', dot: 'bg-green-500' },
  alerta: { cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20', dot: 'bg-amber-500' },
  sem_dados: { cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20 opacity-60', dot: 'bg-gray-400' },
}

function AreaBadge({ status, label, Icon }: { status: string; label: string; Icon: React.ElementType }) {
  const config = areaBadgeConfig[status as keyof typeof areaBadgeConfig] ?? areaBadgeConfig.sem_dados

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${config.cls}`}
      title={`${label}: ${status === 'ok' ? 'sem alertas' : status === 'alerta' ? 'com alertas' : 'sem dados'}`}
    >
      {status === 'sem_dados'
        ? <CircleSlash className="w-3 h-3" />
        : <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      }
      <Icon className="w-3 h-3" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  )
}

function ChildCard({ child }: { child: ChildListItem }) {
  const idade = calcularIdade(child.dataNascimento)

  const semDados =
    child.areas.saude === 'sem_dados' &&
    child.areas.educacao === 'sem_dados' &&
    child.areas.assistencia_social === 'sem_dados'

  const statusVariant = semDados
    ? 'border-gray-200 hover:border-gray-300'
    : child.alertasCount > 0
    ? 'border-orange-200 hover:border-orange-400'
    : 'border-green-200 hover:border-green-400'

  return (
    
    <Link
      href={`/children/${child.id}`}
      className={`group block bg-card border rounded-xl p-4 transition-all duration-200 
      hover:shadow-lg hover:-translate-y-0.5 ${statusVariant}
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate group-hover:text-rio-blue transition-colors">
            {child.nome}
          </p>
          <p className="text-xs text-muted-foreground">{idade} anos</p>
        </div>

        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            semDados
              ? 'bg-gray-100 text-gray-400'
              : child.alertasCount > 0
              ? 'bg-orange-100 text-orange-600'
              : 'bg-green-100 text-green-600'
          }`}
        >
          {semDados
            ? 'sem dados'
            : child.alertasCount > 0
            ? `${child.alertasCount} alertas`
            : 'ok'}
        </span>
      </div>

      {/* BAIRRO */}
      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-3">
        <MapPin className="w-3 h-3" />
        {child.bairro}
      </div>

      {/* ÁREAS */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {(Object.entries(areaConfig) as [
          keyof typeof areaConfig,
          typeof areaConfig[keyof typeof areaConfig]
        ][]).map(([key, { label, Icon }]) => {
          const status = child.areas[key]
          const config =
            areaBadgeConfig[status as keyof typeof areaBadgeConfig] ??
            areaBadgeConfig.sem_dados

          return (
            <div
              key={key}
              className={`rounded-md p-2 text-center text-xs border ${config.cls}`}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <span className="block truncate">{label}</span>
            </div>
          )
        })}
      </div>

      {/* RODAPÉ */}
      <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
        {child.revisado && child.revisado_em ? (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Revisado
          </span>
        ) : (
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        )}

        <span className="text-rio-blue opacity-0 group-hover:opacity-100 transition">
          Ver →
        </span>
      </div>
    </Link>
  )
}

export default function ChildrenCards({ filters, onMetaChange }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['children', filters],
    queryFn: () => childrenApi.list(filters),
  })

  useEffect(() => {
    if (data?.meta) onMetaChange?.(data.meta)
  }, [data?.meta])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children.map((child) => (
        <ChildCard key={child.id} child={child} />
      ))}
    </div>
  )
}