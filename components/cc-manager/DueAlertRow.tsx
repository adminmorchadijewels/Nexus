'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CCStatement, CCCard } from '@/lib/supabase/types'
import { formatCurrency, urgencyColor, urgencyLabel } from '@/lib/utils/finance'
import { formatDate, getDaysUntil } from '@/lib/utils/dates'

import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface DueAlertRowProps {
  statement: CCStatement
  card: CCCard
  remaining: number
  index: number
}

export function DueAlertRow({ statement, card, remaining, index }: DueAlertRowProps) {
  const daysLeft = getDaysUntil(new Date(statement.due_date))
  const color = urgencyColor(daysLeft)
  const label = urgencyLabel(daysLeft)

  const Icon = daysLeft <= 3 ? AlertCircle : daysLeft <= 7 ? Clock : CheckCircle

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/cc-manager/statements/${statement.id}`}>
        <div className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
          <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{card.card_name}</p>
            <p className="text-xs text-slate-400">Due {formatDate(statement.due_date)}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-mono text-sm font-semibold text-white">
              {formatCurrency(remaining)}
            </p>
            <p className="text-xs mt-0.5 font-medium" style={{ color }}>
              {label}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
