'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, LogOut, User, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { removeToken, useToken } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/children', label: 'Crianças', icon: Users },
]

  
function decodePreferredUsername(token?: string): string | null {
  if (!token) return null
  try {
    const payloadBase64Url = token.split('.')[1]
    if (!payloadBase64Url) return null

    const base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

    const payload = JSON.parse(atob(padded))
    return payload.preferred_username ?? null
  } catch {
    return null
  }
}

function NavContent({ collapsed, onNavigate }: { collapsed?: boolean, onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const token = useToken()
  const email = decodePreferredUsername(token)

    function handleLogout() {
      removeToken()
      router.push('/login')
    }

  return (
    <div className="flex flex-col h-full py-6 px-3">

      <div className={cn('flex items-center gap-2 px-3 mb-8', collapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-lg bg-rio-blue flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">RIO</span>
        </div>
          {!collapsed && <span className="font-semibold text-sm">Painel</span>}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              collapsed && 'justify-center px-2', pathname.startsWith(href)
              ? 'bg-rio-blue text-white font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
            title={collapsed ? label : undefined}>
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-1 mt-auto">
        <div className="border-t mb-3" />

        <ThemeToggle collapsed={collapsed} />

        <div className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground',
          collapsed && 'justify-center px-2'
          )}>
          <User className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="truncate text-xs">{email || 'Técnico'}</span>}
        </div>

        <button
          onClick={handleLogout}
          className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full text-left',
            collapsed && 'justify-center px-2'
          )}
          aria-label="Sair"
          title={collapsed ? 'Sair' : undefined}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Sair'}
        </button>
      </div>

    </div>
  )
}

export default function Sidebar() {
    const [open, setOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    return (
      <>
        <aside className={cn('hidden md:flex flex-col border-r bg-white dark:bg-gray-950 h-screen fixed left-0 top-0 transition-all duration-300',
          collapsed ? 'w-16' : 'w-56')}>
          <NavContent collapsed={collapsed} />

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-8 w-6 h-6 rounded-full border bg-white dark:bg-gray-950 flex items-center justify-center shadow-sm hover:bg-accent transition-colors"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}>
            { collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" /> }
          </button>
        </aside>

        <div className={cn('hidden md:block shrink-0 transition-all duration-300', collapsed ? 'w-16' : 'w-56')} />

        <header className="md:hidden fixed top-0 left-0 right-0 z-20 border-b bg-white dark:bg-gray-950 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rio-blue flex items-center justify-center">
              <span className="text-white text-xs font-bold">RIO</span>
            </div>
              <span className="font-semibold text-sm">Painel Prefeitura</span>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button aria-label="Abrir menu" className="p-2 rounded-lg hover:bg-accent transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="top" className="p-0">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <NavContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
      </header>
    </>
  )
}