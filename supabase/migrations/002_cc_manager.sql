create table if not exists cc_card_families (
  id text primary key,
  org_id uuid references organisations(id),
  cardholder_name text not null,
  bank text not null,
  shared_limit numeric not null,
  annual_cap numeric default 900000,
  created_at timestamptz default now()
);

create table if not exists cc_cards (
  id text primary key,
  family_id text references cc_card_families(id),
  org_id uuid references organisations(id),
  card_name text not null,
  last_four char(4) not null,
  registered_mobile text,
  registered_email text,
  customer_care_phone text,
  customer_care_emails text,
  annual_fees numeric default 0,
  benefits text,
  bill_generate_day int not null check (bill_generate_day between 1 and 31),
  buffer_days int not null default 3,
  color text default '#0D9488',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists cc_statements (
  id text primary key,
  card_id text references cc_cards(id),
  family_id text references cc_card_families(id),
  org_id uuid references organisations(id),
  cycle_start date not null,
  cycle_end date not null,
  due_date date not null,
  is_zero_due boolean default false,
  total_due numeric default 0,
  status text default 'unpaid' check (status in ('unpaid','partial','paid','zero_due')),
  created_at timestamptz default now()
);

create table if not exists cc_transactions (
  id text primary key,
  statement_id text references cc_statements(id),
  card_id text references cc_cards(id),
  family_id text references cc_card_families(id),
  org_id uuid references organisations(id),
  merchant text not null,
  amount numeric not null,
  date date not null,
  category text check (category in ('travel','food','utilities','office','misc','others','reward')),
  milestone_tags text,
  exclude_from_9l boolean default false,
  notes text,
  logged_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists cc_milestones (
  id text primary key,
  card_id text references cc_cards(id),
  org_id uuid references organisations(id),
  title text not null,
  source text check (source in ('bank_defined','self_defined')),
  start_date date not null,
  end_date date not null,
  target_amount numeric default 0,
  status text default 'active' check (status in ('active','achieved','expired','missed')),
  created_at timestamptz default now()
);

create table if not exists cc_transaction_milestones (
  transaction_id text references cc_transactions(id),
  milestone_id text references cc_milestones(id),
  primary key (transaction_id, milestone_id)
);

create table if not exists cc_card_payments (
  id text primary key,
  card_id text references cc_cards(id),
  family_id text references cc_card_families(id),
  statement_id text references cc_statements(id),
  org_id uuid references organisations(id),
  amount numeric not null,
  payment_date date not null,
  payment_mode text check (payment_mode in ('upi','neft','auto_debit','cheque','reward')),
  tagged_to_9l boolean default true,
  notes text,
  created_at timestamptz default now()
);

create table if not exists cc_milestone_rewards (
  id text primary key,
  milestone_id text references cc_milestones(id),
  reward_type text check (reward_type in ('bonus_points','cashback','fee_waiver','voucher','lounge','custom')),
  reward_value numeric,
  reward_description text,
  is_credited boolean default false,
  created_at timestamptz default now()
);

-- RLS on all cc_ tables
alter table cc_card_families enable row level security;
alter table cc_cards enable row level security;
alter table cc_statements enable row level security;
alter table cc_transactions enable row level security;
alter table cc_milestones enable row level security;
alter table cc_transaction_milestones enable row level security;
alter table cc_card_payments enable row level security;
alter table cc_milestone_rewards enable row level security;

-- RLS policies
create policy "org members only" on cc_card_families
  for all using (
    org_id in (select org_id from org_members where user_id = auth.uid())
  );

create policy "org members only" on cc_cards
  for all using (
    org_id in (select org_id from org_members where user_id = auth.uid())
  );

create policy "org members only" on cc_statements
  for all using (
    org_id in (select org_id from org_members where user_id = auth.uid())
  );

create policy "org members only" on cc_transactions
  for all using (
    org_id in (select org_id from org_members where user_id = auth.uid())
  );

create policy "org members only" on cc_milestones
  for all using (
    org_id in (select org_id from org_members where user_id = auth.uid())
  );

create policy "org members only" on cc_transaction_milestones
  for all using (
    transaction_id in (
      select id from cc_transactions where org_id in (
        select org_id from org_members where user_id = auth.uid()
      )
    )
  );

create policy "org members only" on cc_card_payments
  for all using (
    org_id in (select org_id from org_members where user_id = auth.uid())
  );

create policy "org members only" on cc_milestone_rewards
  for all using (
    milestone_id in (
      select id from cc_milestones where org_id in (
        select org_id from org_members where user_id = auth.uid()
      )
    )
  );

-- RLS on shared tables
alter table organisations enable row level security;
alter table org_members enable row level security;

create policy "org members can view org" on organisations
  for select using (
    id in (select org_id from org_members where user_id = auth.uid())
  );

create policy "users can view their memberships" on org_members
  for select using (user_id = auth.uid());

create policy "org owners can manage members" on org_members
  for all using (
    org_id in (
      select org_id from org_members where user_id = auth.uid() and role = 'owner'
    )
  );
