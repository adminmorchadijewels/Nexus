'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CCCard, CCCardFamily, CCStatement } from '@/lib/supabase/types'
import { formatCurrency, utilisationColor } from '@/lib/utils/finance'
import { getDaysUntil, formatDate } from '@/lib/utils/dates'
import { ProgressBar } from '@/components/nexus/ProgressBar'
import { cn } from '@/lib/utils'

interface CardTileProps {
  card: CCCard
  family: CCCardFamily
  currentStatement?: CCStatement
  outstanding: number
  index: number
}

export function CardTile({ card, family, currentStatement, outstanding, index }: CardTileProps) {
  const router = useRouter()

  const available = family.shared_limit - outstanding
  const utilisationPct = currentStatement
    ? currentStatement.total_due / family.shared_limit
    : 0
  const utilisationColor_ = utilisationColor(utilisationPct)

  const daysLeft = currentStatement ? getDaysUntil(new Date(currentStatement.due_date)) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card rounded-2xl p-5 cursor-pointer relative overflow-hidden"
      style={{ transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms ease' }}
      onClick={() => router.push(`/cc-manager/cards/${card.id}`)}
    >
      {/* Color accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: card.color }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400 font-medium">{family.bank}</p>
          <h3 className="text-white font-semibold text-base mt-0.5">{card.card_name}</h3>
          <p className="font-mono text-xs text-slate-500 mt-0.5">•••• {card.last_four}</p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{ background: `${card.color}20`, color: card.color }}
        >
          {family.bank.charAt(0)}
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-slate-500">Outstanding</p>
          <p className="font-mono text-sm font-semibold text-white mt-0.5">
            {formatCurrency(outstanding)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Available</p>
          <p className="font-mono text-sm font-semibold text-teal-400 mt-0.5">
            {formatCurrency(available)}
          </p>
        </div>
      </div>

      {/* Utilisation */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Utilisation</span>
          <span style={{ color: utilisationColor_ }}>
            {(utilisationPct * 100).toFixed(0)}%
          </span>
        </div>
        <ProgressBar value={utilisationPct * 100} color={utilisationColor_} />
      </div>

      {/* Due date */}
      {currentStatement && (
        <div className={cn(
          'flex items-center justify-between text-xs rounded-lg px-3 py-2',
          daysLeft !== null && daysLeft <= 3
            ? 'bg-red-500/10 text-red-300'
            : daysLeft !== null && daysLeft <= 7
            ? 'bg-amber-500/10 text-amber-300'
            : 'bg-white/5 text-slate-400'
        )}>
          <span>Due {formatDate(currentStatement.due_date)}</span>
          <span className="font-semibold font-mono">
            {formatCurrency(currentStatement.total_due)}
          </span>
        </div>
      )}

      {!currentStatement && (
        <div className="flex items-center text-xs text-slate-500 bg-white/5 rounded-lg px-3 py-2">
          Awaiting first statement
        </div>
      )}
    </motion.div>
  )
}
