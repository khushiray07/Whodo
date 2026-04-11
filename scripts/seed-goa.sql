-- ================================================
-- Whodo Demo Seed: "Goa Trip 2026"
-- 6 friends. 4 scooters. 1 villa. 0 planning skills.
-- Run this in Supabase SQL Editor before the demo
-- Re-runnable: wipes the old trip like it never happened
-- ================================================

-- Bye bye old trip, this one's gonna be better
DELETE FROM plans WHERE invite_code = 'GOADEMO';

DO $$
DECLARE
  _owner_id UUID;
  _plan_id UUID;
  _harsh_id UUID;
  _gauri_id UUID;
  _surbhi_id UUID;
  _deep_id UUID;
  _suvidha_id UUID;
  _akansha_id UUID;
  _task_train UUID;
  _task_villa UUID;
  _task_scooters UUID;
  _task_watersports UUID;
  _task_sunscreen UUID;
  _task_playlist UUID;
  _task_dudhsagar UUID;
  _task_cruise UUID;
  _task_snacks UUID;
  _task_thalassa UUID;
BEGIN
  -- Grab whoever signed up first — that's the trip organizer
  SELECT id INTO _owner_id FROM auth.users LIMIT 1;
  IF _owner_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Sign up first, then run this script.';
  END IF;

  -- The trip that started with "bro let's go Goa" in a group chat at 2am
  INSERT INTO plans (id, title, event_date, status, created_by, invite_code, template)
  VALUES (gen_random_uuid(), 'Goa Trip 2026', CURRENT_DATE + INTERVAL '7 days', 'active', _owner_id, 'GOADEMO', 'trip')
  RETURNING id INTO _plan_id;

  -- ============ THE SQUAD ============
  -- 6 people, 6 opinions, 1 shared Google Maps pin

  -- The guy who books things at 3am and sends screenshots at 7am
  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'Harsh', _owner_id, '#2196f3', 'organizer_added')
  RETURNING id INTO _harsh_id;

  -- Found the villa. Will also find the best Instagram spots.
  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'Gauri', NULL, '#9c27b0', 'organizer_added')
  RETURNING id INTO _gauri_id;

  -- DJ of the group. Playlist is her love language.
  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'Surbhi', NULL, '#ff9800', 'organizer_added')
  RETURNING id INTO _surbhi_id;

  -- Designated driver. Also designated "let's do something crazy" person.
  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'Deep', NULL, '#4caf50', 'organizer_added')
  RETURNING id INTO _deep_id;

  -- Packed sunscreen before anyone said "Goa". Mom energy.
  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'Suvidha', NULL, '#00bcd4', 'organizer_added')
  RETURNING id INTO _suvidha_id;

  -- Will research every restaurant, beach, and water sport in a 50km radius
  INSERT INTO participants (id, plan_id, name, user_id, color, joined_via)
  VALUES (gen_random_uuid(), _plan_id, 'Akansha', NULL, '#f44336', 'organizer_added')
  RETURNING id INTO _akansha_id;

  -- ============ THE CHAOS LIST ============
  -- Some done, some pending, all vibes

  -- Harsh came through clutch — 7 Konkan Railway tickets, window seats secured
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by, completed_at)
  VALUES (gen_random_uuid(), _plan_id, 'Book train tickets (Konkan Railway!)', _harsh_id, 'done', 9800, _harsh_id, _harsh_id, now() - INTERVAL '5 days')
  RETURNING id INTO _task_train;

  -- Gauri found one with a pool AND a hammock. Legend.
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by, completed_at)
  VALUES (gen_random_uuid(), _plan_id, 'Find a villa that fits 6 people + chaos', _gauri_id, 'done', 22000, _gauri_id, _harsh_id, now() - INTERVAL '4 days')
  RETURNING id INTO _task_villa;

  -- 4 scooters for 7 people. The math doesn't math but we'll manage.
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Rent 4 scooters from Baga', _deep_id, 'pending', 3200, _deep_id, _harsh_id)
  RETURNING id INTO _task_scooters;

  -- Akansha's been comparing water sport packages for 3 days straight
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Book parasailing + jet ski at Calangute', _akansha_id, 'pending', 7000, _akansha_id, _harsh_id)
  RETURNING id INTO _task_watersports;

  -- Suvidha already has a full medical kit. Obviously.
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by, completed_at)
  VALUES (gen_random_uuid(), _plan_id, 'Buy sunscreen, mosquito spray & first-aid', _suvidha_id, 'done', 1800, _suvidha_id, _harsh_id, now() - INTERVAL '2 days')
  RETURNING id INTO _task_sunscreen;

  -- No expense. Just 4 hours of Surbhi fighting over whether to add Arijit Singh.
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, created_by, completed_at)
  VALUES (gen_random_uuid(), _plan_id, 'Make the ultimate road trip playlist', _surbhi_id, 'done', _harsh_id, now() - INTERVAL '3 days')
  RETURNING id INTO _task_playlist;

  -- Deep's pulling double duty — scooters AND waterfalls
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Plan Dudhsagar waterfall jeep safari', _deep_id, 'pending', 5600, _deep_id, _harsh_id)
  RETURNING id INTO _task_dudhsagar;

  -- Surbhi's treating this cruise like a personal photoshoot and we respect it
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Book sunset cruise from Panjim', _surbhi_id, 'pending', 6300, _surbhi_id, _harsh_id)
  RETURNING id INTO _task_cruise;

  -- Someone has to be the snack person. Surbhi volunteered (suspiciously fast).
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, expense_amount, expense_paid_by, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Stock up on snacks & drinks for the villa', _surbhi_id, 'pending', 2500, _surbhi_id, _harsh_id)
  RETURNING id INTO _task_snacks;

  -- THE DEMO TASK: no expense yet — add one live to show off splits!
  INSERT INTO tasks (id, plan_id, title, assigned_to, status, created_by)
  VALUES (gen_random_uuid(), _plan_id, 'Saturday dinner at Thalassa', _gauri_id, 'pending', _harsh_id)
  RETURNING id INTO _task_thalassa;

  -- ============ WHO PAYS WHAT ============
  -- No splits = everyone pays equal. Custom splits = drama.

  -- Train: everyone pays. No debates.
  -- Villa: everyone pays. Also no debates.

  -- Scooters: only the 4 riders pay — Gauri and Suvidha are pillion queens
  INSERT INTO expense_splits (task_id, participant_id, weight) VALUES
    (_task_scooters, _harsh_id, 1.0),
    (_task_scooters, _deep_id, 1.0),
    (_task_scooters, _surbhi_id, 1.0),
    (_task_scooters, _akansha_id, 1.0);

  -- Water sports: everyone except Suvidha (she's "watching the bags" aka napping)
  INSERT INTO expense_splits (task_id, participant_id, weight) VALUES
    (_task_watersports, _harsh_id, 1.0),
    (_task_watersports, _gauri_id, 1.0),
    (_task_watersports, _surbhi_id, 1.0),
    (_task_watersports, _deep_id, 1.0),
    (_task_watersports, _akansha_id, 1.0);

  -- Sunscreen, Dudhsagar, Cruise: everyone pays equal. Fair is fair.

  -- Snacks: Harsh gets 2x weight because that boy EATS
  INSERT INTO expense_splits (task_id, participant_id, weight) VALUES
    (_task_snacks, _harsh_id, 2.0),
    (_task_snacks, _gauri_id, 1.0),
    (_task_snacks, _surbhi_id, 1.0),
    (_task_snacks, _deep_id, 1.0),
    (_task_snacks, _suvidha_id, 1.0),
    (_task_snacks, _akansha_id, 1.0);

  -- ============ THE GROUP CHAT (in-app edition) ============

  -- Train tickets — travel prep drama
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_train, _surbhi_id, 'Window seat nahi mili toh main nahi aa rahi, seedha cancel', now() - INTERVAL '5 days' + INTERVAL '1 hour'),
    (gen_random_uuid(), _task_train, _gauri_id, 'UNO laana zaroor warna 8 ghante kya karenge', now() - INTERVAL '5 days' + INTERVAL '2 hours'),
    (gen_random_uuid(), _task_train, _harsh_id, 'Main apna speaker laa raha hoon, poora dabba party karega', now() - INTERVAL '5 days' + INTERVAL '3 hours');

  -- Villa — everyone has opinions
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_villa, _harsh_id, 'AC hai na? Bina AC ke main function nahi karta', now() - INTERVAL '4 days' + INTERVAL '1 hour'),
    (gen_random_uuid(), _task_villa, _akansha_id, 'Pool nahi toh deal cancel. Non-negotiable.', now() - INTERVAL '4 days' + INTERVAL '2 hours'),
    (gen_random_uuid(), _task_villa, _deep_id, 'Gauri ko bas Instagram worthy backdrop chahiye, pool secondary hai', now() - INTERVAL '4 days' + INTERVAL '3 hours'),
    (gen_random_uuid(), _task_villa, _gauri_id, 'Aur tujhe bas sone ki jagah chahiye na Deep? Chup reh', now() - INTERVAL '4 days' + INTERVAL '4 hours');

  -- Scooters — trust issues
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_scooters, _harsh_id, 'Mujhe Deep ke peeche mat baithana, wo banda signal pe rukta nahi hai', now() - INTERVAL '2 days'),
    (gen_random_uuid(), _task_scooters, _deep_id, 'Signal toh kahan hai Goa mein bhai, sirf cows hain', now() - INTERVAL '2 days' + INTERVAL '15 minutes'),
    (gen_random_uuid(), _task_scooters, _suvidha_id, 'Helmet pehenna sab log, mujhe kisi ko hospital nahi le jaana', now() - INTERVAL '2 days' + INTERVAL '30 minutes');

  -- Water sports — bold claims and screaming
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_watersports, _deep_id, 'Jo last mein koodega uski treat. No excuses.', now() - INTERVAL '1 day'),
    (gen_random_uuid(), _task_watersports, _gauri_id, 'Main chillaungi. Volume max. Abhi se bol rahi hoon.', now() - INTERVAL '1 day' + INTERVAL '10 minutes'),
    (gen_random_uuid(), _task_watersports, _akansha_id, 'Gauri tera screaming hi water sport hai at this point', now() - INTERVAL '1 day' + INTERVAL '20 minutes'),
    (gen_random_uuid(), _task_watersports, _harsh_id, 'Jet ski pe race lagaenge, loser pays for everyone''s chai', now() - INTERVAL '1 day' + INTERVAL '30 minutes');

  -- Sunscreen — mom energy
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_sunscreen, _harsh_id, 'SPF 50 minimum lana, main 10 minute mein tomato ban jaata hoon', now() - INTERVAL '3 days'),
    (gen_random_uuid(), _task_sunscreen, _suvidha_id, 'Already le liya. Tumlog ka kuch nahi ho sakta mere bina.', now() - INTERVAL '3 days' + INTERVAL '1 hour');

  -- Dudhsagar — past trauma
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_dudhsagar, _akansha_id, 'Purane joote pehenna, bohot keechar hota hai wahan', now() - INTERVAL '1 day'),
    (gen_random_uuid(), _task_dudhsagar, _deep_id, 'Waterproof phone cover bhi laana, last time Surbhi ka phone gira tha', now() - INTERVAL '1 day' + INTERVAL '15 minutes'),
    (gen_random_uuid(), _task_dudhsagar, _surbhi_id, 'WOH EK BAAR HUA THA DEEP. EK BAAR.', now() - INTERVAL '1 day' + INTERVAL '25 minutes');

  -- Sunset cruise — content creation priorities
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_cruise, _surbhi_id, 'Golden hour photos nahi liye toh trip count nahi hota', now() - INTERVAL '12 hours'),
    (gen_random_uuid(), _task_cruise, _gauri_id, 'Sab log achhe kapde pehenna, mere photos mein koi bhi bekar nahi dikhna chahiye', now() - INTERVAL '11 hours'),
    (gen_random_uuid(), _task_cruise, _harsh_id, 'Ye personal attack tha kya', now() - INTERVAL '10 hours');

  -- Villa snacks — the essentials debate
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_snacks, _harsh_id, 'Maggi laana. 10 packets minimum. Trust the process.', now() - INTERVAL '6 hours'),
    (gen_random_uuid(), _task_snacks, _deep_id, 'Aur Old Monk toh obviously. Kaun sa flavour?', now() - INTERVAL '5 hours' + INTERVAL '30 minutes'),
    (gen_random_uuid(), _task_snacks, _suvidha_id, 'Flavour?? Old Monk ka ek hi flavour hota hai Deep', now() - INTERVAL '5 hours' + INTERVAL '15 minutes'),
    (gen_random_uuid(), _task_snacks, _gauri_id, 'Healthy snacks bhi laana koi please', now() - INTERVAL '4 hours' + INTERVAL '30 minutes'),
    (gen_random_uuid(), _task_snacks, _harsh_id, 'Gauri Goa mein healthy? Really?', now() - INTERVAL '4 hours');

  -- Thalassa — the one you'll demo live
  INSERT INTO task_comments (id, task_id, author_participant_id, content, created_at) VALUES
    (gen_random_uuid(), _task_thalassa, _akansha_id, 'Reservation CHAHIYE warna weekend pe bahar khade rehna padega', now() - INTERVAL '3 hours'),
    (gen_random_uuid(), _task_thalassa, _gauri_id, 'Unka Greek food insane hai, koi Google karo menu please', now() - INTERVAL '2 hours' + INTERVAL '30 minutes'),
    (gen_random_uuid(), _task_thalassa, _akansha_id, 'Last time 2 ghante wait kiya tha bina reservation ke. Never again.', now() - INTERVAL '2 hours');

  RAISE NOTICE 'Demo plan created! Invite code: GOADEMO';
  RAISE NOTICE 'Plan ID: %', _plan_id;
  RAISE NOTICE 'Join link: https://whodo.space/join/GOADEMO';
END $$;
