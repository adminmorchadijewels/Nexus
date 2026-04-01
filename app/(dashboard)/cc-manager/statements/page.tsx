import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatementsClient } from './StatementsClient'

export default async function StatementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberRow } = await supabase
    .from('org_members').select('org_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/login')

  const orgId = memberRow.org_id

  const [{ data: statements }, { data: cards }, { data: payments }] = await Promise.all([
    supabase.from('cc_statements').select('*').eq('org_id', orgId).order('due_date', { ascending: true }),
    supabase.from('cc_cards').select('*').eq('org_id', orgId),
    supabase.from('cc_card_payments').select('*').eq('org_id', orgId),
  ])

  return (
    <StatementsClient
      statements={statements ?? []}
      cards={cards ?? []}
      payments={payments ?? []}
    />
  )
}
