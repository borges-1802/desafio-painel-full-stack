'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  const pages: (number | '...')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)

    if (currentPage > 3) pages.push('...')

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i)
    }

    if (currentPage < totalPages - 2) pages.push('...')

    pages.push(totalPages)
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages) return
    onPageChange(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col items-center mt-6">
      <nav className="flex items-center justify-center gap-1" aria-label="Paginação">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 rounded-md border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((page, i) =>
          page === '...' ? (
            <span key={i} className="w-9 h-9 flex items-center justify-center text-sm">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-9 h-9 rounded-md border text-sm font-medium transition-all ${
                page === currentPage
                  ? 'bg-rio-blue text-white scale-105 shadow-sm'
                  : 'hover:bg-accent hover:scale-105'
              }`}
              aria-label={`Ir para página ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 rounded-md border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition"
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>

      <p className="text-xs text-muted-foreground mt-2">
        Página {currentPage} de {totalPages}
      </p>
    </div>
  )
}