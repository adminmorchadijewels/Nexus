'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { logPayment } from '@/lib/cc-manager/actions'
import { CCStatement, CCCard } from '@/lib/supabase/types'
import { formatCurrency } from '@/lib/utils/finance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, CreditCard, AlertCircle } from 'lucide-react'

interface PaymentLoggerProps {
  statement: CCStatement
  card: CCCard
  remaining: number
  onClose: () => void
  onSuccess: () => void
}

export function PaymentLogger({ statement, card, remaining, onClose, onSuccess }: PaymentLoggerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState(remaining.toString())
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMode, setPaymentMode] = useState('upi')
  const [taggedTo9l, setTaggedTo9l] = useState(true)
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await logPayment({
        card_id: card.id,
        family_id: statement.family_id,
        statement_id: statement.id,
        amount: Number(amount),
        payment_date: paymentDate,
        payment_mode: paymentMode as 'upi' | 'neft' | 'auto_debit' | 'cheque' | 'reward',
        tagged_to_9l: taggedTo9l,
        notes: notes || undefined,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="glass-card rounded-2xl p-6 w-full max-w-md relative z-10"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-semibold text-white">Log Payment</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        <div className="flex justify-between text-xs mb-5 p-3 bg-white/5 rounded-xl">
          <span className="text-slate-400">{card.card_name} •••• {card.last_four}</span>
          <span className="font-mono text-red-300">{formatCurrency(remaining)} remaining</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Amount (₹)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/5 border-white/10 text-white font-mono"
              required
              min="1"
            />
          </div>

          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Payment Date</Label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Payment Mode</Label>
            <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v ?? 'upi')}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="neft">NEFT</SelectItem>
                <SelectItem value="auto_debit">Auto Debit</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="reward">Reward Points</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Notes (optional)</Label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Add a note..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTaggedTo9l(!taggedTo9l)}
              className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${taggedTo9l ? 'bg-teal-600' : 'bg-white/20'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-0.5 ${taggedTo9l ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className="text-xs text-slate-300">Tag to ₹9L annual cap tracker</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            {loading ? 'Logging...' : 'Log Payment'}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  )
}
