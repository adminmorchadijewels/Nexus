'use client'

import { motion } from 'framer-motion'
import { CCMilestone, CCCard } from '@/lib/supabase/types'
import { formatCurrency } from '@/lib/utils/finance'
import { formatDate } from '@/lib/utils/dates'
import { getMilestoneProgress, getDaysLeft, getMonthlyTarget } from '@/lib/utils/milestones'
import { ProgressBar } from '@/components/nexus/ProgressBar'
import { cn } from '@/lib/utils'
import { Trophy, Target } from 'lucide-react'

interface MilestoneCardProps {
  milestone: CCMilestone
  card?: CCCard
  spentAmount: number
  index: number
}

export function MilestoneCard({ milestone, card, spentAmount, index }: MilestoneCardProps) {
  const progress = getMilestoneProgress(milestone.target_amount, spentAmount)
  const daysLeft = getDaysLeft(new Date(milestone.end_date))
  const monthlyTarget = getMonthlyTarget(
    milestone.target_amount,
    new Date(milestone.start_date),
    new Date(milestone.end_date)
  )

  const isTracking = milestone.target_amount === 0
  const progressColor =
    progress >= 100 ? '#10B981' : daysLeft <= 7 ? '#F59E0B' : '#0D9488'

  const sourceLabel = milestone.source === 'bank_defined' ? 'Bank' : 'Custom'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 300 }}
      className="glass-card rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
            <span className="text-xs text-teal-400 font-medium">{sourceLabel}</span>
            {card && (
              <span className="text-xs text-slate-500">· {card.card_name}</span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-white leading-snug">{milestone.title}</h4>
        </div>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full flex-shrink-0',
          milestone.status === 'achieved' ? 'bg-teal-500/20 text-teal-300' :
          milestone.status === 'missed' ? 'bg-red-500/20 text-red-300' :
          daysLeft <= 7 ? 'bg-amber-500/20 text-amber-300' :
          'bg-white/10 text-slate-400'
        )}>
          {milestone.status === 'achieved' ? 'Achieved' :
           milestone.status === 'missed' ? 'Missed' :
           daysLeft === 0 ? 'Expires today' :
           `${daysLeft}d left`}
        </span>
      </div>

      {/* Progress */}
      {!isTracking && (
        <>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">
              {formatCurrency(spentAmount)} <span className="text-slate-600">/ {formatCurrency(milestone.target_amount)}</span>
            </span>
            <span style={{ color: progressColor }}>{progress.toFixed(0)}%</span>
          </div>
          <ProgressBar value={progress} color={progressColor} height="h-2" className="mb-3" />
        </>
      )}

      {isTracking && (
        <div className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
          <Target className="w-3 h-3" />
          <span>Tracking only — {formatCurrency(spentAmount)} spent</span>
        </div>
      )}

      {/* Dates + monthly target */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-slate-500 mb-0.5">Period</p>
          <p className="text-slate-300">{formatDate(milestone.start_date)} – {formatDate(milestone.end_date)}</p>
        </div>
        {!isTracking && (
          <div>
            <p className="text-slate-500 mb-0.5">Monthly target</p>
            <p className="text-slate-300 font-mono">{formatCurrency(monthlyTarget)}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
