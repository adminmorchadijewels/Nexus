'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { CCCard, CCCardFamily, CCStatement, CCCardPayment, CCMilestone } from '@/lib/supabase/types'
import { GlassCard } from '@/components/nexus/GlassCard'
import { ProgressBar } from '@/components/nexus/ProgressBar'
import { MilestoneCard } from '@/components/cc-manager/MilestoneCard'
import { PaymentLogger } from '@/components/cc-manager/PaymentLogger'
import { StatementRow } from '@/components/cc-manager/StatementRow'
import { formatCurrency, utilisationColor } from '@/lib/utils/finance'
import { formatDate } from '@/lib/utils/dates'
import {
  Phone, Mail, CreditCard, Star, ChevronLeft, BanknoteIcon, ShoppingCart,
} from 'lucide-react'
import Link from 'next/link'

interface Props {
  card: CCCard
  family: CCCardFamily | null
  statements: CCStatement[]
  payments: CCCardPayment[]
  milestones: CCMilestone[]
}

export function CardDetailClient({ card, family, statements, payments, milestones }: Props) {
  const router = useRouter()
  const [showPayment, setShowPayment] = useState(false)

  const paidByStatement: Record<string, number> = {}
  payments.forEach((p) => {
    paidByStatement[p.statement_id] = (paidByStatement[p.statement_id] ?? 0) + p.amount
  })

  const currentStatement = statements.find((s) => s.status !== 'paid' && s.status !== 'zero_due') ?? statements[0]
  const outstanding = statements
    .filter((s) => s.status !== 'paid' && s.status !== 'zero_due')
    .reduce((sum, s) => sum + Math.max(0, s.total_due - (paidByStatement[s.id] ?? 0)), 0)

  const utilisationPct = family && currentStatement
    ? currentStatement.total_due / family.shared_limit
    : 0

  const remaining = currentStatement
    ? Math.max(0, currentStatement.total_due - (paidByStatement[currentStatement.id] ?? 0))
    : 0

  return (
    <div className="p-4 lg:p-6 max-w-4xl space-y-6">
      {/* Back */}
      <Link href="/cc-manager/cards" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-400 transition-colors w-fit">
        <ChevronLeft size={14} />
        Cards
      </Link>

      {/* Card header */}
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: card.color }} />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400">{family?.bank ?? 'Unknown Bank'}</p>
            <h1 className="text-2xl font-bold text-white mt-1">{card.card_name}</h1>
            <p className="font-mono text-slate-400 mt-1 text-sm">•••• •••• •••• {card.last_four}</p>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold"
            style={{ background: `${card.color}25`, color: card.color }}
          >
            {(family?.bank ?? 'B').charAt(0)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-xs text-slate-500">Outstanding</p>
            <p className="font-mono text-lg font-semibold text-white mt-0.5">{formatCurrency(outstanding)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Family Limit</p>
            <p className="font-mono text-lg font-semibold text-slate-300 mt-0.5">{formatCurrency(family?.shared_limit ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Annual Fee</p>
            <p className="font-mono text-lg font-semibold text-slate-300 mt-0.5">{formatCurrency(card.annual_fees)}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500">Utilisation</span>
            <span style={{ color: utilisationColor(utilisationPct) }}>{(utilisationPct * 100).toFixed(0)}%</span>
          </div>
          <ProgressBar value={utilisationPct * 100} color={utilisationColor(utilisationPct)} height="h-2" />
        </div>
      </GlassCard>

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap">
        {currentStatement && (
          <button
            onClick={() => setShowPayment(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
          >
            <BanknoteIcon size={14} />
            Log Payment
          </button>
        )}
        {currentStatement && (
          <Link
            href={`/cc-manager/statements/${currentStatement.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card border-white/10 text-slate-300 hover:text-white text-sm transition-colors"
          >
            <ShoppingCart size={14} />
            Log Transaction
          </Link>
        )}
        <Link
          href={`/cc-manager/statements?card=${card.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card border-white/10 text-slate-300 hover:text-white text-sm transition-colors"
        >
          <CreditCard size={14} />
          All Statements
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Card details */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Card Details</h3>
          <div className="space-y-3">
            {card.registered_mobile && (
              <InfoRow icon={<Phone size={14} />} label="Registered Mobile" value={card.registered_mobile} />
            )}
            {card.registered_email && (
              <InfoRow icon={<Mail size={14} />} label="Registered Email" value={card.registered_email} />
            )}
            {card.customer_care_phone && (
              <InfoRow icon={<Phone size={14} />} label="Customer Care" value={card.customer_care_phone} />
            )}
            {card.customer_care_emails && (
              <InfoRow icon={<Mail size={14} />} label="Support Email" value={card.customer_care_emails} />
            )}
            <InfoRow icon={<CreditCard size={14} />} label="Bill Generate Day" value={`Day ${card.bill_generate_day}`} />
            <InfoRow icon={<CreditCard size={14} />} label="Buffer Days" value={`${card.buffer_days} days`} />
          </div>
        </GlassCard>

        {/* Benefits */}
        {card.benefits && (
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} className="text-teal-400" />
              <h3 className="text-sm font-semibold text-white">Benefits</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{card.benefits}</p>
          </GlassCard>
        )}
      </div>

      {/* Current statement summary */}
      {currentStatement && (
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Current Statement</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500">Cycle</p>
              <p className="text-sm text-slate-300 mt-0.5">{formatDate(currentStatement.cycle_start)} – {formatDate(currentStatement.cycle_end)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Due Date</p>
              <p className="text-sm text-slate-300 mt-0.5">{formatDate(currentStatement.due_date)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Due</p>
              <p className="font-mono text-sm font-semibold text-white mt-0.5">{formatCurrency(currentStatement.total_due)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Remaining</p>
              <p className="font-mono text-sm font-semibold text-red-400 mt-0.5">{formatCurrency(remaining)}</p>
            </div>
          </div>
          <div className="mt-3">
            <Link
              href={`/cc-manager/statements/${currentStatement.id}`}
              className="text-xs text-teal-400 hover:text-teal-300"
            >
              View full statement →
            </Link>
          </div>
        </GlassCard>
      )}

      {/* Active milestones */}
      {milestones.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Active Milestones</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {milestones.map((ms, i) => (
              <MilestoneCard key={ms.id} milestone={ms} spentAmount={0} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Recent statements */}
      {statements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Recent Statements</h3>
          <div className="space-y-2">
            {statements.slice(0, 5).map((stmt, i) => (
              <StatementRow
                key={stmt.id}
                statement={stmt}
                card={card}
                paidAmount={paidByStatement[stmt.id] ?? 0}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* Payment Logger */}
      <AnimatePresence>
        {showPayment && currentStatement && (
          <PaymentLogger
            statement={currentStatement}
            card={card}
            remaining={remaining}
            onClose={() => setShowPayment(false)}
            onSuccess={() => router.refresh()}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500 flex-shrink-0">{icon}</span>
      <span className="text-xs text-slate-500 w-28 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-300 truncate">{value}</span>
    </div>
  )
}
