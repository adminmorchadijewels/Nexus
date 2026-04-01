'use client'

import { useState } from 'react'
import { CCStatement, CCCard, CCCardPayment } from '@/lib/supabase/types'
import { StatementRow } from '@/components/cc-manager/StatementRow'

interface Props {
  statements: CCStatement[]
  cards: CCCard[]
  payments: CCCardPayment[]
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'partial', label: 'Partial' },
  { id: 'paid', label: 'Paid' },
  { id: 'zero_due', label: 'Zero Due' },
]

export function StatementsClient({ statements, cards, payments }: Props) {
  const [tab, setTab] = useState('all')

  const paidByStatement: Record<string, number> = {}
  payments.forEach((p) => {
    paidByStatement[p.statement_id] = (paidByStatement[p.statement_id] ?? 0) + p.amount
  })

  const filtered = tab === 'all' ? statements : statements.filter((s) => s.status === tab)

  return (
    <div className="p-4 lg:p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Statements</h1>
        <p className="text-sm text-slate-400 mt-0.5">{statements.length} total</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 glass-card rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.id
                ? 'bg-teal-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-slate-400 text-sm">No statements found.</p>
          </div>
        ) : (
          filtered.map((stmt, i) => {
            const card = cards.find((c) => c.id === stmt.card_id)
            if (!card) return null
            return (
              <StatementRow
                key={stmt.id}
                statement={stmt}
                card={card}
                paidAmount={paidByStatement[stmt.id] ?? 0}
                index={i}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
