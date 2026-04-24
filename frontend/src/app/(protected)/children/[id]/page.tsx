'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { childrenApi } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const ALERT_LABELS: Record<string, string> = {
  vacinas_atrasadas: 'Vacinas atrasadas',
  consulta_atrasada: 'Consulta atrasada',
  frequencia_baixa: 'Frequência baixa',
  matricula_pendente: 'Matrícula pendente',
  beneficio_suspenso: 'Benefício suspenso',
  cadastro_ausente: 'Cadastro ausente',
  cadastro_desatualizado: 'Cadastro desatualizado',
}

function calcularIdade(dataNascimento: string) {
  const hoje = new Date()
  const nascimento = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const m = hoje.getMonth() - nascimento.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--
  return idade
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
    <main className="max-w-3xl mx-auto px-4 py-8">

      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{child.nome}</h1>
          <p className="text-muted-foreground text-sm">
            {calcularIdade(child.data_nascimento)} anos - {child.bairro} - Resp: {child.responsavel}
          </p>
        </div>
      </div>

      <div className={`rounded-xl border p-4 mb-6 flex items-center justify-between ${child.revisado ? 'bg-teal-50 border-teal-200' : 'bg-orange-50 border-orange-200'}`}>
        <div className="flex items-center gap-2">
          {child.revisado
            ? <CheckCircle className="w-5 h-5 text-teal-600" />
            : <Clock className="w-5 h-5 text-orange-600" />
          }
          <div>
            <p className={`text-sm font-semibold ${child.revisado ? 'text-teal-800' : 'text-orange-800'}`}>
              {child.revisado ? 'Caso revisado' : 'Pendente de revisão'}
            </p>
            {child.revisado && child.revisado_por && (
              <p className="text-xs text-teal-600">
                Por {child.revisado_por} em {new Date(child.revisado_em!).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>
        {!child.revisado && (
          <Button
            onClick={() => review()}
            disabled={isPending}
            className="bg-rio-blue hover:bg-rio-blue-mid"
          >
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : 'Marcar como revisado'}
          </Button>
        )}
      </div>

      <div className="space-y-4">

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-3">Saúde</h2>
          {child.saude ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Última consulta:</span> {new Date(child.saude.ultima_consulta!).toLocaleDateString('pt-BR')}</p>
              <p><span className="text-muted-foreground">Vacinas em dia:</span> {child.saude.vacinas_em_dia ? 'Sim' : 'Não'}</p>
              {child.saude.alertas && child.saude.alertas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {child.saude.alertas.map(a => (
                    <span key={a} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                      <AlertTriangle className="w-3 h-3" />
                      {ALERT_LABELS[a] || a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados de saúde cadastrados.</p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-3">Educação</h2>
          {child.educacao ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Escola:</span> {child.educacao.escola || 'Não informada'}</p>
              <p><span className="text-muted-foreground">Frequência:</span> {child.educacao.frequencia_percent !== null ? `${child.educacao.frequencia_percent}%` : 'Não informada'}</p>
              {child.educacao.alertas && child.educacao.alertas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {child.educacao.alertas.map(a => (
                    <span key={a} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                      <AlertTriangle className="w-3 h-3" />
                      {ALERT_LABELS[a] || a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados de educação cadastrados.</p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-3">Assistência Social</h2>
          {child.assistencia_social ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">CAD Único:</span> {child.assistencia_social.cad_unico ? 'Sim' : 'Não'}</p>
              <p><span className="text-muted-foreground">Benefício ativo:</span> {child.assistencia_social.beneficio_ativo ? 'Sim' : 'Não'}</p>
              {child.assistencia_social.alertas && child.assistencia_social.alertas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {child.assistencia_social.alertas.map(a => (
                    <span key={a} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                      <AlertTriangle className="w-3 h-3" />
                      {ALERT_LABELS[a] || a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados de assistência social cadastrados.</p>
          )}
        </div>

      </div>
    </main>
  )
}