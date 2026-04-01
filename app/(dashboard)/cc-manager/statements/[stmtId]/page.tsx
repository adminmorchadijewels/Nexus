import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { StatementDetailClient } from './StatementDetailClient'

export default async function StatementDetailPage({ params }: { params: { stmtId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberRow } = await supabase
    .from('org_members').select('org_id').eq('user_id', user.id).single()
  if (!memberRow) redirect('/login')

  const orgId = memberRow.org_id
  const stmtId = params.stmtId

  const [{ data: statement }, { data: transactions }, { data: payments }, { data: milestones }] =
    await Promise.all([
      supabase.from('cc_statements').select('*').eq('id', stmtId).single(),
      supabase.from('cc_transactions').select('*').eq('statement_id', stmtId).order('date', { ascending: false }),
      supabase.from('cc_card_payments').select('*').eq('statement_id', stmtId).order('payment_date', { ascending: false }),
      supabase.from('cc_milestones').select('*').eq('org_id', orgId).eq('status', 'active'),
    ])

  if (!statement) notFound()

  const { data: card } = await supabase.from('cc_cards').select('*').eq('id', statement.card_id).single()
  if (!card) notFound()

  return (
    <StatementDetailClient
      statement={statement}
      card={card}
      transactions={transactions ?? []}
      payments={payments ?? []}
      activeMilestones={milestones ?? []}
      orgId={orgId}
    />
  )
}
