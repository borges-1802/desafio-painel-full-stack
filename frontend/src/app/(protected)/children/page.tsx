'use client'

import { useState } from 'react'
import { ChildrenFilters } from '@/types'
import ChildrenFiltersComponent from '@/components/children/ChildrenFilters'
import ChildrenList from '@/components/children/ChildrenList'
import { Pagination } from '@/components/children/Pagination'
import { useQuery } from '@tanstack/react-query'
import { childrenApi } from '@/lib/api'

export default function ChildrenPage() {
  const [filters, setFilters] = useState<ChildrenFilters>({ page: 1, limit: 10 })

  const { data } = useQuery({
    queryKey: ['children', filters],
    queryFn: () => childrenApi.list(filters),
  })

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Crianças Acompanhadas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data ? `${data.meta.total} criança${data.meta.total !== 1 ? 's' : ''} encontrada${data.meta.total !== 1 ? 's' : ''}` : 'Carregando...'}
        </p>
      </div>

      <div className="mb-6">
        <ChildrenFiltersComponent
          filters={filters}
          onChange={(f) => setFilters({ ...f, page: 1 })}
        />
      </div>

      <ChildrenList filters={filters} />

      {data && data.meta.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </div>
      )}
    </main>
  )
}