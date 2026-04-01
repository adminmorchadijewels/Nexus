'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { logTransaction } from '@/lib/cc-manager/actions'
import { CCStatement, CCCard, CCMilestone } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, ShoppingCart, AlertCircle } from 'lucide-react'

const CATEGORIES = [
  { value: 'travel', label: 'Travel' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'office', label: 'Office' },
  { value: 'misc', label: 'Misc' },
  { value: 'others', label: 'Others' },
  { value: 'reward', label: 'Reward' },
]

interface TransactionFormProps {
  statement: CCStatement
  card: CCCard
  activeMilestones: CCMilestone[]
  onClose: () => void
  onSuccess: () => void
}

export function TransactionForm({ statement, card, activeMilestones, onClose, onSuccess }: TransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('misc')
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([])
  const [excludeFrom9l, setExcludeFrom9l] = useState(false)
  const [notes, setNotes] = useState('')

  function toggleMilestone(id: string) {
    setSelectedMilestones((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await logTransaction({
        statement_id: statement.id,
        card_id: card.id,
        family_id: statement.family_id,
        merchant,
        amount: Number(amount),
        date,
        category: category as 'travel' | 'food' | 'utilities' | 'office' | 'misc' | 'others' | 'reward',
        milestone_ids: selectedMilestones,
        exclude_from_9l: excludeFrom9l,
        notes: notes || undefined,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log transaction')
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
        className="glass-card rounded-2xl p-6 w-full max-w-md relative z-10 max-h-[90vh] overflow-y-auto scrollbar-thin"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-semibold text-white">Log Transaction</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        <div className="text-xs mb-5 p-3 bg-white/5 rounded-xl text-slate-400">
          {card.card_name} •••• {card.last_four} · Statement {statement.cycle_start} → {statement.cycle_end}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Merchant</Label>
            <Input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              required
              placeholder="e.g. IndiGo Airlines"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <Label className="text-xs text-slate-400 mb-1.5 block">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? 'misc')}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeMilestones.length > 0 && (
            <div>
              <Label className="text-xs text-slate-400 mb-1.5 block">Tag Milestones</Label>
              <div className="flex flex-wrap gap-2">
                {activeMilestones.map((ms) => (
                  <button
                    key={ms.id}
                    type="button"
                    onClick={() => toggleMilestone(ms.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      selectedMilestones.includes(ms.id)
                        ? 'bg-teal-600/30 border-teal-500/50 text-teal-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {ms.title.slice(0, 30)}{ms.title.length > 30 ? '…' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs text-slate-400 mb-1.5 block">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/5 border-white/10 text-white resize-none"
              rows={2}
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setExcludeFrom9l(!excludeFrom9l)}
              className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${excludeFrom9l ? 'bg-amber-600' : 'bg-white/20'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-0.5 ${excludeFrom9l ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className="text-xs text-slate-300">Exclude from ₹9L tracker</span>
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
            {loading ? 'Logging...' : 'Log Transaction'}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  )
}
