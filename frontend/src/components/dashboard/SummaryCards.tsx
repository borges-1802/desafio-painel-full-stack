'use client'

import { useQuery } from '@tanstack/react-query'
import { summaryApi } from '@/lib/api'
import { Users, AlertTriangle, CheckCircle, ClockFading } from 'lucide-react'

export default function SummaryCards() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['summary'],
        queryFn: summaryApi.get,
    })

    if (isLoading) {
        return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
            ))}
        </div>
        )
    }

    if (isError || !data) {
        return (
        <div className="text-sm text-destructive">
            Erro ao carregar resumo.
        </div>
        )
    }

    const cards = [
    {
        title: 'Total de crianças',
        description: 'Número de crianças acompanhadas.',
        value: data.total,
        icon: Users,
        bg: 'bg-rio-blue',
        textColor: 'text-rio-gray',
        descColor: 'text-[#B5B5B5]',
        iconColor: 'text-white',
    },
    {
        title: 'Com alertas',
        description: 'Crianças com pelo menos um alerta ativo.',
        value: data.com_alertas,
        icon: AlertTriangle,
        bg: 'bg-orange-100',
        textColor: 'text-orange-900',
        descColor: 'text-orange-700',
        iconColor: 'text-orange-700',
    },
    {
        title: 'Revisados',
        description: 'Casos revisados por um técnico.',
        value: data.revisados,
        icon: CheckCircle,
        bg: 'bg-teal-100',
        textColor: 'text-teal-900',
        descColor: 'text-teal-700',
        iconColor: 'text-teal-700',
    },
    {
        title: 'Pendentes',
        description: 'Casos ainda não revisados.',
        value: data.total - data.revisados,
        icon: ClockFading,
        bg: 'bg-purple-100',
        textColor: 'text-purple-900',
        descColor: 'text-purple-700',
        iconColor: 'text-purple-700',
    }
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div key={card.title} className={`rounded-xl border ${card.bg} p-5 shadow-sm`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className={`${card.textColor} text-2xl font-bold`}>{card.value}</p>
                            <p className={`${card.textColor} text-sm font-semibold mt-1`}>{card.title}</p>
                            <p className={`${card.descColor} text-xs mt-0.5`}>{card.description}</p>
                        </div>
                        <card.icon className={`w-5 h-5 ${card.iconColor} mt-1`} />
                    </div>
                </div>
            ))}
        </div>
    )
}