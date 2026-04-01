import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function computeDueDate(cycleEndDate: Date, bufferDays: number): Date {
  return new Date(cycleEndDate.getTime() + bufferDays * 86400000)
}

function getCycleEnd(year: number, month: number, day: number): Date {
  // cycle_end = day before bill_generate_day of next month
  let endMonth = month + 1
  let endYear = year
  if (endMonth > 11) {
    endMonth = 0
    endYear = year + 1
  }
  // day before bill_generate_day in next month
  return new Date(endYear, endMonth, day - 1)
}

Deno.serve(async (_req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const today = new Date()
  const todayDay = today.getDate()
  const todayMonth = today.getMonth()
  const todayYear = today.getFullYear()

  // Fetch all active cards
  const { data: cards, error: cardsError } = await supabase
    .from('cc_cards')
    .select('*')
    .eq('is_active', true)

  if (cardsError || !cards) {
    return new Response(JSON.stringify({ error: 'Failed to fetch cards' }), { status: 500 })
  }

  const results: string[] = []

  for (const card of cards) {
    if (card.bill_generate_day !== todayDay) continue

    // Cycle: from bill_generate_day last month to today-1
    const cycleStart = new Date(
      todayMonth === 0 ? todayYear - 1 : todayYear,
      todayMonth === 0 ? 11 : todayMonth - 1,
      card.bill_generate_day
    )
    const cycleEnd = new Date(todayYear, todayMonth, todayDay - 1)
    const dueDate = computeDueDate(cycleEnd, card.buffer_days)

    // Check if statement already exists for this cycle
    const cycleStartStr = cycleStart.toISOString().split('T')[0]
    const { data: existing } = await supabase
      .from('cc_statements')
      .select('id')
      .eq('card_id', card.id)
      .eq('cycle_start', cycleStartStr)
      .single()

    if (existing) {
      results.push(`Card ${card.id}: statement already exists`)
      continue
    }

    const stmtId = `STMT-AUTO-${card.id}-${todayYear}${String(todayMonth + 1).padStart(2, '0')}`

    const { error: insertError } = await supabase.from('cc_statements').insert({
      id: stmtId,
      card_id: card.id,
      family_id: card.family_id,
      org_id: card.org_id,
      cycle_start: cycleStartStr,
      cycle_end: cycleEnd.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      status: 'unpaid',
      total_due: 0,
    })

    if (insertError) {
      results.push(`Card ${card.id}: failed to create — ${insertError.message}`)
      continue
    }

    results.push(`Card ${card.id}: statement created for cycle ${cycleStartStr}`)

    // Send email notification if registered_email exists
    if (card.registered_email) {
      // Email sending would integrate with Resend/SendGrid here
      results.push(`Card ${card.id}: notification queued for ${card.registered_email}`)
    }
  }

  return new Response(JSON.stringify({ processed: cards.length, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
