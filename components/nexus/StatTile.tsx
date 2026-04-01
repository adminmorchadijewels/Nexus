'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: string
  subValue?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  accentColor?: string
  className?: string
}

export function StatTile({
  label,
  value,
  subValue,
  icon,
  trend,
  trendLabel,
  accentColor = '#0D9488',
  className,
}: StatTileProps) {
  return (
    <GlassCard className={cn('p-5', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          <motion.p
            className="font-mono text-2xl font-semibold text-white truncate"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {value}
          </motion.p>
          {subValue && (
            <p className="text-xs text-slate-400 mt-1">{subValue}</p>
          )}
          {trendLabel && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs',
              trend === 'up' ? 'text-teal-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
            )}>
              <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ml-3"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
