export const TOKEN_COOKIE = 'token'

export function getToken(): string | undefined {
    const cookie = document.cookie.split('; ').find(c => c.startsWith(`${TOKEN_COOKIE}=`))
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
}

export function setToken(token: string) {
    document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${60 * 60 * 8}; SameSite=Strict`
}

export function removeToken() {
    document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`
}

export function hasToken(): boolean {
    return document.cookie.split('; ').some(c => c.startsWith(`${TOKEN_COOKIE}=`))
}