import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CardsClient } from './CardsClient'

export default async function CardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberRow } = await supabase
    .from('org_members').select('org_id').eq('user_id', user.id).single()

  let orgId = memberRow?.org_id ?? null
  if (!orgId) {
    const { data: rpcOrgId } = await supabase.rpc('get_my_org_id')
    orgId = rpcOrgId ?? null
  }
  if (!orgId) redirect('/setup')

  const [{ data: cards }, { data: families }, { data: statements }, { data: payments }] =
    await Promise.all([
      supabase.from('cc_cards').select('*').eq('org_id', orgId).eq('is_active', true),
      supabase.from('cc_card_families').select('*').eq('org_id', orgId),
      supabase.from('cc_statements').select('*').eq('org_id', orgId),
      supabase.from('cc_card_payments').select('*').eq('org_id', orgId),
    ])

  return (
    <CardsClient
      cards={cards ?? []}
      families={families ?? []}
      statements={statements ?? []}
      payments={payments ?? []}
      orgId={orgId}
    />
  )
}
