import { Child, ChildListItem, AreaStatus } from '@/types'

function getAreaStatus(area: any): AreaStatus {
  if (!area) return 'sem_dados'
  if (area.alertas?.length > 0) return 'alerta'
  return 'ok'
}

function countAlertas(child: Child): number {
  return (
    (child.saude?.alertas?.length || 0) +
    (child.educacao?.alertas?.length || 0) +
    (child.assistencia_social?.alertas?.length || 0)
  )
}

export function toChildListItem(child: Child): ChildListItem {
  return {
    id: child.id,
    nome: child.nome,
    bairro: child.bairro,
    responsavel: child.responsavel,
    alertasCount: countAlertas(child),
    areas: {
      saude: getAreaStatus(child.saude),
      educacao: getAreaStatus(child.educacao),
      assistencia_social: getAreaStatus(child.assistencia_social),
    },
    revisado: child.revisado,
    revisado_em: child.revisado_em,
  }
}