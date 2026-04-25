export type AreaStatus = 'ok' | 'alerta' | 'sem_dados'

export interface HealthData {
    ultima_consulta: string | null
    vacinas_em_dia: boolean
    alertas?: string[]
}

export interface EducationData {
    escola: string | null
    frequencia_percent: number | null
    alertas?: string[]
}

export interface SocialData {
    cad_unico: boolean
    beneficio_ativo: boolean
    alertas?: string[]
}

export interface Child {
    id: string
    nome: string
    data_nascimento: string
    bairro: string
    responsavel: string
    saude: HealthData | null
    educacao: EducationData | null
    assistencia_social: SocialData | null
    revisado: boolean
    revisado_por: string | null
    revisado_em: string | null
}

export interface ChildrenResponse {
    data: Child[]
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export interface Summary {
    total: number
    revisados: number
    com_alertas: number
    alertas_por_area: {
        saude: number
        educacao: number
        assistencia_social: number
    }
}

export interface ChildrenFilters {
    bairro?: string
    alertas?: boolean
    revisado?: boolean
    page?: number
    limit?: number
}

export type ChildListItem = {
    id: string
    nome: string
    bairro: string
    responsavel: string
    alertasCount: number
    areas: {
        saude: AreaStatus
        educacao: AreaStatus
        assistencia_social: AreaStatus
    }
    revisado: boolean
    revisado_em: string | null
}

export interface LoginCredentials {
    email: string
    senha: string
}

export interface LoginResponse {
    token: string
}

export interface ReviewResponse {
    message: string
    data: Child
}

export interface AlertaDetalhe {
  alerta: string
  total: number
}

export interface Summary {
  total: number
  revisados: number
  com_alertas: number
  alertas_por_area: {
    saude: number
    educacao: number
    assistencia_social: number
  }
  detalhes_alertas: {
    saude: AlertaDetalhe[]
    educacao: AlertaDetalhe[]
    assistencia_social: AlertaDetalhe[]
  }
}