'use client'

import dynamic from 'next/dynamic'
import type { Summary } from '@/types'

const MapaCalorCliente = dynamic(
  () => import('./MapaCalorLeaflet'),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-1">Mapa de Calor por Bairro</h2>
        <div className="h-80 flex items-center justify-center text-muted-foreground text-sm animate-pulse">
          Carregando mapa...
        </div>
      </div>
    )
  }
)

interface Props {
  summary: Summary
  selectedBairro?: string
  onSelectBairro?: (bairro: string | null) => void
}

export function MapaCalor({ summary, selectedBairro, onSelectBairro }: Props) {
  return <MapaCalorCliente summary={summary} selectedBairro={selectedBairro} onSelectBairro={onSelectBairro} />
}