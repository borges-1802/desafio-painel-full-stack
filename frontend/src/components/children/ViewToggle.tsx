'use client'

import { LayoutList, LayoutGrid } from 'lucide-react'

interface Props {
  view: 'list' | 'cards'
  onChange: (view: 'list' | 'cards') => void
}

export function ViewToggle({ view, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <button
        onClick={() => onChange('list')}
        className={`p-1.5 rounded-md transition-colors ${
          view === 'list' ? 'bg-rio-blue text-white'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
        aria-label="Visualização em lista"
      >
        <LayoutList className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange('cards')}
        className={`p-1.5 rounded-md transition-colors ${
          view === 'cards'
            ? 'bg-rio-blue text-white'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
        aria-label="Visualização em cards"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  )
}