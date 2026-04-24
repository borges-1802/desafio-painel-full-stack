'use client'

import { ChildrenFilters } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const BAIRROS = ['Rocinha', 'Maré', 'Jacarezinho', 'Complexo do Alemão', 'Mangueira']

interface Props {
  filters: ChildrenFilters
  onChange: (filters: ChildrenFilters) => void
}

export default function ChildrenFiltersComponent({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">

      <Select
        value={filters.bairro || 'todos'}
        onValueChange={(v) => onChange({ ...filters, bairro: v === 'todos' ? undefined : v })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Bairro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os bairros</SelectItem>
          {BAIRROS.map(b => (
            <SelectItem key={b} value={b}>{b}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.alertas !== undefined ? String(filters.alertas) : 'todos'}
        onValueChange={(v) => onChange({ ...filters, alertas: v === 'todos' ? undefined : v === 'true' })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Alertas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="true">Com alertas</SelectItem>
          <SelectItem value="false">Sem alertas</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.revisado !== undefined ? String(filters.revisado) : 'todos'}
        onValueChange={(v) => onChange({ ...filters, revisado: v === 'todos' ? undefined : v === 'true' })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem value="true">Revisados</SelectItem>
          <SelectItem value="false">Pendentes</SelectItem>
        </SelectContent>
      </Select>

    </div>
  )
}