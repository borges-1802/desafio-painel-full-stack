import { HandHeart, ShieldCheck, Gift } from 'lucide-react'
import type { Child } from '@/types'
import { Alertas, NoDados } from './DetailShared'

type Props = {
    assistenciaSocial: Child['assistencia_social']
    alertLabels: Record<string, string>
}

function BoolBadge({ value, trueLabel, falseLabel }: { value: boolean; trueLabel: string; falseLabel: string }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${ value
            ? 'bg-green-500/10 text-green-600 border-green-500/20'
            : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
            }`}>
            {value ? trueLabel : falseLabel}
        </span>
    )
}

export function SocialSection({ assistenciaSocial, alertLabels }: Props) {
    return (
        <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <HandHeart className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="font-semibold text-card-foreground">Assist. Social</h2>
                {assistenciaSocial?.alertas?.length ? (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs border border-destructive/20">
                    {assistenciaSocial.alertas.length} alerta{assistenciaSocial.alertas.length !== 1 ? 's' : ''}
                </span>
                ) : null}
            </div>

            {!assistenciaSocial ? (
            <NoDados area="assistência social" />
            ) : (
            <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs text-muted-foreground">CAD Único</p>
                        <div className="mt-1">
                            <BoolBadge value={assistenciaSocial.cad_unico} trueLabel="Regular" falseLabel="Não cadastrado" />
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-2 text-sm">
                    <Gift className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs text-muted-foreground">Benefício</p>
                        <div className="mt-1">
                            <BoolBadge value={assistenciaSocial.beneficio_ativo} trueLabel="Ativo" falseLabel="Inativo" />
                        </div>
                    </div>
                </div>
                <Alertas alertas={assistenciaSocial.alertas} labels={alertLabels} />
            </div>
            )}
        </div>
    )
}