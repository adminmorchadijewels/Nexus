-- Seed data for Nexus CC Manager
-- Organisation
INSERT INTO organisations (id, name, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Nexus Demo Org', now())
ON CONFLICT (id) DO NOTHING;

-- Card Families
INSERT INTO cc_card_families (id, org_id, cardholder_name, bank, shared_limit, annual_cap) VALUES
  ('FAM001', '11111111-1111-1111-1111-111111111111', 'Rahul Sharma', 'HDFC Bank', 350000, 900000),
  ('FAM002', '11111111-1111-1111-1111-111111111111', 'Rahul Sharma', 'Axis Bank', 320000, 900000)
ON CONFLICT (id) DO NOTHING;

-- Cards
INSERT INTO cc_cards (id, family_id, org_id, card_name, last_four, registered_mobile, registered_email, customer_care_phone, customer_care_emails, annual_fees, benefits, bill_generate_day, buffer_days, color, is_active) VALUES
  ('CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', 'Biz Platinum', '4521', '+91-9876543210', 'rahul@example.com', '1800-202-6161', 'hdfc.biz@example.com', 4999, 'Unlimited airport lounge access, 3x rewards on travel & dining, 1% fuel surcharge waiver', 15, 3, '#0D9488', true),
  ('CARD002', 'FAM001', '11111111-1111-1111-1111-111111111111', 'Regalia Gold', '8834', '+91-9876543210', 'rahul@example.com', '1800-202-6161', 'hdfc.regalia@example.com', 2500, '8 complimentary lounge visits/year, 4 reward points per ₹150 spent, Zomato Pro membership', 20, 3, '#6366F1', true),
  ('CARD003', 'FAM002', '11111111-1111-1111-1111-111111111111', 'Magnus Biz', '3391', '+91-9876543211', 'rahul@axis.com', '1860-419-5555', 'axis.magnus@example.com', 9999, 'Unlimited international lounge, 35 EDGE reward points/₹200, Premium concierge', 10, 5, '#F59E0B', true),
  ('CARD004', 'FAM002', '11111111-1111-1111-1111-111111111111', 'Coral Biz', '7712', '+91-9876543212', 'rahul@coral.com', '1860-419-5555', 'axis.coral@example.com', 500, '1% cashback on all spends, Fuel surcharge waiver', 25, 3, '#EC4899', true)
ON CONFLICT (id) DO NOTHING;

-- Statements (last 3 months)
INSERT INTO cc_statements (id, card_id, family_id, org_id, cycle_start, cycle_end, due_date, is_zero_due, total_due, status) VALUES
  -- CARD001 statements
  ('STMT001', 'CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', '2025-12-15', '2026-01-14', '2026-01-17', false, 45000, 'paid'),
  ('STMT002', 'CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', '2026-01-15', '2026-02-14', '2026-02-17', false, 62000, 'partial'),
  ('STMT003', 'CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', '2026-02-15', '2026-03-14', '2026-03-17', false, 38500, 'unpaid'),
  -- CARD002 statements
  ('STMT004', 'CARD002', 'FAM001', '11111111-1111-1111-1111-111111111111', '2025-12-20', '2026-01-19', '2026-01-22', false, 28000, 'paid'),
  ('STMT005', 'CARD002', 'FAM001', '11111111-1111-1111-1111-111111111111', '2026-01-20', '2026-02-19', '2026-02-22', false, 0, 'zero_due'),
  -- CARD003 statement
  ('STMT006', 'CARD003', 'FAM002', '11111111-1111-1111-1111-111111111111', '2026-02-10', '2026-03-09', '2026-03-14', false, 72000, 'unpaid')
ON CONFLICT (id) DO NOTHING;

-- Transactions
INSERT INTO cc_transactions (id, statement_id, card_id, family_id, org_id, merchant, amount, date, category, exclude_from_9l, notes) VALUES
  ('TXN001', 'STMT001', 'CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', 'IndiGo Airlines', 18500, '2025-12-22', 'travel', false, 'Mumbai-Delhi round trip'),
  ('TXN002', 'STMT001', 'CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', 'Amazon Business', 12000, '2026-01-02', 'office', false, 'Office supplies Q4'),
  ('TXN003', 'STMT001', 'CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', 'Swiggy', 2800, '2026-01-08', 'food', false, 'Team lunch'),
  ('TXN004', 'STMT002', 'CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', 'MakeMyTrip Hotels', 32000, '2026-01-18', 'travel', false, 'Bangalore conference stay'),
  ('TXN005', 'STMT002', 'CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', 'Zomato', 1800, '2026-01-25', 'food', false, null),
  ('TXN006', 'STMT002', 'CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', 'Jio Fiber', 999, '2026-02-01', 'utilities', false, 'Monthly broadband'),
  ('TXN007', 'STMT002', 'CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', 'Flipkart', 5500, '2026-02-05', 'office', false, 'Laptop accessories'),
  ('TXN008', 'STMT003', 'CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', 'Air India', 21000, '2026-02-18', 'travel', false, 'International milestone spend'),
  ('TXN009', 'STMT003', 'CARD001', 'FAM001', '11111111-1111-1111-1111-111111111111', 'Uber Business', 3200, '2026-02-22', 'travel', false, 'Corporate cabs'),
  ('TXN010', 'STMT004', 'CARD002', 'FAM001', '11111111-1111-1111-1111-111111111111', 'Taj Hotels', 22000, '2025-12-28', 'travel', false, 'Year-end retreat'),
  ('TXN011', 'STMT006', 'CARD003', 'FAM002', '11111111-1111-1111-1111-111111111111', 'IRCTC', 8500, '2026-02-14', 'travel', false, 'Train tickets bulk'),
  ('TXN012', 'STMT006', 'CARD003', 'FAM002', '11111111-1111-1111-1111-111111111111', 'Google Workspace', 4200, '2026-02-20', 'utilities', false, 'Annual subscription'),
  ('TXN013', 'STMT006', 'CARD003', 'FAM002', '11111111-1111-1111-1111-111111111111', 'Nykaa Business', 15000, '2026-03-01', 'misc', false, 'Gift hampers'),
  ('TXN014', 'STMT006', 'CARD003', 'FAM002', '11111111-1111-1111-1111-111111111111', 'AWS', 24000, '2026-03-05', 'utilities', false, 'Cloud infra Q1')
ON CONFLICT (id) DO NOTHING;

-- Milestones
INSERT INTO cc_milestones (id, card_id, org_id, title, source, start_date, end_date, target_amount, status) VALUES
  ('MS001', 'CARD001', '11111111-1111-1111-1111-111111111111', 'HDFC Biz Spend 3L in Q1 FY26', 'bank_defined', '2026-01-01', '2026-03-31', 300000, 'active'),
  ('MS002', 'CARD003', '11111111-1111-1111-1111-111111111111', 'Axis Magnus Annual Milestone 15L', 'bank_defined', '2025-04-01', '2026-03-31', 1500000, 'active'),
  ('MS003', 'CARD001', '11111111-1111-1111-1111-111111111111', 'Travel 1.5L for Lounge Tier', 'self_defined', '2025-11-01', '2026-04-30', 150000, 'active')
ON CONFLICT (id) DO NOTHING;

-- Transaction-Milestone links
INSERT INTO cc_transaction_milestones (transaction_id, milestone_id) VALUES
  ('TXN004', 'MS001'),
  ('TXN008', 'MS001'),
  ('TXN008', 'MS003'),
  ('TXN001', 'MS003'),
  ('TXN010', 'MS003'),
  ('TXN011', 'MS002'),
  ('TXN014', 'MS002')
ON CONFLICT DO NOTHING;

-- Payments
INSERT INTO cc_card_payments (id, card_id, family_id, statement_id, org_id, amount, payment_date, payment_mode, tagged_to_9l, notes) VALUES
  ('PAY001', 'CARD001', 'FAM001', 'STMT001', '11111111-1111-1111-1111-111111111111', 45000, '2026-01-16', 'upi', true, 'Full payment STMT001'),
  ('PAY002', 'CARD002', 'FAM001', 'STMT004', '11111111-1111-1111-1111-111111111111', 28000, '2026-01-20', 'neft', true, 'Full payment STMT004'),
  ('PAY003', 'CARD001', 'FAM001', 'STMT002', '11111111-1111-1111-1111-111111111111', 40000, '2026-02-15', 'upi', true, 'Partial payment STMT002'),
  ('PAY004', 'CARD001', 'FAM001', 'STMT002', '11111111-1111-1111-1111-111111111111', 5000, '2026-02-20', 'reward', false, 'Reward points redemption')
ON CONFLICT (id) DO NOTHING;

-- Milestone Rewards
INSERT INTO cc_milestone_rewards (id, milestone_id, reward_type, reward_value, reward_description, is_credited) VALUES
  ('REW001', 'MS001', 'bonus_points', 10000, '10,000 bonus reward points on 3L spend milestone', false),
  ('REW002', 'MS001', 'voucher', 2000, 'Amazon voucher worth ₹2,000', false),
  ('REW003', 'MS002', 'fee_waiver', 9999, 'Annual fee waiver on 15L annual spend', false),
  ('REW004', 'MS002', 'lounge', null, 'Unlimited domestic & international lounge access upgrade', false),
  ('REW005', 'MS003', 'bonus_points', 5000, '5,000 bonus miles for lounge tier upgrade', false)
ON CONFLICT (id) DO NOTHING;
