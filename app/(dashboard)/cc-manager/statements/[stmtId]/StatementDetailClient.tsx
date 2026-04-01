'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { CCStatement, CCCard, CCTransaction, CCCardPayment, CCMilestone } from '@/lib/supabase/types'
import { GlassCard } from '@/components/nexus/GlassCard'
import { PaymentLogger } from '@/components/cc-manager/PaymentLogger'
import { TransactionForm } from '@/components/cc-manager/TransactionForm'
import { formatCurrency } from '@/lib/utils/finance'
import { formatDate } from '@/lib/utils/dates'
import { updateStatementDue, updateStatementStatus } from '@/lib/cc-manager/actions'
import { ChevronLeft, Plus, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  travel: '#6366F1',
  food: '#F59E0B',
  utilities: '#0D9488',
  office: '#3B82F6',
  misc: '#8B5CF6',
  others: '#6B7280',
  reward: '#10B981',
}

const STATUS_OPTS = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'zero_due', label: 'Zero Due' },
] as const

interface Props {
  statement: CCStatement
  card: CCCard
  transactions: CCTransaction[]
  payments: CCCardPayment[]
  activeMilestones: CCMilestone[]
  orgId: string
}

export function StatementDetailClient({
  statement, card, transactions, payments, activeMilestones,
}: Props) {
  const router = useRouter()
  const [showPayment, setShowPayment] = useState(false)
  const [showTransaction, setShowTransaction] = useState(false)
  const [editingDue, setEditingDue] = useState(false)
  const [newDue, setNewDue] = useState(statement.total_due.toString())
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = Math.max(0, statement.total_due - totalPaid)
  const txnTotal = transactions.reduce((sum, t) => sum + t.amount, 0)
  const othersAmount = Math.max(0, statement.total_due - txnTotal)

  async function handleSaveDue() {
    await updateStatementDue(statement.id, Number(newDue))
    setEditingDue(false)
    router.refresh()
  }

  async function handleStatusChange(status: CCStatement['status']) {
    setUpdatingStatus(true)
    await updateStatementStatus(statement.id, status)
    setUpdatingStatus(false)
    router.refresh()
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl space-y-5">
      {/* Back */}
      <Link href="/cc-manager/statements" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-400 transition-colors w-fit">
        <ChevronLeft size={14} />
        Statements
      </Link>

      {/* Header */}
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: card.color }} />
              <p className="text-sm font-medium text-white">{card.card_name}</p>
              <span className="text-xs text-slate-500">•••• {card.last_four}</span>
            </div>
            <p className="text-xs text-slate-400">
              {formatDate(statement.cycle_start)} – {formatDate(statement.cycle_end)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Due: {formatDate(statement.due_date)}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status toggle */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
              {STATUS_OPTS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={updatingStatus}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                    statement.status === opt.value
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Total Due */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-1">Total Due</p>
            {editingDue ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  className="w-36 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white font-mono text-sm"
                  autoFocus
                />
                <button onClick={handleSaveDue} className="text-xs text-teal-400 hover:text-teal-300">Save</button>
                <button onClick={() => setEditingDue(false)} className="text-xs text-slate-400">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-mono text-2xl font-bold text-white">{formatCurrency(statement.total_due)}</p>
                <button onClick={() => setEditingDue(true)} className="text-xs text-slate-500 hover:text-teal-400">edit</button>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Remaining</p>
            <p className={`font-mono text-xl font-bold ${remaining > 0 ? 'text-red-400' : 'text-teal-400'}`}>
              {remaining > 0 ? formatCurrency(remaining) : '✓ Settled'}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setShowPayment(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
        >
          <CreditCard size={14} />
          Log Payment
        </button>
        <button
          onClick={() => setShowTransaction(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-slate-300 hover:text-white text-sm transition-colors"
        >
          <Plus size={14} />
          Add Transaction
        </button>
      </div>

      {/* Payments panel */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Payments</h3>
          <span className="font-mono text-sm text-teal-400">{formatCurrency(totalPaid)} paid</span>
        </div>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-500">No payments yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="text-sm text-white capitalize">{p.payment_mode?.replace('_', ' ')}</p>
                  <p className="text-xs text-slate-400">{formatDate(p.payment_date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-teal-400">
                    {formatCurrency(p.amount)}
                  </p>
                  {!p.tagged_to_9l && (
                    <p className="text-xs text-slate-500">Not tagged to 9L</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Transactions panel */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Transactions</h3>
          <span className="font-mono text-sm text-slate-400">{formatCurrency(txnTotal)} logged</span>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-500">No transactions logged yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: CATEGORY_COLORS[t.category ?? 'others'] }}
                  />
                  <div>
                    <p className="text-sm text-white">{t.merchant}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded capitalize"
                        style={{
                          background: `${CATEGORY_COLORS[t.category ?? 'others']}20`,
                          color: CATEGORY_COLORS[t.category ?? 'others'],
                        }}
                      >
                        {t.category ?? 'others'}
                      </span>
                      <span className="text-xs text-slate-500">{formatDate(t.date)}</span>
                    </div>
                  </div>
                </div>
                <p className="font-mono text-sm font-semibold text-white">{formatCurrency(t.amount)}</p>
              </motion.div>
            ))}
            {othersAmount > 0 && (
              <div className="flex items-center justify-between py-2 opacity-60">
                <p className="text-sm italic text-slate-400">Others (unaccounted)</p>
                <p className="font-mono text-sm text-slate-400">{formatCurrency(othersAmount)}</p>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Modals */}
      <AnimatePresence>
        {showPayment && (
          <PaymentLogger
            statement={statement}
            card={card}
            remaining={remaining}
            onClose={() => setShowPayment(false)}
            onSuccess={() => router.refresh()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTransaction && (
          <TransactionForm
            statement={statement}
            card={card}
            activeMilestones={activeMilestones.filter((m) => m.card_id === card.id)}
            onClose={() => setShowTransaction(false)}
            onSuccess={() => router.refresh()}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
