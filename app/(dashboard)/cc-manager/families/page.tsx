import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FamiliesClient } from './FamiliesClient'

export default async function FamiliesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberRow } = await supabase
    .from('org_members').select('org_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/login')

  const orgId = memberRow.org_id

  const [{ data: families }, { data: transactions }, { data: payments }] = await Promise.all([
    supabase.from('cc_card_families').select('*').eq('org_id', orgId),
    supabase.from('cc_transactions').select('*').eq('org_id', orgId),
    supabase.from('cc_card_payments').select('*').eq('org_id', orgId),
  ])

  return (
    <FamiliesClient
      families={families ?? []}
      transactions={transactions ?? []}
      payments={payments ?? []}
    />
  )
}
