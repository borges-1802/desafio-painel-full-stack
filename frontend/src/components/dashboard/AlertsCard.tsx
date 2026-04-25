'use client'

import { useQuery } from '@tanstack/react-query'
import { summaryApi } from '@/lib/api'
import { HeartPulse, BookOpen, HandHeart } from 'lucide-react'

const ALERTA_LABELS: Record<string, string> = {
  vacinas_atrasadas: 'Vacinas atrasadas',
  consulta_atrasada: 'Consulta atrasada',
  frequencia_baixa: 'Frequência baixa',
  matricula_pendente: 'Matrícula pendente',
  beneficio_suspenso: 'Benefício suspenso',
  cadastro_ausente: 'Cadastro ausente',
  cadastro_desatualizado: 'Cadastro desatualizado',
}

const AREAS = [
  {
    key: 'saude' as const,
    label: 'Saúde',
    icon: HeartPulse,
    color: 'bg-blue-600',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    key: 'educacao' as const,
    label: 'Educação',
    icon: BookOpen,
    color: 'bg-teal-600',
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
  },
  {
    key: 'assistencia_social' as const,
    label: 'Assistência Social',
    icon: HandHeart,
    color: 'bg-purple-600',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
  },
]

export default function AlertasCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: summaryApi.get,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {AREAS.map((area) => {
        const alertas = data?.detalhes_alertas[area.key] || []
        const total = alertas.reduce((acc, a) => acc + a.total, 0)

        return (
          <div key={area.key} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-lg ${area.iconBg} flex items-center justify-center`}>
                <area.icon className={`w-4 h-4 ${area.iconColor}`} />
              </div>
              <div>
                <h2 className="font-semibold text-sm">{area.label}</h2>
                <p className="text-xs text-muted-foreground">{total} alerta{total !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {alertas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sem alertas.
              </p>
            ) : (
              <div className="space-y-3">
                {alertas.map((item) => (
                  <div key={item.alerta}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{ALERTA_LABELS[item.alerta] || item.alerta}</span>
                      <span className="text-xs font-semibold">{item.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`${area.color} h-1.5 rounded-full transition-all duration-500`}
                        style={{ width: `${(item.total / (data?.total || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}