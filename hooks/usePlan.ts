import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Plan } from '../types/database';

export function usePlan(planId: string | undefined) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    const { data } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();
    setPlan(data);
    setLoading(false);
  }, [planId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const updatePlan = useCallback(async (updates: Partial<Plan>) => {
    if (!planId) return;
    const { data, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();
    if (error) throw error;
    setPlan(data);
  }, [planId]);

  return { plan, loading, fetchPlan, updatePlan };
}
