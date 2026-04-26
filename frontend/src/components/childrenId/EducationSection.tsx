import { BookOpen } from 'lucide-react'
import type { Child } from '@/types'
import { Alertas, NoDados } from './DetailShared'

type Props = {
  educacao: Child['educacao']
  alertLabels: Record<string, string>
}

export function EducationSection({ educacao, alertLabels }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-teal-600/10 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-teal-600" />
        </div>
        <h2 className="font-semibold text-card-foreground">Educação</h2>
        {educacao?.alertas?.length ? (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs border border-destructive/20">
            {educacao.alertas.length} alerta{educacao.alertas.length !== 1 ? 's' : ''}
          </span>
        ) : null}
      </div>

      {!educacao ? (
        <NoDados area="educação" />
      ) : (
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Escola:</span> {educacao.escola || 'Não informada'}</p>
          <p>
            <span className="text-muted-foreground">Frequência:</span>{' '}
            {educacao.frequencia_percent !== null ? `${educacao.frequencia_percent}%` : 'Não informada'}
          </p>
          <Alertas alertas={educacao.alertas} labels={alertLabels} />
        </div>
      )}
    </div>
  )
}