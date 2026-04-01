'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CCMilestone, CCCard, CCMilestoneReward, CCTransactionMilestone } from '@/lib/supabase/types'
import { MilestoneCard } from '@/components/cc-manager/MilestoneCard'
import { GlassCard } from '@/components/nexus/GlassCard'
import { addMilestone, toggleRewardCredited } from '@/lib/cc-manager/actions'
import { formatCurrency } from '@/lib/utils/finance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Trophy, Gift } from 'lucide-react'

interface Props {
  milestones: CCMilestone[]
  cards: CCCard[]
  rewards: CCMilestoneReward[]
  txnMilestones: CCTransactionMilestone[]
  transactions: Array<{ id: string; amount: number }>
  orgId: string
}

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'achieved', label: 'Achieved' },
  { id: 'missed', label: 'Missed' },
]

export function MilestonesClient({ milestones, cards, rewards, txnMilestones, transactions }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState('active')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)

  function getSpentAmount(milestoneId: string): number {
    const linkedTxnIds = txnMilestones
      .filter((tm) => tm.milestone_id === milestoneId)
      .map((tm) => tm.transaction_id)
    return transactions
      .filter((t) => linkedTxnIds.includes(t.id))
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const filtered = milestones.filter((m) => m.status === tab)

  async function handleAddMilestone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await addMilestone({
      card_id: fd.get('card_id') as string,
      title: fd.get('title') as string,
      source: fd.get('source') as 'bank_defined' | 'self_defined',
      start_date: fd.get('start_date') as string,
      end_date: fd.get('end_date') as string,
      target_amount: Number(fd.get('target_amount')),
    })
    setLoading(false)
    setShowAdd(false)
    router.refresh()
  }

  async function handleToggleReward(rewardId: string, current: boolean) {
    await toggleRewardCredited(rewardId, !current)
    router.refresh()
  }

  return (
    <div className="p-4 lg:p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Milestones</h1>
          <p className="text-sm text-slate-400 mt-0.5">{milestones.filter((m) => m.status === 'active').length} active</p>
        </div>
        <motion.button
          whileHover={{ rotate: 45, scale: 1.12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg"
        >
          <Plus size={18} />
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 glass-card rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.id ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No {tab} milestones.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filtered.map((ms, i) => {
            const spent = getSpentAmount(ms.id)
            const card = cards.find((c) => c.id === ms.card_id)
            const msRewards = rewards.filter((r) => r.milestone_id === ms.id)
            return (
              <div key={ms.id}>
                <MilestoneCard
                  milestone={ms}
                  card={card}
                  spentAmount={spent}
                  index={i}
                />
                {msRewards.length > 0 && (
                  <div className="mt-2 ml-4 space-y-1">
                    {msRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center gap-3 px-4 py-2 glass-card rounded-xl text-xs"
                      >
                        <Gift className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                        <span className="text-slate-300 flex-1">{reward.reward_description}</span>
                        {reward.reward_value && (
                          <span className="font-mono text-teal-400">{formatCurrency(reward.reward_value)}</span>
                        )}
                        <button
                          onClick={() => handleToggleReward(reward.id, reward.is_credited)}
                          className={`px-2 py-0.5 rounded-full text-xs transition-all ${
                            reward.is_credited
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-white/5 text-slate-400 border border-white/10 hover:border-teal-500/30'
                          }`}
                        >
                          {reward.is_credited ? '✓ Credited' : 'Mark credited'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Milestone Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
            <motion.div
              className="glass-card rounded-2xl p-6 w-full max-w-md relative z-10"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">Add Milestone</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleAddMilestone} className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-400 mb-1.5 block">Card</Label>
                  <Select name="card_id" required>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select card" />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.card_name} •••• {c.last_four}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-400 mb-1.5 block">Title</Label>
                  <Input name="title" required className="bg-white/5 border-white/10 text-white" placeholder="e.g. HDFC Spend 3L in Q1" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400 mb-1.5 block">Source</Label>
                  <Select name="source" defaultValue="bank_defined">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_defined">Bank Defined</SelectItem>
                      <SelectItem value="self_defined">Self Defined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Start Date</Label>
                    <Input name="start_date" type="date" required className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">End Date</Label>
                    <Input name="end_date" type="date" required className="bg-white/5 border-white/10 text-white" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-400 mb-1.5 block">Target Amount (₹) — 0 = tracking only</Label>
                  <Input name="target_amount" type="number" defaultValue="0" min="0" className="bg-white/5 border-white/10 text-white font-mono" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  {loading ? 'Adding...' : 'Add Milestone'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
