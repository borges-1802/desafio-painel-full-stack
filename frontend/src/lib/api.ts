import axios from 'axios'
import { ChildrenFilters, ChildrenResponse, Child, Summary, LoginCredentials, LoginResponse, ReviewResponse } from '@/types'
import { getToken, removeToken } from './auth'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 5000,
})

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined') {
            if (error.response?.status === 401) {
                const isLoginRoute = error.config?.url?.includes('/auth/token')
                if (!isLoginRoute) {
                    removeToken()
                    window.location.href = '/login'
                }
            }
        }
        const message =   error.response?.data?.error || error.response?.data?.message || 'Erro desconhecido'
        return Promise.reject(new Error(message))
    }
)

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const { data } = await api.post('/auth/token', credentials)
        return data
    },
}

export const childrenApi = {
    list: async (filters?: ChildrenFilters): Promise<ChildrenResponse> => {
        const params = filters ? {
        ...filters,
        alertas: filters.alertas !== undefined ? String(filters.alertas) : undefined,
        revisado: filters.revisado !== undefined ? String(filters.revisado) : undefined,
        } : undefined
        const { data } = await api.get('/children', { params })
        return data
    },

    getById: async (id: string): Promise<Child> => {
        const { data } = await api.get(`/children/${id}`)
        return data
    },

    review: async (id: string): Promise<ReviewResponse> => {
        const { data } = await api.patch(`/children/${id}/review`)
        return data
    },
}

export const summaryApi = {
    get: async (): Promise<Summary> => {
        const { data } = await api.get('/summary')
        return data
    },
}

export default api