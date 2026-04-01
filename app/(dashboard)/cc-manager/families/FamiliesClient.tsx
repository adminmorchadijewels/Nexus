'use client'

import { useMemo } from 'react'
import { CCCardFamily, CCTransaction, CCCardPayment } from '@/lib/supabase/types'
import { FamilyCapRow } from '@/components/cc-manager/FamilyCapRow'
import { getFYRange, getFYLabel, isInFY } from '@/lib/utils/dates'
import { GlassCard } from '@/components/nexus/GlassCard'
import { Users2 } from 'lucide-react'

interface Props {
  families: CCCardFamily[]
  transactions: CCTransaction[]
  payments: CCCardPayment[]
}

export function FamiliesClient({ families, transactions, payments }: Props) {
  const now = new Date()
  const { start: fyStart } = getFYRange(now)

  const fyData = useMemo(() => {
    const getPrevFY = (offset: number) => {
      const d = new Date(fyStart)
      d.setFullYear(d.getFullYear() - offset)
      return getFYRange(d)
    }

    const fyRanges = [
      { ...getPrevFY(2), label: getFYLabel(getPrevFY(2).start), isCurrent: false },
      { ...getPrevFY(1), label: getFYLabel(getPrevFY(1).start), isCurrent: false },
      { ...getFYRange(fyStart), label: getFYLabel(fyStart), isCurrent: true },
    ]

    return families.map((family) => ({
      family,
      fyColumns: fyRanges.map((fy) => ({
        label: fy.label,
        isCurrent: fy.isCurrent,
        fySpend: transactions
          .filter((t) => t.family_id === family.id && isInFY(new Date(t.date), fy.start, fy.end))
          .reduce((sum, t) => sum + t.amount, 0),
        fyPayments: payments
          .filter(
            (p) =>
              p.family_id === family.id &&
              p.tagged_to_9l &&
              isInFY(new Date(p.payment_date), fy.start, fy.end)
          )
          .reduce((sum, p) => sum + p.amount, 0),
      })),
    }))
  }, [families, transactions, payments, fyStart])

  return (
    <div className="p-4 lg:p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Family FY Tracker</h1>
        <p className="text-sm text-slate-400 mt-0.5">3-year spend and payment comparison per family</p>
      </div>

      {families.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Users2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No card families yet. Add one from the Cards page.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {fyData.map((fd, i) => (
            <FamilyCapRow key={fd.family.id} family={fd.family} fyColumns={fd.fyColumns} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
