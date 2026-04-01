'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
// dates import removed

export async function getOrgIdServer(): Promise<string | null> {
  const supabase = await createClient()
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

export async function addCard(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const cardId = `CARD-${Date.now()}`
  const { error } = await supabase.from('cc_cards').insert({
    id: cardId,
    family_id: formData.get('family_id') as string,
    org_id: orgId,
    card_name: formData.get('card_name') as string,
    last_four: formData.get('last_four') as string,
    registered_mobile: formData.get('registered_mobile') as string || null,
    registered_email: formData.get('registered_email') as string || null,
    customer_care_phone: formData.get('customer_care_phone') as string || null,
    customer_care_emails: formData.get('customer_care_emails') as string || null,
    annual_fees: Number(formData.get('annual_fees')) || 0,
    benefits: formData.get('benefits') as string || null,
    bill_generate_day: Number(formData.get('bill_generate_day')),
    buffer_days: Number(formData.get('buffer_days')) || 3,
    color: formData.get('color') as string || '#0D9488',
  })

  if (error) throw new Error(error.message)
  revalidatePath('/cc-manager/cards')
}

export async function addCardFamily(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const familyId = `FAM-${Date.now()}`
  const { error } = await supabase.from('cc_card_families').insert({
    id: familyId,
    org_id: orgId,
    cardholder_name: formData.get('cardholder_name') as string,
    bank: formData.get('bank') as string,
    shared_limit: Number(formData.get('shared_limit')),
    annual_cap: Number(formData.get('annual_cap')) || 900000,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/cc-manager/families')
}

export async function logPayment(data: {
  card_id: string
  family_id: string
  statement_id: string
  amount: number
  payment_date: string
  payment_mode: 'upi' | 'neft' | 'auto_debit' | 'cheque' | 'reward'
  tagged_to_9l: boolean
  notes?: string
}) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const paymentId = `PAY-${Date.now()}`
  const { error } = await supabase.from('cc_card_payments').insert({
    id: paymentId,
    org_id: orgId,
    ...data,
  })

  if (error) throw new Error(error.message)

  // Update statement status
  const { data: payments } = await supabase
    .from('cc_card_payments')
    .select('amount')
    .eq('statement_id', data.statement_id)

  const { data: stmt } = await supabase
    .from('cc_statements')
    .select('total_due')
    .eq('id', data.statement_id)
    .single()

  if (payments && stmt) {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    let status: 'unpaid' | 'partial' | 'paid' | 'zero_due' = 'unpaid'
    if (totalPaid >= stmt.total_due) status = 'paid'
    else if (totalPaid > 0) status = 'partial'

    await supabase
      .from('cc_statements')
      .update({ status })
      .eq('id', data.statement_id)
  }

  revalidatePath('/cc-manager')
}

export async function logTransaction(data: {
  statement_id: string
  card_id: string
  family_id: string
  merchant: string
  amount: number
  date: string
  category: string
  milestone_ids?: string[]
  exclude_from_9l: boolean
  notes?: string
}) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const txnId = `TXN-${Date.now()}`

  const { error } = await supabase.from('cc_transactions').insert({
    id: txnId,
    org_id: orgId,
    statement_id: data.statement_id,
    card_id: data.card_id,
    family_id: data.family_id,
    merchant: data.merchant,
    amount: data.amount,
    date: data.date,
    category: data.category as 'travel' | 'food' | 'utilities' | 'office' | 'misc' | 'others' | 'reward',
    exclude_from_9l: data.exclude_from_9l,
    notes: data.notes ?? null,
    logged_by: user?.id ?? null,
  })

  if (error) throw new Error(error.message)

  if (data.milestone_ids && data.milestone_ids.length > 0) {
    const milestoneLinks = data.milestone_ids.map((mid) => ({
      transaction_id: txnId,
      milestone_id: mid,
    }))
    await supabase.from('cc_transaction_milestones').insert(milestoneLinks)
  }

  revalidatePath('/cc-manager')
}


export async function addMilestone(data: {
  card_id: string
  title: string
  source: 'bank_defined' | 'self_defined'
  start_date: string
  end_date: string
  target_amount: number
}) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const milestoneId = `MS-${Date.now()}`
  const { error } = await supabase.from('cc_milestones').insert({
    id: milestoneId,
    org_id: orgId,
    ...data,
    status: 'active',
  })

  if (error) throw new Error(error.message)
  revalidatePath('/cc-manager/milestones')
}

export async function updateStatementDue(stmtId: string, totalDue: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('cc_statements')
    .update({ total_due: totalDue })
    .eq('id', stmtId)

  if (error) throw new Error(error.message)
  revalidatePath('/cc-manager/statements')
}

export async function updateStatementStatus(
  stmtId: string,
  status: 'unpaid' | 'partial' | 'paid' | 'zero_due'
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('cc_statements')
    .update({ status, is_zero_due: status === 'zero_due' })
    .eq('id', stmtId)

  if (error) throw new Error(error.message)
  revalidatePath('/cc-manager/statements')
}

export async function toggleRewardCredited(rewardId: string, isCredited: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('cc_milestone_rewards')
    .update({ is_credited: isCredited })
    .eq('id', rewardId)

  if (error) throw new Error(error.message)
  revalidatePath('/cc-manager/milestones')
}
