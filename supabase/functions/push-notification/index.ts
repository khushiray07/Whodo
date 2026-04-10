// Supabase Edge Function: push-notification
// Receives task change events and sends Expo push notifications

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

serve(async (req) => {
  try {
    const { plan_id, type, actor_name, task_title } = await req.json();

    if (!plan_id || !type) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Get all participants with push tokens (excluding the actor)
    const { data: participants } = await supabase
      .from('participants')
      .select('user_id')
      .eq('plan_id', plan_id)
      .not('user_id', 'is', null);

    if (!participants?.length) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    const userIds = participants.map((p: any) => p.user_id);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('push_token')
      .in('id', userIds)
      .not('push_token', 'is', null);

    const tokens = (profiles ?? []).map((p: any) => p.push_token).filter(Boolean);

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    // Build notification body
    let body = '';
    if (type === 'task_done') {
      body = `${actor_name} completed "${task_title}"`;
    } else if (type === 'task_claimed') {
      body = `${actor_name} claimed "${task_title}"`;
    }

    if (!body) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    // Send via Expo Push API
    const messages = tokens.map((token: string) => ({
      to: token,
      sound: 'default',
      title: 'Whodo',
      body,
      data: { plan_id, type },
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ sent: tokens.length, result }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
