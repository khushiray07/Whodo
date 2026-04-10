import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { assignColor } from '../lib/colors';
import type { Participant } from '../types/database';

export function useParticipants(planId: string | undefined) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef<() => Promise<void>>(undefined);

  const fetchParticipants = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('plan_id', planId)
      .order('joined_at', { ascending: true });
    setParticipants(data ?? []);
    setLoading(false);
  }, [planId]);

  fetchRef.current = fetchParticipants;

  useEffect(() => {
    fetchRef.current?.();

    if (!planId) return;

    const uid = Math.random().toString(36).slice(2);
    const channel = supabase
      .channel(`participants-${planId}-${uid}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `plan_id=eq.${planId}`,
      }, () => {
        fetchRef.current?.();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [planId]);

  const addParticipant = useCallback(async (name: string, userId?: string) => {
    if (!planId) return;
    const { error } = await supabase.from('participants').insert({
      plan_id: planId,
      name,
      user_id: userId || null,
      color: assignColor(participants.length),
      joined_via: userId ? 'app_joined' : 'organizer_added',
    });
    if (error) throw error;
  }, [planId, participants.length]);

  const removeParticipant = useCallback(async (participantId: string) => {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId);
    if (error) throw error;
  }, []);

  const getMyParticipant = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return participants.find((p) => p.user_id === user.id) ?? null;
  }, [participants]);

  return { participants, loading, fetchParticipants, addParticipant, removeParticipant, getMyParticipant };
}
