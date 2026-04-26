'use client'

import { CheckCircle, Clock } from 'lucide-react'

interface Props {
    revisado: boolean
    revisadoPor?: string | null
    revisadoEm?: string | null
}

export function ReviewCard({ revisado, revisadoPor, revisadoEm, }: Props) {
    return (
        <div className={`rounded-xl border p-5 flex items-center gap-3
            ${revisado ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}
            `}>
            {revisado ? ( <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />) : (
            <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
            )}
            <div>
                <p className={`text-sm font-semibold ${ revisado ? 'text-green-800' : 'text-orange-800'}`}>
                    {revisado ? 'Caso revisado' : 'Pendente de revisão'}
                </p>

                {revisado && revisadoPor && revisadoEm && (
                <p className="text-xs text-green-700 mt-0.5">
                    Revisado por <strong>{revisadoPor}</strong> em{' '}
                    {new Date(revisadoEm).toLocaleDateString('pt-BR')}
                </p>
                )}

                {!revisado && (
                <p className="text-xs text-orange-700 mt-0.5">
                    Verifique os dados abaixo antes de confirmar
                </p>
                )}
            </div>
        </div>
    )
}