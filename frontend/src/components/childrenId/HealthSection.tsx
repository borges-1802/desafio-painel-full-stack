import { HeartPulse } from 'lucide-react'
import type { Child } from '@/types'
import { Alertas, NoDados } from './DetailShared'

type Props = {
    saude: Child['saude']
    alertLabels: Record<string, string>
}

export function HealthSection({ saude, alertLabels }: Props) {
    return (
        <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <HeartPulse className="w-4 h-4 text-blue-500" />
                </div>
                <h2 className="font-semibold text-card-foreground">Saúde</h2>
                {saude?.alertas?.length ? (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs border border-destructive/20">
                    {saude.alertas.length} alerta{saude.alertas.length !== 1 ? 's' : ''}
                </span>
                ) : null}
            </div>

            {!saude ? (
                <NoDados area="saúde" />
                ) : (
                    <div className="space-y-2 text-sm">
                        <p>
                            <span className="text-muted-foreground">Última consulta:</span>{' '}
                            {saude.ultima_consulta ? new Date(saude.ultima_consulta).toLocaleDateString('pt-BR') : 'Não informada'}
                        </p>
                        <p>
                            <span className="text-muted-foreground">Vacinas em dia:</span> {saude.vacinas_em_dia ? 'Sim' : 'Não'}
                        </p>
                        <Alertas alertas={saude.alertas} labels={alertLabels} />
                    </div>
            )}
        </div>
    )
}