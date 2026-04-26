'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  collapsed?: boolean
}

export function ThemeToggle({ collapsed }: Props) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full',
        collapsed && 'justify-center px-2'
      )}
      aria-label="Alternar tema"
      title={collapsed ? 'Alternar tema' : undefined}
    >
      {theme === 'dark'
        ? <Sun className="w-4 h-4 shrink-0" />
        : <Moon className="w-4 h-4 shrink-0" />
      }
      {!collapsed && <span className="text-sm">Tema</span>}
    </button>
  )
}