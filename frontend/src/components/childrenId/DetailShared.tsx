import { AlertTriangle } from 'lucide-react'

interface NoDadosProps {
  area: string
}

export function NoDados({ area }: NoDadosProps) {
  return <p className="text-sm text-muted-foreground">Sem dados de {area} cadastrados.</p>
}

interface AlertasProps {
  alertas?: string[]
  labels?: Record<string, string>
}

export function Alertas({ alertas, labels = {} }: AlertasProps) {
  if (!alertas?.length) return null

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {alertas.map((alerta) => (
        <span
          key={alerta}
          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200"
        >
          <AlertTriangle className="w-3 h-3" />
          {labels[alerta] || alerta}
        </span>
      ))}
    </div>
  )
}