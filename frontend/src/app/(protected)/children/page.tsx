'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChildrenFilters } from '@/types'
import ChildrenFiltersComponent from '@/components/children/ChildrenFilters'
import ChildrenList from '@/components/children/ChildrenList'
import ChildrenCards from '@/components/children/ChildrenCards'
import { Pagination } from '@/components/children/Pagination'

export default function ChildrenPage() {
  const searchParams = useSearchParams()
  const [view, setView] = useState<'list' | 'cards'>('list')
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number } | null>(null)

  const [filters, setFilters] = useState<ChildrenFilters>({
    page: 1,
    limit: 10,
    bairro: searchParams.get('bairro') || undefined,
  })

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      bairro: searchParams.get('bairro') || undefined,
    }))
  }, [searchParams])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Crianças Acompanhadas
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {meta ? `${meta.total} criança${meta.total !== 1 ? 's' : ''} encontrada${meta.total !== 1 ? 's' : ''}` : 'Carregando...'}
            </p>
          </div>
         
        </div>
      </div>

      <div className="mb-6">
        <ChildrenFiltersComponent
          filters={filters}
          onChange={(f) => setFilters({ ...f, page: 1 })}
        />
      </div>

      {view === 'list'
        ? <ChildrenList filters={filters} onMetaChange={setMeta} onChange={setFilters}/>
        : <ChildrenCards filters={filters} onMetaChange={setMeta} />
      }

      {meta && meta.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </div>
      )}
    </main>
  )
}