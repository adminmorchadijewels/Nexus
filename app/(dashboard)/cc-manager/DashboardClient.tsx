'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CCCardFamily, CCCard, CCStatement, CCCardPayment, CCTransaction, CCMilestone,
} from '@/lib/supabase/types'
import { GlassCard } from '@/components/nexus/GlassCard'
import { StatTile } from '@/components/nexus/StatTile'
import { ProgressBar } from '@/components/nexus/ProgressBar'
import { DueAlertRow } from '@/components/cc-manager/DueAlertRow'
import { MilestoneCard } from '@/components/cc-manager/MilestoneCard'
import { FamilyCapRow } from '@/components/cc-manager/FamilyCapRow'
import { formatCurrency, utilisationColor } from '@/lib/utils/finance'
import { getDaysUntil, getFYRange, getFYLabel, isInFY } from '@/lib/utils/dates'
import { getMilestoneProgress } from '@/lib/utils/milestones'
import {
  CreditCard, AlertTriangle, TrendingUp, CheckCircle2, Target, BarChart2, CalendarClock,
} from 'lucide-react'

interface TxnMilestoneLink {
  transaction_id: string
  milestone_id: string
}

interface Props {
  families: CCCardFamily[]
  cards: CCCard[]
  statements: CCStatement[]
  payments: CCCardPayment[]
  transactions: CCTransaction[]
  milestones: CCMilestone[]
  txnMilestones: TxnMilestoneLink[]
  orgId: string
}

export function DashboardClient({
  families, cards, statements, payments, transactions, milestones, txnMilestones,
}: Props) {
  const now = useMemo(() => new Date(), [])
  const { start: fyStart, end: fyEnd } = useMemo(() => getFYRange(now), [now])

  // ─── Computed values ────────────────────────────────────────────
  const paidByStatement = useMemo(() => {
    const map: Record<string, number> = {}
    payments.forEach((p) => {
      map[p.statement_id] = (map[p.statement_id] ?? 0) + p.amount
    })
    return map
  }, [payments])

  const outstanding = useMemo(() => {
    return statements
      .filter((s) => s.status !== 'paid' && s.status !== 'zero_due')
      .reduce((sum, s) => {
        const paid = paidByStatement[s.id] ?? 0
        return sum + Math.max(0, s.total_due - paid)
      }, 0)
  }, [statements, paidByStatement])

  const totalAvailable = useMemo(() => {
    return families.reduce((sum, f) => {
      const familyOutstanding = statements
        .filter((s) => s.family_id === f.id && s.status !== 'paid' && s.status !== 'zero_due')
        .reduce((fs, s) => {
          const paid = paidByStatement[s.id] ?? 0
          return fs + Math.max(0, s.total_due - paid)
        }, 0)
      return sum + (f.shared_limit - familyOutstanding)
    }, 0)
  }, [families, statements, paidByStatement])

  // Due this month
  const dueThisMonth = useMemo(() => {
    return statements
      .filter((s) => {
        if (s.status === 'paid' || s.status === 'zero_due') return false
        const due = new Date(s.due_date)
        return due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear()
      })
      .reduce((sum, s) => {
        const paid = paidByStatement[s.id] ?? 0
        return sum + Math.max(0, s.total_due - paid)
      }, 0)
  }, [statements, paidByStatement, now])

  // Due alerts (unpaid/partial, sorted by urgency)
  const dueAlerts = useMemo(() => {
    return statements
      .filter((s) => s.status !== 'paid' && s.status !== 'zero_due')
      .map((s) => ({
        statement: s,
        card: cards.find((c) => c.id === s.card_id)!,
        remaining: Math.max(0, s.total_due - (paidByStatement[s.id] ?? 0)),
        daysLeft: getDaysUntil(new Date(s.due_date)),
      }))
      .filter((a) => a.card)
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [statements, cards, paidByStatement])

  // FY tracker per family (last 2 FYs + current)
  const fyData = useMemo(() => {
    const getPrevFY = (offset: number) => {
      const d = new Date(fyStart)
      d.setFullYear(d.getFullYear() - offset)
      return getFYRange(d)
    }

    const fyRanges = [
      { ...getPrevFY(2), label: getFYLabel(getPrevFY(2).start), isCurrent: false },
      { ...getPrevFY(1), label: getFYLabel(getPrevFY(1).start), isCurrent: false },
      { start: fyStart, end: fyEnd, label: getFYLabel(fyStart), isCurrent: true },
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
          .filter((p) => p.family_id === family.id && p.tagged_to_9l && isInFY(new Date(p.payment_date), fy.start, fy.end))
          .reduce((sum, p) => sum + p.amount, 0),
      })),
    }))
  }, [families, transactions, payments, fyStart, fyEnd])

  // Milestone progress — computed from cc_transaction_milestones junction table
  const spentByMilestone = useMemo(() => {
    const map: Record<string, number> = {}
    for (const link of txnMilestones) {
      const txn = transactions.find((t) => t.id === link.transaction_id)
      if (txn) {
        map[link.milestone_id] = (map[link.milestone_id] ?? 0) + txn.amount
      }
    }
    return map
  }, [txnMilestones, transactions])

  const milestoneData = useMemo(() => {
    return milestones.map((ms) => {
      const spent = spentByMilestone[ms.id] ?? 0
      return {
        milestone: ms,
        card: cards.find((c) => c.id === ms.card_id),
        spent,
        progress: getMilestoneProgress(ms.target_amount, spent),
      }
    })
  }, [milestones, spentByMilestone, cards])

  const activeMilestones = milestoneData.filter((m) => m.milestone.status === 'active')
  const achievedMilestones = milestoneData.filter((m) => m.milestone.status === 'achieved')

  // Payment behaviour / streak
  const paymentBehaviour = useMemo(() => {
    return cards.map((card) => {
      const cardStmts = statements
        .filter((s) => s.card_id === card.id && (s.status === 'paid' || s.status === 'partial'))
        .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())

      let streak = 0
      for (const stmt of cardStmts) {
        const stmtPayments = payments.filter((p) => p.statement_id === stmt.id)
        if (stmtPayments.length === 0) break
        const lastPayment = stmtPayments.sort(
          (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
        )[0]
        const onTime = new Date(lastPayment.payment_date) <= new Date(stmt.due_date)
        if (onTime && stmt.status === 'paid') streak++
        else break
      }

      return { card, streak, totalPaid: cardStmts.length }
    })
  }, [cards, statements, payments])

  // Credit utilisation
  const overallUtilisation = useMemo(() => {
    const totalLimit = families.reduce((sum, f) => sum + f.shared_limit, 0)
    return totalLimit > 0 ? outstanding / totalLimit : 0
  }, [families, outstanding])

  return (
    <div className="p-4 lg:p-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Credit Card Manager</h1>
        <p className="text-sm text-slate-400 mt-0.5">Portfolio overview as of today</p>
      </div>

      {/* Section 1: Portfolio Health */}
      <section>
        <SectionHeader icon={<TrendingUp className="w-4 h-4" />} title="Portfolio Health" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile
            label="Total Outstanding"
            value={formatCurrency(outstanding, true)}
            icon={<AlertTriangle className="w-4 h-4" />}
            accentColor="#EF4444"
          />
          <StatTile
            label="Available Credit"
            value={formatCurrency(totalAvailable, true)}
            icon={<CheckCircle2 className="w-4 h-4" />}
            accentColor="#0D9488"
          />
          <StatTile
            label="Due This Month"
            value={formatCurrency(dueThisMonth, true)}
            icon={<CalendarClock className="w-4 h-4" />}
            accentColor="#F59E0B"
          />
          <StatTile
            label="Active Cards"
            value={String(cards.length)}
            icon={<CreditCard className="w-4 h-4" />}
            accentColor="#6366F1"
          />
        </div>
      </section>

      {/* Section 2: Due Alerts */}
      <section>
        <SectionHeader icon={<AlertTriangle className="w-4 h-4 text-red-400" />} title="Due Alerts" />
        <GlassCard className="divide-y divide-white/5">
          {dueAlerts.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-teal-400 mb-2" />
              <p className="text-slate-300 text-sm font-medium">All clear — no outstanding dues!</p>
              <p className="text-slate-500 text-xs mt-1">Outstanding = ₹0</p>
            </div>
          ) : (
            dueAlerts.map((alert, i) => (
              <DueAlertRow
                key={alert.statement.id}
                statement={alert.statement}
                card={alert.card}
                remaining={alert.remaining}
                index={i}
              />
            ))
          )}
        </GlassCard>
      </section>

      {/* Section 3: 9L FY Tracker */}
      <section>
        <SectionHeader icon={<BarChart2 className="w-4 h-4" />} title="₹9L FY Tracker" />
        <div className="space-y-3">
          {fyData.map((fd, i) => (
            <FamilyCapRow key={fd.family.id} family={fd.family} fyColumns={fd.fyColumns} index={i} />
          ))}
        </div>
      </section>

      {/* Section 4: Milestone Intelligence */}
      <section>
        <SectionHeader icon={<Target className="w-4 h-4 text-teal-400" />} title="Milestone Intelligence" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeMilestones.length === 0 ? (
            <GlassCard className="col-span-full p-8 text-center">
              <p className="text-slate-400 text-sm">No active milestones. Add one to start tracking.</p>
            </GlassCard>
          ) : (
            activeMilestones.map((md, i) => (
              <MilestoneCard
                key={md.milestone.id}
                milestone={md.milestone}
                card={md.card}
                spentAmount={md.spent}
                index={i}
              />
            ))
          )}
        </div>
        {achievedMilestones.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-2">{achievedMilestones.length} achieved this FY</p>
            <div className="flex flex-wrap gap-2">
              {achievedMilestones.map((md) => (
                <span
                  key={md.milestone.id}
                  className="text-xs px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/20"
                >
                  ✓ {md.milestone.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 5: Credit Score Signals */}
      <section>
        <SectionHeader icon={<BarChart2 className="w-4 h-4" />} title="Credit Score Signals" />
        <GlassCard className="p-5">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Utilisation gauge */}
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium text-white">Portfolio Utilisation</p>
                <p className="font-mono text-sm" style={{ color: utilisationColor(overallUtilisation) }}>
                  {(overallUtilisation * 100).toFixed(1)}%
                </p>
              </div>
              <ProgressBar
                value={overallUtilisation * 100}
                color={utilisationColor(overallUtilisation)}
                height="h-3"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                {overallUtilisation < 0.3
                  ? 'Excellent — keep below 30%'
                  : overallUtilisation < 0.5
                  ? 'Moderate — consider reducing'
                  : 'High — may impact credit score'}
              </p>
            </div>

            {/* Highest utilisation card */}
            <div>
              <p className="text-sm font-medium text-white mb-2">Per-Card Utilisation</p>
              <div className="space-y-2">
                {cards.map((card) => {
                  const family = families.find((f) => f.id === card.family_id)
                  if (!family) return null
                  const cardStmt = statements
                    .filter((s) => s.card_id === card.id && s.status !== 'paid' && s.status !== 'zero_due')
                    .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0]
                  const util = cardStmt ? cardStmt.total_due / family.shared_limit : 0
                  return (
                    <div key={card.id} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: card.color }} />
                      <p className="text-xs text-slate-400 flex-1 truncate">{card.card_name}</p>
                      <ProgressBar value={util * 100} color={utilisationColor(util)} className="w-24" />
                      <p className="text-xs font-mono w-10 text-right" style={{ color: utilisationColor(util) }}>
                        {(util * 100).toFixed(0)}%
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Section 6: Payment Behaviour */}
      <section>
        <SectionHeader icon={<CheckCircle2 className="w-4 h-4 text-teal-400" />} title="Payment Behaviour" />
        <GlassCard className="divide-y divide-white/5">
          {paymentBehaviour.map((pb, i) => (
            <motion.div
              key={pb.card.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 px-5 py-3"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pb.card.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{pb.card.card_name}</p>
                <p className="text-xs text-slate-400">•••• {pb.card.last_four}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  {Array.from({ length: Math.min(pb.streak, 5) }).map((_, j) => (
                    <div key={j} className="w-2 h-2 rounded-full bg-teal-400" />
                  ))}
                  {pb.streak === 0 && <div className="w-2 h-2 rounded-full bg-red-400" />}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pb.streak > 0 ? `${pb.streak} on-time streak` : 'No streak'}
                </p>
              </div>
            </motion.div>
          ))}
        </GlassCard>
      </section>
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-slate-400">{icon}</span>
      <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{title}</h2>
    </div>
  )
}
