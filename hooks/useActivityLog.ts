import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { ActivityLogEntry } from '../types/database';

export function useActivityLog(planId?: string) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef<() => Promise<void>>(undefined);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (planId) {
      query = query.eq('plan_id', planId);
    }

    const { data, error } = await query;
    // Silently handle fetch errors
    setActivities(data ?? []);
    setLoading(false);
  }, [planId]);

  fetchRef.current = fetchActivities;

  useEffect(() => {
    fetchRef.current?.();

    const id = Math.random().toString(36).slice(2);
    const channel = supabase
      .channel(`activity-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_log',
      }, () => {
        fetchRef.current?.();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [planId]);

  return { activities, loading, fetchActivities };
}
