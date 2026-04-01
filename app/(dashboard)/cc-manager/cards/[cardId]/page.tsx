import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CardDetailClient } from './CardDetailClient'

export default async function CardDetailPage({ params }: { params: { cardId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberRow } = await supabase
    .from('org_members').select('org_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/login')

  const cardId = params.cardId

  const { data: card } = await supabase.from('cc_cards').select('*').eq('id', cardId).single()
  if (!card) notFound()

  const [{ data: family }, { data: statements }, { data: payments }, { data: milestones }] =
    await Promise.all([
      supabase.from('cc_card_families').select('*').eq('id', card.family_id).single(),
      supabase.from('cc_statements').select('*').eq('card_id', cardId).order('due_date', { ascending: false }),
      supabase.from('cc_card_payments').select('*').eq('card_id', cardId),
      supabase.from('cc_milestones').select('*').eq('card_id', cardId).eq('status', 'active'),
    ])

  return (
    <CardDetailClient
      card={card}
      family={family}
      statements={statements ?? []}
      payments={payments ?? []}
      milestones={milestones ?? []}
    />
  )
}
