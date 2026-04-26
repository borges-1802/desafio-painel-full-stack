'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { childrenApi } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Loader2, MapPin, User } from 'lucide-react'
import { toast } from 'sonner'
import { calcularIdade } from '@/lib/utils'
import { SocialSection } from '@/components/childrenId/SocialSection'
import { EducationSection } from '@/components/childrenId/EducationSection'
import { HealthSection } from '@/components/childrenId/HealthSection'
import { ReviewCard } from '@/components/childrenId/ReviewSection'
import { ReviewActionCard } from '@/components/childrenId/ReviewActionCard'

const ALERT_LABELS: Record<string, string> = {
  vacinas_atrasadas: 'Vacinas atrasadas',
  consulta_atrasada: 'Consulta atrasada',
  frequencia_baixa: 'Frequência baixa',
  matricula_pendente: 'Matrícula pendente',
  beneficio_suspenso: 'Benefício suspenso',
  cadastro_ausente: 'Cadastro ausente',
  cadastro_desatualizado: 'Cadastro desatualizado',
}

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: child, isLoading, isError } = useQuery({
    queryKey: ['child', id],
    queryFn: () => childrenApi.getById(id),
  })

  const { mutate: review, isPending } = useMutation({
    mutationFn: () => childrenApi.review(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child', id] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['children'] })
      toast.success('Caso marcado como revisado!')
    },
    onError: () => {
      toast.error('Erro ao revisar caso.')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !child) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-destructive">Criança não encontrada.</p>
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar
      </button>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg text-primary">
              {child.nome.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold">{child.nome}</h1>

              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {calcularIdade(child.data_nascimento)} anos
                </span>

                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {child.bairro}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Responsável: {child.responsavel}
                </span>

              </div>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            {(() => {
              const totalAlertas =
                (child.saude?.alertas?.length ?? 0) + (child.educacao?.alertas?.length ?? 0) + (child.assistencia_social?.alertas?.length ?? 0)
              if (totalAlertas === 0) return null

              return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                  ⚠ {totalAlertas} alerta{totalAlertas !== 1 ? 's' : ''}
                </span>
              )
            })()}
          </div>
        </div>
      </div>

      <ReviewCard revisado={child.revisado} revisadoPor={child.revisado_por} revisadoEm={child.revisado_em}/>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthSection saude={child.saude} alertLabels={ALERT_LABELS} />
        <EducationSection educacao={child.educacao} alertLabels={ALERT_LABELS} />
        <SocialSection assistenciaSocial={child.assistencia_social} alertLabels={ALERT_LABELS} />
      </div>

      {!child.revisado && (<ReviewActionCard onReview={review} isLoading={isPending}/>)}

    </main>
  )
}