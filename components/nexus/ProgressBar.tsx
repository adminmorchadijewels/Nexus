'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number // 0-100
  color?: string
  className?: string
  height?: string
  showLabel?: boolean
}

export function ProgressBar({
  value,
  color = '#0D9488',
  className,
  height = 'h-1.5',
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-white/10 rounded-full overflow-hidden', height)}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
