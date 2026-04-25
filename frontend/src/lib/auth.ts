import { useSyncExternalStore } from 'react'

export const TOKEN_COOKIE = 'token'

const noopSubscribe = () => () => {}

export function useToken() {
    return useSyncExternalStore(noopSubscribe, getToken, () => undefined)
}

export function getToken(): string | undefined {
    if (typeof window === 'undefined') return undefined
    const cookie = document.cookie.split('; ').find(c => c.startsWith(`${TOKEN_COOKIE}=`))
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
}

export function setToken(token: string) {
    if (typeof window === 'undefined') return
    document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${60 * 60 * 8}; SameSite=Strict`
}

export function removeToken() {
    if (typeof window === 'undefined') return
    document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`
}

export function hasToken(): boolean {
    if (typeof window === 'undefined') return false
    return document.cookie.split('; ').some(c => c.startsWith(`${TOKEN_COOKIE}=`))
}