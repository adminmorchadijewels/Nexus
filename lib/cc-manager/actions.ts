'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

// ─── Validation Schemas ─────────────────────────────────────────────────────

const AddCardSchema = z.object({
  family_id: z.string().min(1),
  card_name: z.string().min(1).max(100),
  last_four: z.string().length(4).regex(/^\d{4}$/),
  registered_mobile: z.string().max(20).optional().nullable(),
  registered_email: z.string().email().optional().nullable(),
  customer_care_phone: z.string().max(20).optional().nullable(),
  customer_care_emails: z.string().max(200).optional().nullable(),
  annual_fees: z.coerce.number().min(0),
  benefits: z.string().max(2000).optional().nullable(),
  bill_generate_day: z.coerce.number().int().min(1).max(28),
  buffer_days: z.coerce.number().int().min(0).max(30),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#0D9488'),
})

const AddCardFamilySchema = z.object({
  cardholder_name: z.string().min(1).max(100),
  bank: z.string().min(1).max(100),
  shared_limit: z.coerce.number().positive(),
  annual_cap: z.coerce.number().min(0).default(900000),
})

const LogPaymentSchema = z.object({
  card_id: z.string().min(1),
  family_id: z.string().min(1),
  statement_id: z.string().min(1),
  amount: z.number().positive(),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payment_mode: z.enum(['upi', 'neft', 'auto_debit', 'cheque', 'reward']),
  tagged_to_9l: z.boolean(),
  notes: z.string().max(500).optional(),
})

const LogTransactionSchema = z.object({
  statement_id: z.string().min(1),
  card_id: z.string().min(1),
  family_id: z.string().min(1),
  merchant: z.string().min(1).max(200),
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.enum(['travel', 'food', 'utilities', 'office', 'misc', 'others', 'reward']),
  milestone_ids: z.array(z.string()).optional(),
  exclude_from_9l: z.boolean(),
  notes: z.string().max(500).optional(),
})

const AddMilestoneSchema = z.object({
  card_id: z.string().min(1),
  title: z.string().min(1).max(200),
  source: z.enum(['bank_defined', 'self_defined']),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  target_amount: z.number().min(0),
})

// ─── Actions ────────────────────────────────────────────────────────────────

export async function addCard(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const parsed = AddCardSchema.safeParse({
    family_id: formData.get('family_id'),
    card_name: formData.get('card_name'),
    last_four: formData.get('last_four'),
    registered_mobile: formData.get('registered_mobile') || null,
    registered_email: formData.get('registered_email') || null,
    customer_care_phone: formData.get('customer_care_phone') || null,
    customer_care_emails: formData.get('customer_care_emails') || null,
    annual_fees: formData.get('annual_fees'),
    benefits: formData.get('benefits') || null,
    bill_generate_day: formData.get('bill_generate_day'),
    buffer_days: formData.get('buffer_days'),
    color: formData.get('color'),
  })

  if (!parsed.success) {
    throw new Error('Invalid input: ' + parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { error } = await supabase.from('cc_cards').insert({
    id: crypto.randomUUID(),
    org_id: orgId,
    ...parsed.data,
  })

  if (error) throw new Error('Failed to add card')
  revalidatePath('/cc-manager/cards')
}

export async function addCardFamily(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const parsed = AddCardFamilySchema.safeParse({
    cardholder_name: formData.get('cardholder_name'),
    bank: formData.get('bank'),
    shared_limit: formData.get('shared_limit'),
    annual_cap: formData.get('annual_cap'),
  })

  if (!parsed.success) {
    throw new Error('Invalid input: ' + parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { error } = await supabase.from('cc_card_families').insert({
    id: crypto.randomUUID(),
    org_id: orgId,
    ...parsed.data,
  })

  if (error) throw new Error('Failed to add card family')
  revalidatePath('/cc-manager/families')
}

export async function logPayment(data: z.infer<typeof LogPaymentSchema>) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const parsed = LogPaymentSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error('Invalid input: ' + parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { error } = await supabase.from('cc_card_payments').insert({
    id: crypto.randomUUID(),
    org_id: orgId,
    ...parsed.data,
  })

  if (error) throw new Error('Failed to log payment')

  // Update statement status
  const { data: payments } = await supabase
    .from('cc_card_payments')
    .select('amount')
    .eq('statement_id', parsed.data.statement_id)

  const { data: stmt } = await supabase
    .from('cc_statements')
    .select('total_due')
    .eq('id', parsed.data.statement_id)
    .single()

  if (payments && stmt) {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    let status: 'unpaid' | 'partial' | 'paid' | 'zero_due' = 'unpaid'
    if (totalPaid >= stmt.total_due) status = 'paid'
    else if (totalPaid > 0) status = 'partial'

    await supabase
      .from('cc_statements')
      .update({ status })
      .eq('id', parsed.data.statement_id)
  }

  revalidatePath('/cc-manager')
}

export async function logTransaction(data: z.infer<typeof LogTransactionSchema>) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const parsed = LogTransactionSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error('Invalid input: ' + parsed.error.issues.map((i) => i.message).join(', '))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const txnId = crypto.randomUUID()

  const { error } = await supabase.from('cc_transactions').insert({
    id: txnId,
    org_id: orgId,
    statement_id: parsed.data.statement_id,
    card_id: parsed.data.card_id,
    family_id: parsed.data.family_id,
    merchant: parsed.data.merchant,
    amount: parsed.data.amount,
    date: parsed.data.date,
    category: parsed.data.category,
    exclude_from_9l: parsed.data.exclude_from_9l,
    notes: parsed.data.notes ?? null,
    logged_by: user?.id ?? null,
  })

  if (error) throw new Error('Failed to log transaction')

  if (parsed.data.milestone_ids && parsed.data.milestone_ids.length > 0) {
    const milestoneLinks = parsed.data.milestone_ids.map((mid) => ({
      transaction_id: txnId,
      milestone_id: mid,
    }))
    await supabase.from('cc_transaction_milestones').insert(milestoneLinks)
  }

  revalidatePath('/cc-manager')
}

export async function addMilestone(data: z.infer<typeof AddMilestoneSchema>) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const parsed = AddMilestoneSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error('Invalid input: ' + parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { error } = await supabase.from('cc_milestones').insert({
    id: crypto.randomUUID(),
    org_id: orgId,
    ...parsed.data,
    status: 'active',
  })

  if (error) throw new Error('Failed to add milestone')
  revalidatePath('/cc-manager/milestones')
}

export async function updateStatementDue(stmtId: string, totalDue: number) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('cc_statements')
    .update({ total_due: totalDue })
    .eq('id', stmtId)
    .eq('org_id', orgId)

  if (error) throw new Error('Failed to update statement')
  revalidatePath('/cc-manager/statements')
}

export async function updateStatementStatus(
  stmtId: string,
  status: 'unpaid' | 'partial' | 'paid' | 'zero_due'
) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('cc_statements')
    .update({ status, is_zero_due: status === 'zero_due' })
    .eq('id', stmtId)
    .eq('org_id', orgId)

  if (error) throw new Error('Failed to update statement status')
  revalidatePath('/cc-manager/statements')
}

export async function toggleRewardCredited(rewardId: string, isCredited: boolean) {
  const supabase = await createClient()
  const orgId = await getOrgIdServer()
  if (!orgId) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('cc_milestone_rewards')
    .update({ is_credited: isCredited })
    .eq('id', rewardId)

  if (error) throw new Error('Failed to update reward')
  revalidatePath('/cc-manager/milestones')
}
