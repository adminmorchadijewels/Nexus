'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CCStatement, CCCard } from '@/lib/supabase/types'
import { formatCurrency } from '@/lib/utils/finance'
import { formatDate, getDaysUntil } from '@/lib/utils/dates'
import { cn } from '@/lib/utils'

interface StatementRowProps {
  statement: CCStatement
  card: CCCard
  paidAmount: number
  index: number
}

const STATUS_CONFIG = {
  unpaid: { label: 'Unpaid', cls: 'status-badge-unpaid' },
  partial: { label: 'Partial', cls: 'status-badge-partial' },
  paid: { label: 'Paid', cls: 'status-badge-paid' },
  zero_due: { label: 'Zero Due', cls: 'status-badge-zero_due' },
}

export function StatementRow({ statement, card, paidAmount, index }: StatementRowProps) {
  const router = useRouter()
  const daysLeft = getDaysUntil(new Date(statement.due_date))
  const remaining = statement.total_due - paidAmount
  const status = STATUS_CONFIG[statement.status]

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card rounded-xl p-4 cursor-pointer hover:bg-white/8 transition-colors"
      onClick={() => router.push(`/cc-manager/statements/${statement.id}`)}
    >
      <div className="flex items-center gap-4">
        {/* Card color dot */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: card.color }}
        />

        {/* Card + cycle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-white">{card.card_name}</p>
            <span className="text-xs text-slate-500">•••• {card.last_four}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {formatDate(statement.cycle_start)} – {formatDate(statement.cycle_end)}
          </p>
        </div>

        {/* Amounts */}
        <div className="text-right flex-shrink-0">
          <p className="font-mono text-sm font-semibold text-white">
            {formatCurrency(statement.total_due)}
          </p>
          {remaining > 0 && statement.status !== 'paid' && statement.status !== 'zero_due' && (
            <p className="font-mono text-xs text-red-400 mt-0.5">
              {formatCurrency(remaining)} left
            </p>
          )}
        </div>

        {/* Due date + status */}
        <div className="text-right flex-shrink-0 hidden sm:block">
          <p className={cn(
            'text-xs',
            daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-amber-400' : 'text-slate-400'
          )}>
            {statement.status === 'paid' || statement.status === 'zero_due'
              ? formatDate(statement.due_date)
              : daysLeft < 0
              ? `${Math.abs(daysLeft)}d overdue`
              : daysLeft === 0
              ? 'Due today'
              : `${daysLeft}d left`}
          </p>
          <span className={cn('text-xs px-2 py-0.5 rounded-full mt-1 inline-block', status.cls)}>
            {status.label}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
