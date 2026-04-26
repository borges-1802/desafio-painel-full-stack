'use client'

import { useState, useEffect } from 'react'
import { ChildrenFilters } from '@/types'
import { Filter, X, Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const BAIRROS = [ 'Complexo do Alemão', 'Jacarezinho', 'Maré', 'Mangueira', 'Rocinha' ]

const TIPOS_ALERTA = [
  { value: 'vacinas_atrasadas', label: 'Vacinas atrasadas' },
  { value: 'consulta_atrasada', label: 'Consulta atrasada' },
  { value: 'frequencia_baixa', label: 'Frequência baixa' },
  { value: 'matricula_pendente', label: 'Matrícula pendente' },
  { value: 'beneficio_suspenso', label: 'Benefício suspenso' },
  { value: 'cadastro_ausente', label: 'Cadastro ausente' },
  { value: 'cadastro_desatualizado', label: 'Cadastro desatualizado' },
]

interface Props {
  filters: ChildrenFilters
  onChange: (filters: ChildrenFilters) => void
}

export default function ChildrenFiltersComponent({ filters, onChange }: Props) {
  const [nomeInput, setNomeInput] = useState(filters.nome ?? '')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (nomeInput !== (filters.nome ?? '')) {
        onChange({ ...filters, nome: nomeInput || undefined, page: 1 })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [nomeInput])

  useEffect(() => {
    setNomeInput(filters.nome ?? '')
  }, [filters.nome])

  const activeCount = [
    (filters.nome ?? '') !== '',
    !!filters.bairro,
    filters.alertas !== undefined,
    filters.revisado !== undefined,
    !!filters.area,
    !!filters.faixaEtaria,
    !!filters.tipoAlerta,
  ].filter(Boolean).length

  function reset() {
    setNomeInput('')
    onChange({ page: 1, limit: filters.limit })
  }

  const tags = [
    filters.bairro && { label: `Bairro: ${filters.bairro}`, key: 'bairro' as keyof ChildrenFilters },
    filters.alertas !== undefined && { label: filters.alertas ? 'Com alertas' : 'Sem alertas', key: 'alertas' as keyof ChildrenFilters },
    filters.revisado !== undefined && { label: filters.revisado ? 'Revisados' : 'Pendentes', key: 'revisado' as keyof ChildrenFilters },
    filters.area && { label: `Área: ${filters.area}`, key: 'area' as keyof ChildrenFilters },
    filters.faixaEtaria && { label: `Idade: ${filters.faixaEtaria} anos`, key: 'faixaEtaria' as keyof ChildrenFilters },
    filters.tipoAlerta && { label: `Alerta: ${TIPOS_ALERTA.find(t => t.value === filters.tipoAlerta)?.label || filters.tipoAlerta}`, key: 'tipoAlerta' as keyof ChildrenFilters },
    filters.nome && { label: `Nome: ${filters.nome}`, key: 'nome' as keyof ChildrenFilters },
  ].filter(Boolean) as { label: string; key: keyof ChildrenFilters }[]

  return (
    <div className="bg-card border border-border rounded-xl p-4">

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="w-4 h-4 text-muted-foreground" />
          Filtros
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rio-blue text-white text-xs font-medium">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" /> Limpar
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-3 items-end">
        <div className="space-y-1 flex-1">
          <label className="text-xs font-medium text-muted-foreground">Nome</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={nomeInput}
              onChange={(e) => setNomeInput(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full pl-8 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="space-y-1 w-36">
          <label className="text-xs font-medium text-muted-foreground">Ordenar</label>
          <Select
            value={`${filters.orderBy || 'none'}-${filters.orderDir || 'none'}`}
            onValueChange={(v) => {
              const [orderBy, orderDir] = v.split('-')
              onChange({
                ...filters,
                orderBy: orderBy === 'none' ? undefined : orderBy,
                orderDir: orderDir === 'none' ? undefined : orderDir as 'asc' | 'desc',
                page: 1,
              })
            }}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Padrão" /></SelectTrigger>
            <SelectContent 
  className="w-[--radix-select-trigger-width] [&_[role=option]:hover]:bg-blue-300 [&_[role=option]:hover]:text-white" 
  position="popper" 
  sideOffset={0} 
  avoidCollisions={false}
>
              <SelectItem value="none-none">Padrão</SelectItem>
              <SelectItem value="nome-asc">Nome: A → Z</SelectItem>
              <SelectItem value="nome-desc">Nome: Z → A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Bairro</label>
          <Select
            value={filters.bairro || 'todos'}
            onValueChange={(v) => onChange({ ...filters, bairro: v === 'todos' ? undefined : v, page: 1 })}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent 
  className="w-[--radix-select-trigger-width] [&_[role=option]:hover]:bg-blue-300 [&_[role=option]:hover]:text-white" 
  position="popper" 
  sideOffset={0} 
  avoidCollisions={false}
>
              <SelectItem value="todos">Todos</SelectItem>
              {BAIRROS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Faixa etária</label>
          <Select
            value={filters.faixaEtaria || 'todos'}
            onValueChange={(v) => onChange({ ...filters, faixaEtaria: v === 'todos' ? undefined : v, page: 1 })}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent 
  className="w-[--radix-select-trigger-width] [&_[role=option]:hover]:bg-blue-300 [&_[role=option]:hover]:text-white" 
  position="popper" 
  sideOffset={0} 
  avoidCollisions={false}
>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="0-5">0–5 anos</SelectItem>
              <SelectItem value="6-12">6–12 anos</SelectItem>
              <SelectItem value="13-17">13–17 anos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Alertas</label>
          <Select
            value={filters.alertas !== undefined ? String(filters.alertas) : 'todos'}
            onValueChange={(v) => onChange({ ...filters, alertas: v === 'todos' ? undefined : v === 'true', page: 1 })}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent 
  className="w-[--radix-select-trigger-width] [&_[role=option]:hover]:bg-blue-300 [&_[role=option]:hover]:text-white" 
  position="popper" 
  sideOffset={0} 
  avoidCollisions={false}
>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="true">Com alertas</SelectItem>
              <SelectItem value="false">Sem alertas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Área de alerta</label>
          <Select
            value={filters.area || 'todos'}
            onValueChange={(v) => onChange({ ...filters, area: v === 'todos' ? undefined : v, page: 1 })}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder="Todas" /></SelectTrigger>
            <SelectContent 
  className="w-[--radix-select-trigger-width] [&_[role=option]:hover]:bg-blue-300 [&_[role=option]:hover]:text-white" 
  position="popper" 
  sideOffset={0} 
  avoidCollisions={false}
>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="saude">Saúde</SelectItem>
              <SelectItem value="educacao">Educação</SelectItem>
              <SelectItem value="assistencia">Assistência</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Tipo de alerta</label>
          <Select
            value={filters.tipoAlerta || 'todos'}
            onValueChange={(v) => onChange({ ...filters, tipoAlerta: v === 'todos' ? undefined : v, page: 1 })}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent 
  className="w-[--radix-select-trigger-width] [&_[role=option]:hover]:bg-blue-300 [&_[role=option]:hover]:text-white" 
  position="popper" 
  sideOffset={0} 
  avoidCollisions={false}
>
              <SelectItem value="todos">Todos</SelectItem>
              {TIPOS_ALERTA.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Revisão</label>
          <Select
            value={filters.revisado !== undefined ? String(filters.revisado) : 'todos'}
            onValueChange={(v) => onChange({ ...filters, revisado: v === 'todos' ? undefined : v === 'true', page: 1 })}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder="Todos" /></SelectTrigger>
            <SelectContent 
  className="w-[--radix-select-trigger-width] [&_[role=option]:hover]:bg-blue-300 [&_[role=option]:hover]:text-white" 
  position="popper" 
  sideOffset={0} 
  avoidCollisions={false}
>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="false">Pendentes</SelectItem>
              <SelectItem value="true">Revisados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t">
          {tags.map((tag) => (
            <span
              key={tag.key}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rio-blue/10 text-rio-blue text-xs"
            >
              {tag.label}
              <button
                onClick={() => onChange({ ...filters, [tag.key]: undefined, page: 1 })}
                className="hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

    </div>
  )
}