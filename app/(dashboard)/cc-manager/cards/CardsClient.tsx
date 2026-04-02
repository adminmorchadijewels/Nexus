'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CCCard, CCCardFamily, CCStatement, CCCardPayment } from '@/lib/supabase/types'
import { CardTile } from '@/components/cc-manager/CardTile'
import { Plus, X, AlertCircle } from 'lucide-react'
import { addCard, addCardFamily } from '@/lib/cc-manager/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  cards: CCCard[]
  families: CCCardFamily[]
  statements: CCStatement[]
  payments: CCCardPayment[]
  orgId: string
}

const CARD_COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6']

export function CardsClient({ cards, families, statements, payments }: Props) {
  const router = useRouter()
  const [showAddCard, setShowAddCard] = useState(false)
  const [showAddFamily, setShowAddFamily] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Controlled state for fields that don't serialize via native FormData
  const [selectedFamilyId, setSelectedFamilyId] = useState('')
  const [selectedColor, setSelectedColor] = useState('#0D9488')

  const paidByStatement: Record<string, number> = {}
  payments.forEach((p) => {
    paidByStatement[p.statement_id] = (paidByStatement[p.statement_id] ?? 0) + p.amount
  })

  function getCurrentStatement(cardId: string) {
    return statements
      .filter((s) => s.card_id === cardId && s.status !== 'paid' && s.status !== 'zero_due')
      .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0]
  }

  function getOutstanding(cardId: string) {
    return statements
      .filter((s) => s.card_id === cardId && s.status !== 'paid' && s.status !== 'zero_due')
      .reduce((sum, s) => sum + Math.max(0, s.total_due - (paidByStatement[s.id] ?? 0)), 0)
  }

  function openAddCard() {
    setSelectedFamilyId(families[0]?.id ?? '')
    setSelectedColor('#0D9488')
    setError('')
    setShowAddCard(true)
  }

  async function handleAddCard(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedFamilyId) {
      setError('Please select or create a card family first')
      return
    }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData(e.currentTarget)
      fd.set('family_id', selectedFamilyId)
      fd.set('color', selectedColor)
      await addCard(fd)
      setShowAddCard(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add card')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddFamily(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const fd = new FormData(e.currentTarget)
      await addCardFamily(fd)
      setShowAddFamily(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create family')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Cards</h1>
          <p className="text-sm text-slate-400 mt-0.5">{cards.length} active cards</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => { setError(''); setShowAddFamily(true) }}
            variant="outline"
            className="text-xs border-white/10 text-slate-300 hover:bg-white/5"
          >
            + Family
          </Button>
          <motion.button
            whileHover={{ rotate: 45, scale: 1.12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={openAddCard}
            className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg"
            title="Add card"
          >
            <Plus size={18} />
          </motion.button>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm mb-3">No cards yet</p>
          {families.length === 0 && (
            <p className="text-xs text-amber-400 mb-3">Create a card family first (click &quot;+ Family&quot; above)</p>
          )}
          <Button onClick={openAddCard} className="bg-teal-600 hover:bg-teal-700 text-white">
            Add your first card
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.map((card, i) => {
            const family = families.find((f) => f.id === card.family_id)
            if (!family) return null
            return (
              <CardTile
                key={card.id}
                card={card}
                family={family}
                currentStatement={getCurrentStatement(card.id)}
                outstanding={getOutstanding(card.id)}
                index={i}
              />
            )
          })}
        </div>
      )}

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddCard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddCard(false)} />
            <motion.div
              className="glass-card rounded-2xl p-6 w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto scrollbar-thin"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">Add Card</h3>
                <button onClick={() => setShowAddCard(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-400 mb-1.5 block">Card Family</Label>
                  {families.length === 0 ? (
                    <div className="text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                      No families yet.{' '}
                      <button type="button" onClick={() => setShowAddFamily(true)} className="underline">
                        Create one first
                      </button>
                    </div>
                  ) : (
                    <Select value={selectedFamilyId} onValueChange={(v) => setSelectedFamilyId(v ?? '')} required>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select family" />
                      </SelectTrigger>
                      <SelectContent>
                        {families.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.cardholder_name} — {f.bank}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAddFamily(true)}
                    className="text-xs text-teal-400 mt-1 hover:underline"
                  >
                    + Create new family
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Card Name</Label>
                    <Input name="card_name" required className="bg-white/5 border-white/10 text-white" placeholder="e.g. Regalia Gold" />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Last 4 Digits</Label>
                    <Input name="last_four" required maxLength={4} minLength={4} className="bg-white/5 border-white/10 text-white font-mono" placeholder="4521" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Bill Generate Day</Label>
                    <Input name="bill_generate_day" type="number" min="1" max="28" required className="bg-white/5 border-white/10 text-white" placeholder="15" />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Buffer Days</Label>
                    <Input name="buffer_days" type="number" min="0" defaultValue="3" className="bg-white/5 border-white/10 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Registered Mobile</Label>
                    <Input name="registered_mobile" className="bg-white/5 border-white/10 text-white" placeholder="+91-..." />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Registered Email</Label>
                    <Input name="registered_email" type="email" className="bg-white/5 border-white/10 text-white" placeholder="you@..." />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Customer Care Phone</Label>
                    <Input name="customer_care_phone" className="bg-white/5 border-white/10 text-white" placeholder="1800-..." />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Annual Fees (₹)</Label>
                    <Input name="annual_fees" type="number" defaultValue="0" className="bg-white/5 border-white/10 text-white font-mono" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-400 mb-1.5 block">Customer Care Email(s)</Label>
                  <Input name="customer_care_emails" className="bg-white/5 border-white/10 text-white" placeholder="support@bank.com" />
                </div>

                <div>
                  <Label className="text-xs text-slate-400 mb-1.5 block">Benefits</Label>
                  <Textarea name="benefits" rows={3} className="bg-white/5 border-white/10 text-white resize-none" placeholder="Lounge access, reward points, etc." />
                </div>

                <div>
                  <Label className="text-xs text-slate-400 mb-2 block">Card Color</Label>
                  <div className="flex gap-2">
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className="w-7 h-7 rounded-full transition-all focus:outline-none"
                        style={{
                          background: c,
                          boxShadow: selectedColor === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                          transform: selectedColor === c ? 'scale(1.2)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  {loading ? 'Adding...' : 'Add Card'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Family Modal */}
      <AnimatePresence>
        {showAddFamily && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddFamily(false)} />
            <motion.div
              className="glass-card rounded-2xl p-6 w-full max-w-md relative z-10"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">Create Card Family</h3>
                <button onClick={() => setShowAddFamily(false)} className="text-slate-400 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleAddFamily} className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-400 mb-1.5 block">Cardholder Name</Label>
                  <Input name="cardholder_name" required className="bg-white/5 border-white/10 text-white" placeholder="Rahul Sharma" />
                </div>
                <div>
                  <Label className="text-xs text-slate-400 mb-1.5 block">Bank</Label>
                  <Input name="bank" required className="bg-white/5 border-white/10 text-white" placeholder="HDFC Bank" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Shared Limit (₹)</Label>
                    <Input name="shared_limit" type="number" required className="bg-white/5 border-white/10 text-white font-mono" placeholder="350000" />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 mb-1.5 block">Annual Cap (₹)</Label>
                    <Input name="annual_cap" type="number" defaultValue="900000" className="bg-white/5 border-white/10 text-white font-mono" />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  {loading ? 'Creating...' : 'Create Family'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
