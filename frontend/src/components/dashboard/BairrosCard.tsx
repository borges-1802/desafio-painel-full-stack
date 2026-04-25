'use client'

import { useQuery } from '@tanstack/react-query'
import { summaryApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function BairroCard() {
    const router = useRouter()
    const { data, isLoading } = useQuery({
        queryKey: ['summary'],
        queryFn: summaryApi.get,
    })

    if (isLoading) {
        return <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
    }

    const chartData = (data?.por_bairro || []).map((b) => ({
        name: b.bairro.length > 12 ? b.bairro.slice(0, 12) + '…' : b.bairro,
        bairroOriginal: b.bairro,
        'Crianças com alertas': b.comAlertas,
    }))

    function handleClick(data: any) {
        if (!data || data.activeIndex === undefined) return
        const item = chartData[Number(data.activeIndex)]
        if (item?.bairroOriginal) {
            router.push(`/children?bairro=${encodeURIComponent(item.bairroOriginal)}`)
        }
    }

    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="font-semibold">Alertas por Bairro</h2>
                    <p className="text-xs text-muted-foreground mt-0.5"> Clique em um bairro para ver as crianças</p>
            </div>

            <ResponsiveContainer width="100%" height={240}>
                <BarChart
                    data={chartData}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    >
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#f1f5f9',
                        }}
                        cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                    <Bar
                        dataKey="Crianças com alertas"
                        radius={[4, 4, 0, 0]}
                        fill="#fdba74"
                        onClick={(data: any) => {
                            if (data?.bairroOriginal) {
                            router.push(`/children?bairro=${encodeURIComponent(data.bairroOriginal)}`)
                            }
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}