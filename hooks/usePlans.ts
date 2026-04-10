import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { generateInviteCode } from '../lib/invite';
import { assignColor } from '../lib/colors';
import { getTemplate } from '../lib/templates';
import type { Plan, PlanTemplate } from '../types/database';

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef<() => Promise<void>>(undefined);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false });
    setPlans(data ?? []);
    setLoading(false);
  }, []);

  fetchRef.current = fetchPlans;

  useEffect(() => {
    fetchRef.current?.();

    const id = Math.random().toString(36).slice(2);
    const channel = supabase
      .channel(`plans-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, () => {
        fetchRef.current?.();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const createPlan = useCallback(async (
    title: string,
    template: PlanTemplate,
    eventDate: string | null,
    participantNames: string[],
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const inviteCode = generateInviteCode();

    const { data: plan, error } = await supabase
      .from('plans')
      .insert({
        title,
        template,
        event_date: eventDate,
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select()
      .single();
    if (error) throw error;

    // Add organizer as first participant
    const { data: organizer } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    const { data: orgParticipant } = await supabase.from('participants').insert({
      plan_id: plan.id,
      name: organizer?.display_name ?? 'Organizer',
      user_id: user.id,
      color: assignColor(0),
      joined_via: 'organizer_added',
    }).select().single();

    // Log plan creation activity
    if (orgParticipant) {
      await supabase.from('activity_log').insert({
        plan_id: plan.id,
        actor_participant_id: orgParticipant.id,
        action: 'plan_created',
        target_type: 'plan',
        target_id: plan.id,
        metadata: { title: plan.title },
      });
    }

    // Add name-only participants
    for (let i = 0; i < participantNames.length; i++) {
      await supabase.from('participants').insert({
        plan_id: plan.id,
        name: participantNames[i],
        color: assignColor(i + 1),
        joined_via: 'organizer_added',
      });
    }

    // Insert seed tasks from template
    if (orgParticipant) {
      const templateConfig = getTemplate(template);
      if (templateConfig.seedTasks.length > 0) {
        const seedRows = templateConfig.seedTasks.map((title) => ({
          plan_id: plan.id,
          title,
          created_by: orgParticipant.id,
        }));
        await supabase.from('tasks').insert(seedRows);
      }
    }

    await fetchRef.current?.();
    return plan;
  }, []);

  const deletePlan = useCallback(async (planId: string) => {
    // Delete in order: activity_log, tasks, participants, notifications, then plan
    await supabase.from('activity_log').delete().eq('plan_id', planId);
    await supabase.from('tasks').delete().eq('plan_id', planId);
    await supabase.from('participants').delete().eq('plan_id', planId);
    await supabase.from('notifications').delete().eq('plan_id', planId);
    const { error } = await supabase.from('plans').delete().eq('id', planId);
    if (error) throw error;
    await fetchRef.current?.();
  }, []);

  return { plans, loading, fetchPlans, createPlan, deletePlan };
}
