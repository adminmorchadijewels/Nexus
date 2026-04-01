import { createClient } from '@/lib/supabase/client'
import { getFYRange } from '@/lib/utils/dates'
import {
  CCCard,
  CCCardFamily,
  CCCardPayment,
  CCMilestone,
  CCMilestoneReward,
  CCStatement,
  CCTransaction,
} from '@/lib/supabase/types'

export async function getOrgId(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  return data?.org_id ?? null
}

export async function getCardFamilies(orgId: string): Promise<CCCardFamily[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('cc_card_families')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getCards(orgId: string): Promise<CCCard[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('cc_cards')
    .select('*')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getCard(cardId: string): Promise<CCCard | null> {
  const supabase = createClient()
  const { data } = await supabase.from('cc_cards').select('*').eq('id', cardId).single()
  return data
}

export async function getStatements(orgId: string, cardId?: string): Promise<CCStatement[]> {
  const supabase = createClient()
  let query = supabase
    .from('cc_statements')
    .select('*')
    .eq('org_id', orgId)
    .order('due_date', { ascending: true })

  if (cardId) query = query.eq('card_id', cardId)

  const { data } = await query
  return data ?? []
}

export async function getStatement(stmtId: string): Promise<CCStatement | null> {
  const supabase = createClient()
  const { data } = await supabase.from('cc_statements').select('*').eq('id', stmtId).single()
  return data
}

export async function getTransactions(
  orgId: string,
  statementId?: string
): Promise<CCTransaction[]> {
  const supabase = createClient()
  let query = supabase
    .from('cc_transactions')
    .select('*')
    .eq('org_id', orgId)
    .order('date', { ascending: false })

  if (statementId) query = query.eq('statement_id', statementId)

  const { data } = await query
  return data ?? []
}

export async function getPayments(
  orgId: string,
  statementId?: string
): Promise<CCCardPayment[]> {
  const supabase = createClient()
  let query = supabase
    .from('cc_card_payments')
    .select('*')
    .eq('org_id', orgId)
    .order('payment_date', { ascending: false })

  if (statementId) query = query.eq('statement_id', statementId)

  const { data } = await query
  return data ?? []
}

export async function getMilestones(
  orgId: string,
  cardId?: string
): Promise<CCMilestone[]> {
  const supabase = createClient()
  let query = supabase
    .from('cc_milestones')
    .select('*')
    .eq('org_id', orgId)
    .order('end_date', { ascending: true })

  if (cardId) query = query.eq('card_id', cardId)

  const { data } = await query
  return data ?? []
}

export async function getMilestoneRewards(milestoneId: string): Promise<CCMilestoneReward[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('cc_milestone_rewards')
    .select('*')
    .eq('milestone_id', milestoneId)
  return data ?? []
}

export async function getFYTransactions(orgId: string): Promise<CCTransaction[]> {
  const supabase = createClient()
  const { start, end } = getFYRange(new Date())
  const { data } = await supabase
    .from('cc_transactions')
    .select('*')
    .eq('org_id', orgId)
    .gte('date', start.toISOString().split('T')[0])
    .lte('date', end.toISOString().split('T')[0])
  return data ?? []
}

export async function getFYPayments(orgId: string): Promise<CCCardPayment[]> {
  const supabase = createClient()
  const { start, end } = getFYRange(new Date())
  const { data } = await supabase
    .from('cc_card_payments')
    .select('*')
    .eq('org_id', orgId)
    .gte('payment_date', start.toISOString().split('T')[0])
    .lte('payment_date', end.toISOString().split('T')[0])
  return data ?? []
}

export async function getMilestoneTransactions(
  milestoneId: string
): Promise<CCTransaction[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('cc_transaction_milestones')
    .select('transaction_id')
    .eq('milestone_id', milestoneId)

  if (!data || data.length === 0) return []

  const transactionIds = data.map((r) => r.transaction_id)
  const { data: txns } = await supabase
    .from('cc_transactions')
    .select('*')
    .in('id', transactionIds)

  return txns ?? []
}
