'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { summaryApi } from '@/lib/api'
import AlertasCard from '@/components/dashboard/AlertsCard'
import BairroCard from '@/components/dashboard/BairrosCard'
import SummaryCards from '@/components/dashboard/SummaryCards'
import InsightsCard from '@/components/dashboard/InsightCard'
import { MapaCalor } from '@/components/dashboard/MapaCalorWrapper'

export default function DashboardPage() {
  const router = useRouter()
  const [selectedBairro, setSelectedBairro] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['summary'],
    queryFn: summaryApi.get,
  })

  function handleSelectBairro(bairro: string | null) {
    setSelectedBairro(bairro)
    if (bairro) {
      router.push(`/children?bairro=${encodeURIComponent(bairro)}`)
    }
  }

    return (
        <main className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Painel de Acompanhamento
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Visão geral das crianças em situação de vulnerabilidade social
                </p>
            </div>
            <SummaryCards />
            <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Casos com Alertas
                </h2>
                <AlertasCard />
            </div>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BairroCard />
                <InsightsCard />
            </div>
      {data && (
        <div className="mt-6">
          <MapaCalor
            summary={data}
            selectedBairro={selectedBairro ?? undefined}
            onSelectBairro={handleSelectBairro}
          />
        </div>
      )}
        </main>
    )
}