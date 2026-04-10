import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';
import type { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) fetchProfile(s.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) fetchProfile(s.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
    } else {
      // Auto-create profile on first login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const displayName = (user.email ?? '').split('@')[0] || 'User';
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            display_name: displayName,
            phone: user.email,
          })
          .select()
          .single();
        setProfile(newProfile);
      }
    }
    setLoading(false);
  };

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const createProfile = useCallback(async (displayName: string) => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        display_name: displayName,
        phone: session.user.email,
      })
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
  }, [session]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
  }, [session]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  return {
    session,
    profile,
    loading,
    isAuthenticated: !!session,
    needsProfile: !!session && !profile,
    signUp,
    signIn,
    createProfile,
    updateProfile,
    logout,
  };
}
