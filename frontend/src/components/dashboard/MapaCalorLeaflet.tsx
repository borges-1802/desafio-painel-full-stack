'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import type { Summary } from '@/types'
import { arcgisToGeoJSON } from '@esri/arcgis-to-geojson-utils'

declare global {
  interface Window {
    L: any
  }
}

interface Props {
  summary: Summary
  selectedBairro?: string
  onSelectBairro?: (bairro: string | null) => void
}

function normalizar(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function getColor(alertas: number, total: number): string {
  if (total === 0) return '#ffffff'
  const pct = alertas / total
  if (pct === 0) return '#ffffff'
  if (pct <= 0.5) return '#ca8a04'
  if (pct <= 0.75) return '#ea580c'
  return '#dc2626'
}

const escala = [
  { cor: '#dc2626', label: '+75% com alertas' },
  { cor: '#ea580c', label: '51–75%' },
  { cor: '#ca8a04', label: '26–50%' },
]

let cachedGeoJson: any = null

const geoJsonPromise = fetch(
  'https://pgeo3.rio.rj.gov.br/arcgis/rest/services/Cartografia/Limites_administrativos/MapServer/4/query?where=1%3D1&outFields=*&outSR=4326&f=json'
).then(res => res.json()).then(data => arcgisToGeoJSON(data))

async function fetchBairros() {
  if (cachedGeoJson) return cachedGeoJson
  cachedGeoJson = await geoJsonPromise
  return cachedGeoJson
}

export default function MapaCalorCliente({ summary, selectedBairro, onSelectBairro, }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const geoLayerRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)

  const bairroMap = useMemo(() => {
    return new Map(
      summary.por_bairro.map((b) => [normalizar(b.bairro), b])
    )}, [summary])

  const alertasPorBairro = useMemo(() => {
    const map = new Map<string, Record<string, number>>()
    summary.por_bairro.forEach(b => {
      map.set(normalizar(b.bairro), b.alertas || {})
    })
    return map
  }, [summary])

  function getStyle(feature: any) {
    const nome = feature?.properties?.nome || feature?.properties?.NOME || ''
    const key = normalizar(nome)

    const dados = bairroMap.get(key) ?? { total: 0, comAlertas: 0 }
    const isSelected = selectedBairro && normalizar(selectedBairro) === key
    const pct = dados.total > 0 ? dados.comAlertas / dados.total : 0

    return {
    fillColor: getColor(dados.comAlertas, dados.total),
    fillOpacity: dados.total > 0 ? 0.75 : 0.1,
    color: isSelected ? '#2563eb' : dados.total === 0 ? '#94a3b8' : pct > 0.7 ? '#dc2626' : '#1e293b',
    weight: isSelected ? 3 : dados.total === 0 ? 0.5 : pct > 0.7 ? 2 : 0.5,
    }
  }

  useEffect(() => {
    if (!mapRef.current) return
    if (mapInstanceRef.current) return
    if (!window.L) return

    const L = window.L
    const isMobile = window.innerWidth < 768

    const map = L.map(mapRef.current, {
      center: isMobile ? [-22.88, -43.25] : [-22.9, -43.45],
      zoom: isMobile ? 12 : 11,
      scrollWheelZoom: false,
    })

    mapInstanceRef.current = map

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; CARTO' }
    ).addTo(map)

    const handleResize = () => map.invalidateSize()
    window.addEventListener('resize', handleResize)

    async function load() {
      const geojson = await fetchBairros()

      const layer = L.geoJSON(geojson, {
        style: (feature: any) => getStyle(feature),

        onEachFeature: (feature: any, layer: any) => {
          const nome = feature?.properties?.nome || feature?.properties?.NOME || ''
          const key = normalizar(nome)

          const dados = bairroMap.get(key) ?? { total: 0, comAlertas: 0 }

          const pct = dados.total > 0 ? Math.round((dados.comAlertas / dados.total) * 100) : 0

          const alertas = alertasPorBairro.get(key) || {}

          const topAlertas = Object.entries(alertas).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3)

          layer.bindTooltip(
            `<div style="font-size:12px;line-height:1.7;min-width:160px">
              <strong>${nome}</strong><br/>
              ${
                dados.total > 0
                  ? `${dados.total} crianças · ${dados.comAlertas} com alerta (${pct}%)`
                  : '<span style="color:#94a3b8">Sem dados</span>'
              }
              ${
                topAlertas.length
                  ? `<div style="margin-top:6px">
                      <strong>Principais alertas:</strong><br/>
                      ${topAlertas
                        .map(([a, v]) => `• ${a.replace(/_/g, ' ')} (${v})`)
                        .join('<br/>')}
                    </div>`
                  : ''
              }
            </div>`,
            { sticky: true }
          )

          layer.on('click', () => {
            if (dados.total === 0) return
            const isSame = selectedBairro && normalizar(selectedBairro) === key
            onSelectBairro?.(isSame ? null : nome)
          })

          layer.on('mouseover', () => {
            if (dados.total > 0) {
              layer.setStyle({fillOpacity: 0.9, weight: 2, color: '#2563eb'})
            }
          })

          layer.on('mouseout', () => {
            layer.setStyle(getStyle(feature))
          })
        },
      }).addTo(map)

      geoLayerRef.current = layer
      setLoading(false)
    }

    load()

    return () => {
      map.remove()
      geoLayerRef.current = null
      mapInstanceRef.current = null
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (!geoLayerRef.current) return

    geoLayerRef.current.eachLayer((layer: any) => {
      layer.setStyle(getStyle(layer.feature))
    })
  }, [selectedBairro, summary])

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold">Mapa de Calor por Bairro</h2>

      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {selectedBairro ? `Filtrando: ${selectedBairro}` : 'Clique em um bairro para ver detalhes'}
      </p>

      <div
        className="relative rounded-lg overflow-hidden"
        style={{ height: 'clamp(280px, 50vw, 400px)' }}
      >
        <div ref={mapRef} className="w-full h-full" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <p className="text-sm animate-pulse">Carregando mapa...</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {escala.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="w-3.5 h-3.5 rounded-sm"
              style={{ backgroundColor: item.cor }}
            />
            <span className="text-xs text-muted-foreground">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}