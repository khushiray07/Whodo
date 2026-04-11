-- ================================================
-- Whodo Demo Seed: "WW3 Prep - Urgent"
-- 5 nations. 1 plan. 0 diplomacy.
-- Run this in Supabase SQL Editor before the demo
-- Re-runnable: nukes the old demo data (pun intended)
-- ================================================

-- Peace was never an option
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
  -- Whoever signed up first gets to be the superpower
  SELECT id INTO _owner_id FROM auth.users LIMIT 1;
  IF _owner_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Sign up first, then run this script.';
  END IF;

  -- The group chat that escalated way too fast
  INSERT INTO plans (id, title, event_date, status, created_by, invite_code, template)
  VALUES (gen_random_uuid(), 'WW3 Prep - Urgent', CURRENT_DATE + INTERVAL '7 days', 'active', _owner_id, 'WW3PREP', 'custom')
  RETURNING id INTO _plan_id;

  -- ============ THE WORLD LEADERS ============
  -- (or at least, their interns)

  -- The one who made the group and immediately pinned 14 messages
  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'USA', _owner_id, '#0066cc', 'organizer_added')
  RETURNING id INTO _usa_id;

  -- Showed up late but brought receipts
  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'Iran', NULL, '#006a28', 'organizer_added')
  RETURNING id INTO _iran_id;

  -- Already has 3 contingency plans and a PowerPoint
  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'Israel', NULL, '#6b1ef3', 'organizer_added')
  RETURNING id INTO _israel_id;

  -- Here for the chai and the memes. Will mediate if snacks are provided.
  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'India', NULL, '#e65100', 'organizer_added')
  RETURNING id INTO _india_id;

  -- Keeps typing "we condemn this" and nothing else
  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'UN', NULL, '#00838f', 'organizer_added')
  RETURNING id INTO _un_id;

  -- ============ THE TO-DO LIST FOR ARMAGEDDON ============

  -- $999k seems reasonable for "are these still covered?" paperwork
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Check if missiles are still under warranty', _usa_id, 'pending', 999999, _usa_id, _usa_id)
  RETURNING id INTO _task_missiles;

  -- Priorities. Can't doom-scroll without WiFi.
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Make sure WiFi works in the bunker', _iran_id, 'pending', _usa_id)
  RETURNING id INTO _task_wifi;

  -- Already done. USA doesn't mess around when oil is involved.
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by, completed_at)
  VALUES (gen_random_uuid(), _plan_id, 'Hide the oil before anyone notices', _usa_id, 'done', 500000, _usa_id, _usa_id, now() - INTERVAL '2 days')
  RETURNING id INTO _task_oil;

  -- Done in record time. UN's specialty: letters nobody reads.
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, created_by, completed_at)
  VALUES (gen_random_uuid(), _plan_id, 'Draft a strongly worded letter', _un_id, 'done', _usa_id, now() - INTERVAL '1 day')
  RETURNING id INTO _task_un;

  -- India's real contribution to global conflict: content creation
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Prepare memes for both outcomes', _india_id, 'pending', _usa_id)
  RETURNING id INTO _task_memes;

  -- $49 budget. One IKEA shelf. Iran is nothing if not resourceful.
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Build bunker (budget: 1 IKEA shelf)', _iran_id, 'pending', 49, _iran_id, _usa_id)
  RETURNING id INTO _task_bunker;

  -- No emergency meeting ever started without chai. Fact.
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Stock chai for emergency meetings', _india_id, 'pending', 200, _india_id, _usa_id)
  RETURNING id INTO _task_chai;

  -- Psychological warfare, 280 characters at a time
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Post cryptic tweet to confuse everyone', _israel_id, 'pending', _usa_id)
  RETURNING id INTO _task_tweet;

  -- ============ WHO'S PAYING FOR THE APOCALYPSE ============

  -- Missiles: USA and Israel going halves (ish — USA paying 3x more, obviously)
  INSERT INTO expense_splits (task_id, participant_id, weight) VALUES
    (_task_missiles, _usa_id, 3.0),
    (_task_missiles, _israel_id, 1.0);

  -- Oil: no custom splits = everyone pays equally. It's everyone's problem now.

  -- Bunker: Iran's problem, Iran's bill
  INSERT INTO expense_splits (task_id, participant_id, weight) VALUES
    (_task_bunker, _iran_id, 1.0);

  -- Chai: India pays, but UN drinks twice as much (all those emergency sessions)
  INSERT INTO expense_splits (task_id, participant_id, weight) VALUES
    (_task_chai, _india_id, 1.0),
    (_task_chai, _un_id, 2.0);

  -- ============ THE UN GROUP CHAT ============

  -- Missiles
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_missiles, _israel_id, 'Can we get a bulk discount?', now() - INTERVAL '3 days'),
    (gen_random_uuid(), _task_missiles, _un_id, 'We strongly advise against this purchase', now() - INTERVAL '3 days' + INTERVAL '10 minutes'),
    (gen_random_uuid(), _task_missiles, _usa_id, 'Noted. Anyway, how many can we fit in one cart?', now() - INTERVAL '3 days' + INTERVAL '20 minutes');

  -- WiFi in the bunker
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_wifi, _iran_id, 'Need at least 100mbps, we have to stream the war live', now() - INTERVAL '2 days'),
    (gen_random_uuid(), _task_wifi, _india_id, 'Bro just use Jio', now() - INTERVAL '2 days' + INTERVAL '5 minutes');

  -- Oil
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_oil, _iran_id, 'We know it was you.', now() - INTERVAL '1 day'),
    (gen_random_uuid(), _task_oil, _usa_id, 'What oil? I don''t see any oil.', now() - INTERVAL '1 day' + INTERVAL '2 minutes'),
    (gen_random_uuid(), _task_oil, _india_id, 'Can we not do this in the group chat please', now() - INTERVAL '1 day' + INTERVAL '10 minutes');

  -- Strongly worded letter
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_un, _usa_id, 'Did anyone actually read it?', now() - INTERVAL '20 hours'),
    (gen_random_uuid(), _task_un, _india_id, 'TL;DR: "please stop"', now() - INTERVAL '20 hours' + INTERVAL '5 minutes'),
    (gen_random_uuid(), _task_un, _un_id, 'It was 47 pages and I worked very hard on it', now() - INTERVAL '20 hours' + INTERVAL '15 minutes');

  -- Memes
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_memes, _india_id, 'Already have 200 saved. Just need to know who wins.', now() - INTERVAL '18 hours'),
    (gen_random_uuid(), _task_memes, _israel_id, 'Share the folder when it''s ready', now() - INTERVAL '18 hours' + INTERVAL '30 minutes');

  -- Bunker
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_bunker, _usa_id, 'IKEA? Really?', now() - INTERVAL '12 hours'),
    (gen_random_uuid(), _task_bunker, _iran_id, 'Budget is budget. At least it comes with an Allen key.', now() - INTERVAL '12 hours' + INTERVAL '10 minutes');

  -- Chai
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_chai, _un_id, 'Can we get decaf? Some of us have meetings at 6am', now() - INTERVAL '6 hours'),
    (gen_random_uuid(), _task_chai, _india_id, 'Decaf chai is a war crime and I will not be part of it', now() - INTERVAL '6 hours' + INTERVAL '5 minutes');

  -- Cryptic tweet
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_tweet, _israel_id, 'Draft: "Something is coming. Or not. Stay tuned."', now() - INTERVAL '3 hours'),
    (gen_random_uuid(), _task_tweet, _usa_id, 'Perfect. Nobody will know what it means. Including us.', now() - INTERVAL '3 hours' + INTERVAL '8 minutes'),
    (gen_random_uuid(), _task_tweet, _iran_id, 'Why are we like this', now() - INTERVAL '3 hours' + INTERVAL '20 minutes');

  RAISE NOTICE 'Demo plan created! Invite code: WW3PREP';
  RAISE NOTICE 'Plan ID: %', _plan_id;
  RAISE NOTICE 'Join link: https://whodo.space/join/WW3PREP';
END $$;
