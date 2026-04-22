'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(1, 'Senha obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) router.replace('/dashboard')
    }, [router])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })

    async function onSubmit(values: LoginForm) {
        try {
        setError(null)
        const { token } = await authApi.login(values)
        localStorage.setItem('token', token)
        router.replace('/dashboard')
        } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao fazer login')
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-200 dark:bg-gray-950">
            <div className="w-full bg-rio-blue">
                <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow">
                        <span className="text-[#005B9A] font-bold text-xs">RIO</span>
                    </div>
                <div>
                    <p className="text-white font-bold text-sm leading-tight">PREFEITURA</p>
                    <p className="text-white/80 text-xs">Rio de Janeiro</p>
                </div>
                </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Entrar no Painel</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Sistema de monitoramento de crianças em vulnerabilidade social
                        </p>
                    </div>

                    <Card className="overflow-hidden">
                        <CardHeader className="px-8 py-2 pb-0 rounded-none">
                            <p className="text-rio-blue font-bold text-xl tracking-wide">Acesso restrito</p>
                        </CardHeader>

                        <CardContent className="px-8 py-2">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="sr-only">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="E-mail"
                                        disabled={isSubmitting}
                                        {...register('email')}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">{errors.email.message}</p>
                                    )}
                                    </div>

                                    <div className="space-y-1.5">
                                    <Label htmlFor="senha" className="sr-only">Senha</Label>
                                    <div className="relative">
                                        <Input
                                        id="senha"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Senha"
                                        disabled={isSubmitting}
                                        {...register('senha')}
                                        />
                                        <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                        >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.senha && (
                                        <p className="text-xs text-destructive">{errors.senha.message}</p>
                                    )}
                                </div>

                                {error && (
                                <div role="alert" className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                    <span>⚠</span>
                                    <span>{error}</span>
                                </div>
                                )}

                                <Button
                                type="submit"
                                className="w-full bg-rio-blue hover:bg-rio-blue-mid shadow-md"
                                disabled={isSubmitting}
                                >
                                {isSubmitting
                                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Entrando...</>
                                    : 'Entrar'
                                }
                                </Button>

                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Em caso de problemas de acesso, contate o administrador do sistema.
                                </p>

                            </form>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
                    Prefeitura do Rio de Janeiro · Uso restrito a servidores autorizados
                    </p>
                </div>
            </div>
        </div>
    )
}