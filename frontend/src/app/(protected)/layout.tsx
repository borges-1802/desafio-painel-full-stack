'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'

export default function ProtectedLayout({ children, } : { children: React.ReactNode}) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 pt-16 md:pt-0 px-4 md:px-8 py-6">
                    {children}
                </main>
            </div>
        </QueryClientProvider>
    )
}