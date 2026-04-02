import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'

export default async function CCManagerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberRow } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!memberRow) {
    redirect('/setup')
  }

  const orgId = memberRow.org_id

  // Fetch all data server-side
  const [
    { data: families },
    { data: cards },
    { data: statements },
    { data: payments },
    { data: transactions },
    { data: milestones },
    { data: txnMilestones },
  ] = await Promise.all([
    supabase.from('cc_card_families').select('*').eq('org_id', orgId),
    supabase.from('cc_cards').select('*').eq('org_id', orgId).eq('is_active', true),
    supabase.from('cc_statements').select('*').eq('org_id', orgId),
    supabase.from('cc_card_payments').select('*').eq('org_id', orgId),
    supabase.from('cc_transactions').select('*').eq('org_id', orgId),
    supabase.from('cc_milestones').select('*').eq('org_id', orgId),
    supabase.from('cc_transaction_milestones').select('transaction_id, milestone_id'),
  ])

  return (
    <DashboardClient
      families={families ?? []}
      cards={cards ?? []}
      statements={statements ?? []}
      payments={payments ?? []}
      transactions={transactions ?? []}
      milestones={milestones ?? []}
      txnMilestones={txnMilestones ?? []}
      orgId={orgId}
    />
  )
}
