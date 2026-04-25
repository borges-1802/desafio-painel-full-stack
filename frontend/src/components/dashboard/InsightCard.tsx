'use client'

import { useQuery } from '@tanstack/react-query'
import { summaryApi } from '@/lib/api'
import { AlertTriangle, Info, XCircle } from 'lucide-react'
import { Insight } from '@/types'

const CONFIG = {
    critico: {
        icon: XCircle,
        bg: 'bg-red-50',
        border: 'border-red-100',
        iconColor: 'text-red-500',
        textColor: 'text-red-700',
    },
    atencao: {
        icon: AlertTriangle,
        bg: 'bg-yellow-50',
        border: 'border-yellow-100',
        iconColor: 'text-yellow-500',
        textColor: 'text-yellow-700',
    },
    info: {
        icon: Info,
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        iconColor: 'text-blue-500',
        textColor: 'text-blue-700',
    },
}

function InsightItem({ insight }: { insight: Insight }) {
    const config = CONFIG[insight.tipo]
    const Icon = config.icon

    return (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${config.bg} ${config.border}`}>
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
            <p className={`text-sm ${config.textColor}`}>{insight.mensagem}</p>
        </div>
    )
}

export default function InsightsCard() {
    const { data, isLoading } = useQuery({
        queryKey: ['summary'],
        queryFn: summaryApi.get,
    })

    if (isLoading) {
        return <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
    }

    const insights = data?.insights || []
    const criticos = insights.filter(i => i.tipo === 'critico')
    const atencao = insights.filter(i => i.tipo === 'atencao')
    const info = insights.filter(i => i.tipo === 'info')
    const ordenados = [...criticos, ...atencao, ...info]

    function InsightItem({ insight }: { insight: Insight }) {
    const config = CONFIG[insight.tipo]
    const Icon = config.icon

    return (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${config.bg} ${config.border}`}>
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
            <p className={`text-xs sm:text-sm ${config.textColor}`}>{insight.mensagem}</p>
        </div>
    )
}

    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="font-semibold">Insights do Sistema</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Análise automática dos dados</p>
            </div>

            <div className="space-y-2">
                {ordenados.map((insight, i) => (
                <InsightItem key={i} insight={insight} />
                ))}
            </div>
        </div>
    )
}