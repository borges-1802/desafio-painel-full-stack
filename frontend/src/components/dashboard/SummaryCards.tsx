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
        value: data.total,
        icon: Users,
        bg: 'bg-rio-blue',
        titleColor: 'text-white',
        valueColor: 'text-white',
        descColor: 'text-[#B5B5B5]',
        iconColor: 'text-white',
    },
    {
        title: 'Crianças com alertas',
        value: data.com_alertas,
        icon: AlertTriangle,
        titleColor: 'text-gray-800/70',
        valueColor: 'text-orange-700',
        descColor: 'text-orange-700',
        iconColor: 'text-orange-700/70',
    },
    {
        title: 'Casos Revisados',
        value: data.revisados,
        icon: CheckCircle,
        titleColor: 'text-gray-800/70',
        valueColor: 'text-teal-700',
        descColor: 'text-teal-700',
        iconColor: 'text-teal-700/70',
    },
    {
        title: 'Casos Pendentes',
        value: data.total - data.revisados,
        icon: ClockFading,
        titleColor: 'text-gray-800/70',
        valueColor: 'text-purple-900',
        descColor: 'text-purple-700',
        iconColor: 'text-purple-700/70',
    }
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div key={card.title} className={`rounded-xl border ${card.bg} p-5 shadow-sm`}>
                    <div className="flex items-start justify-between">
                       <div>
                            <p className={`${card.titleColor} text-sm font-semibold`}>
                                {card.title}
                            </p>
                            <p className={`${card.valueColor} text-2xl font-bold`}>
                                {card.value}
                            </p>
                        </div>
                        <card.icon className={`w-5 h-5 ${card.iconColor} mt-1`} />
                    </div>
                </div>
            ))}
        </div>
    )
}