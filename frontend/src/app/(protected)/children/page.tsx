'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChildrenFilters } from '@/types'
import ChildrenFiltersComponent from '@/components/children/ChildrenFilters'
import ChildrenList from '@/components/children/ChildrenList'
import ChildrenCards from '@/components/children/ChildrenCards'
import { Pagination } from '@/components/children/Pagination'
import { ViewToggle } from '@/components/children/ViewToggle'
import { Suspense } from 'react'

function ChildrenPageContent() {
  const searchParams = useSearchParams()
  const [view, setView] = useState<'list' | 'cards'>('list')
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number } | null>(null)

  const [filters, setFilters] = useState<ChildrenFilters>({
    page: 1,
    bairro: searchParams.get('bairro') || undefined,
    alertas: searchParams.get('alertas') !== null
      ? searchParams.get('alertas') === 'true'
      : undefined,
    revisado: searchParams.get('revisado') !== null
      ? searchParams.get('revisado') === 'true'
      : undefined,
  })

  useEffect(() => {
  const saved = localStorage.getItem('children-view') as 'list' | 'cards' | null
  if (saved) {
    setView(saved)
  } else {
    setView(window.innerWidth < 768 ? 'cards' : 'list')
  }
}, [])

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      bairro: searchParams.get('bairro') || undefined,
      alertas: searchParams.get('alertas') !== null
        ? searchParams.get('alertas') === 'true'
        : undefined,
      revisado: searchParams.get('revisado') !== null
        ? searchParams.get('revisado') === 'true'
        : undefined,
    }))
  }, [searchParams])

  function handleViewChange(newView: 'list' | 'cards') {
    setView(newView)
    localStorage.setItem('children-view', newView)
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 overflow-hidden">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Crianças Acompanhadas
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {meta ? `${meta.total} criança${meta.total !== 1 ? 's' : ''} encontrada${meta.total !== 1 ? 's' : ''}` : 'Carregando...'}
            </p>
          </div>
          <ViewToggle view={view} onChange={handleViewChange} />
        </div>
      </div>

      <div className="mb-6">
        <ChildrenFiltersComponent
          filters={filters}
          onChange={(f) => setFilters({ ...f, page: 1 })}
        />
      </div>

      {view === null ? (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-14 rounded bg-gray-100 animate-pulse" />
    ))}
  </div>
) : view === 'list'
  ? <ChildrenList filters={{ ...filters, limit: 10 }} onMetaChange={setMeta} />
  : <ChildrenCards filters={{ ...filters, limit: 9 }} onMetaChange={setMeta} onChange={setFilters} />
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

export default function ChildrenPage() {
  return (
    <Suspense>
      <ChildrenPageContent />
    </Suspense>
  )
}