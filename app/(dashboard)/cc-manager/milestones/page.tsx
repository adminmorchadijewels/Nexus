import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MilestonesClient } from './MilestonesClient'

export default async function MilestonesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberRow } = await supabase
    .from('org_members').select('org_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/login')

  const orgId = memberRow.org_id

  const [{ data: milestones }, { data: cards }, { data: rewards }, { data: txnMilestones }, { data: transactions }] =
    await Promise.all([
      supabase.from('cc_milestones').select('*').eq('org_id', orgId).order('end_date'),
      supabase.from('cc_cards').select('*').eq('org_id', orgId),
      supabase.from('cc_milestone_rewards').select('*'),
      supabase.from('cc_transaction_milestones').select('*'),
      supabase.from('cc_transactions').select('id, amount').eq('org_id', orgId),
    ])

  return (
    <MilestonesClient
      milestones={milestones ?? []}
      cards={cards ?? []}
      rewards={rewards ?? []}
      txnMilestones={txnMilestones ?? []}
      transactions={transactions ?? []}
      orgId={orgId}
    />
  )
}
