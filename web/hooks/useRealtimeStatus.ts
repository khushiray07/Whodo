'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const uid = Math.random().toString(36).slice(2);
    const channel = supabase
      .channel(`realtime-status-${uid}`)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { isConnected };
}
