'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function LandingPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState<{ plans_count: number; tasks_count: number } | null>(null);

  useEffect(() => {
    supabase.rpc('get_public_stats').then(({ data }) => {
      if (data && data.length > 0) setStats(data[0]);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-5xl font-extrabold text-primary">Whodo</h1>
          <p className="text-xl text-on-surface-variant">Jiska naam, uska kaam</p>
          <p className="text-on-surface-variant">
            Group planning and expense splitting. Create a plan, share a link, get things done together.
          </p>

          {/* Social proof counter */}
          {stats && (stats.plans_count > 0 || stats.tasks_count > 0) && (
            <div className="flex justify-center gap-8 py-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.plans_count}</p>
                <p className="text-xs text-on-surface-variant">Plans Created</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.tasks_count}</p>
                <p className="text-xs text-on-surface-variant">Tasks Done</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link href={session ? '/app' : '/login'}>
              <Button className="w-full text-lg py-4">
                {session ? 'Go to Plans' : 'Start Planning'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-on-surface-variant">
        <p>Made with ❤️ for group plans that actually happen.</p>
      </footer>
    </div>
  );
}
