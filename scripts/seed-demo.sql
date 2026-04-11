-- Whodo Demo Seed: "WW3 Prep - Urgent"
-- Run this in Supabase SQL Editor before the demo
-- Re-runnable: deletes existing demo plan first

-- Clean up previous demo data
DELETE FROM plans WHERE invite_code = 'WW3PREP';

DO $$
DECLARE
  _owner_id UUID;
  _plan_id UUID;
  _usa_id UUID;
  _iran_id UUID;
  _israel_id UUID;
  _india_id UUID;
  _un_id UUID;
  _task_missiles UUID;
  _task_wifi UUID;
  _task_oil UUID;
  _task_un UUID;
  _task_memes UUID;
  _task_bunker UUID;
  _task_chai UUID;
  _task_tweet UUID;
BEGIN
  -- Get the first user as the owner
  SELECT id INTO _owner_id FROM auth.users LIMIT 1;
  IF _owner_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Sign up first, then run this script.';
  END IF;

  -- Create the demo plan
  INSERT INTO plans (id, title, event_date, status, created_by, invite_code, template)
  VALUES (gen_random_uuid(), 'WW3 Prep - Urgent', CURRENT_DATE + INTERVAL '7 days', 'active', _owner_id, 'WW3PREP', 'custom')
  RETURNING id INTO _plan_id;

  -- Create participants (countries as people)
  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'USA', _owner_id, '#0066cc', 'organizer_added')
  RETURNING id INTO _usa_id;

  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'Iran', NULL, '#006a28', 'organizer_added')
  RETURNING id INTO _iran_id;

  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'Israel', NULL, '#6b1ef3', 'organizer_added')
  RETURNING id INTO _israel_id;

  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'India', NULL, '#e65100', 'organizer_added')
  RETURNING id INTO _india_id;

  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'UN', NULL, '#00838f', 'organizer_added')
  RETURNING id INTO _un_id;

  -- Tasks (the punchlines)

  -- 1. Check if missiles are still under warranty (PENDING, USA, $999k)
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Check if missiles are still under warranty', _usa_id, 'pending', 999999, _usa_id, _usa_id)
  RETURNING id INTO _task_missiles;

  -- 2. Make sure WiFi works in the bunker (PENDING, Iran)
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Make sure WiFi works in the bunker', _iran_id, 'pending', _usa_id)
  RETURNING id INTO _task_wifi;

  -- 3. Hide the oil before anyone notices (DONE, USA, $500k)
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by, completed_at)
  VALUES (gen_random_uuid(), _plan_id, 'Hide the oil before anyone notices', _usa_id, 'done', 500000, _usa_id, _usa_id, now() - INTERVAL '2 days')
  RETURNING id INTO _task_oil;

  -- 4. Draft a strongly worded letter (DONE, UN)
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, created_by, completed_at)
  VALUES (gen_random_uuid(), _plan_id, 'Draft a strongly worded letter', _un_id, 'done', _usa_id, now() - INTERVAL '1 day')
  RETURNING id INTO _task_un;

  -- 5. Prepare memes for both outcomes (PENDING, India)
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Prepare memes for both outcomes', _india_id, 'pending', _usa_id)
  RETURNING id INTO _task_memes;

  -- 6. Build bunker (budget: 1 IKEA shelf) (PENDING, Iran, $49)
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Build bunker (budget: 1 IKEA shelf)', _iran_id, 'pending', 49, _iran_id, _usa_id)
  RETURNING id INTO _task_bunker;

  -- 7. Stock chai for emergency meetings (PENDING, India, $200)
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Stock chai for emergency meetings', _india_id, 'pending', 200, _india_id, _usa_id)
  RETURNING id INTO _task_chai;

  -- 8. Post cryptic tweet to confuse everyone (PENDING, Israel)
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Post cryptic tweet to confuse everyone', _israel_id, 'pending', _usa_id)
  RETURNING id INTO _task_tweet;

  -- Custom expense splits

  -- Missiles: only USA and Israel split (they're buying together)
  INSERT INTO expense_splits (task_id, participant_id, weight) VALUES
    (_task_missiles, _usa_id, 3.0),
    (_task_missiles, _israel_id, 1.0);

  -- Oil: everyone pays (it's everyone's problem now)
  -- No splits = default equal among all

  -- Bunker: only Iran (their problem)
  INSERT INTO expense_splits (task_id, participant_id, weight) VALUES
    (_task_bunker, _iran_id, 1.0);

  -- Chai: India pays but UN drinks 2x
  INSERT INTO expense_splits (task_id, participant_id, weight) VALUES
    (_task_chai, _india_id, 1.0),
    (_task_chai, _un_id, 2.0);

  RAISE NOTICE 'Demo plan created! Invite code: WW3PREP';
  RAISE NOTICE 'Plan ID: %', _plan_id;
  RAISE NOTICE 'Join link: https://whodo.space/join/WW3PREP';
END $$;
