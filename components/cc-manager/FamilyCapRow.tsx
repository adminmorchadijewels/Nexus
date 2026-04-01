'use client'

import { motion } from 'framer-motion'
import { CCCardFamily } from '@/lib/supabase/types'
import { formatCurrency } from '@/lib/utils/finance'
import { ProgressBar } from '@/components/nexus/ProgressBar'

interface FYData {
  label: string
  fySpend: number
  fyPayments: number
  isCurrent: boolean
}

interface FamilyCapRowProps {
  family: CCCardFamily
  fyColumns: FYData[]
  index: number
}

export function FamilyCapRow({ family, fyColumns, index }: FamilyCapRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white">{family.cardholder_name}</h4>
          <p className="text-xs text-slate-400">{family.bank} · Limit {formatCurrency(family.shared_limit, true)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Annual Cap</p>
          <p className="font-mono text-sm text-teal-400">₹9L</p>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${fyColumns.length}, 1fr)` }}>
        {fyColumns.map((fy) => {
          const remaining9l = Math.max(0, (family.annual_cap ?? 900000) - fy.fyPayments)
          const pct = Math.min((fy.fyPayments / (family.annual_cap ?? 900000)) * 100, 100)
          return (
            <div
              key={fy.label}
              className={`rounded-xl p-3 ${fy.isCurrent ? 'border border-teal-600/30 bg-teal-600/5' : 'bg-white/3'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium" style={{ color: fy.isCurrent ? '#5EEAD4' : '#94A3B8' }}>
                  {fy.label}
                </p>
                {fy.isCurrent && (
                  <span className="text-xs bg-teal-600/20 text-teal-400 px-1.5 py-0.5 rounded">Current</span>
                )}
              </div>
              <div className="space-y-1 mb-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Spend</span>
                  <span className="font-mono text-slate-300">{formatCurrency(fy.fySpend, true)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payments</span>
                  <span className="font-mono text-teal-400">{formatCurrency(fy.fyPayments, true)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">9L Rem.</span>
                  <span className={`font-mono ${remaining9l < 100000 ? 'text-red-400' : 'text-slate-300'}`}>
                    {formatCurrency(remaining9l, true)}
                  </span>
                </div>
              </div>
              <ProgressBar value={pct} color={fy.isCurrent ? '#0D9488' : '#475569'} height="h-1" />
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
