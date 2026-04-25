import AlertasCard from '@/components/dashboard/AlertsCard'
import SummaryCards from '@/components/dashboard/SummaryCards'

export default function DashboardPage() {
    return (
        <main className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Painel de Acompanhamento
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Visão geral das crianças em situação de vulnerabilidade social
                </p>
            </div>
            <SummaryCards />
            <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Casos com Alertas
                </h2>
                <AlertasCard />
            </div>
        </main>
    )
}