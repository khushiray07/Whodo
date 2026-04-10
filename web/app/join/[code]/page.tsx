'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/providers';
import { assignColor } from '@/lib/colors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { strings } from '@/constants/strings';
import { format } from '@/lib/date';

type PlanPreview = { title: string; participant_count: number; event_date: string | null };

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { session } = useAuth();

  const [preview, setPreview] = useState<PlanPreview | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  // Lookup plan by invite code (public RPC)
  useEffect(() => {
    async function lookup() {
      const { data, error } = await supabase.rpc('lookup_plan_by_invite', { code });
      if (error || !data || data.length === 0) {
        setNotFound(true);
      } else {
        setPreview(data[0] as PlanPreview);
      }
      setPageLoading(false);
    }
    lookup();
  }, [code]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!pageLoading && !session && preview) {
      router.replace(`/login?redirect=/join/${code}`);
    }
  }, [pageLoading, session, preview, code, router]);

  async function handleJoin() {
    if (!name.trim() || !session) return;
    setLoading(true);
    setError('');

    try {
      // Find the plan by invite code
      const { data: plan } = await supabase
        .from('plans')
        .select('id')
        .eq('invite_code', code)
        .eq('status', 'active')
        .single();

      if (!plan) {
        setError(strings.invalidCode);
        setLoading(false);
        return;
      }

      // Check if already a participant
      const { data: existing } = await supabase
        .from('participants')
        .select('id')
        .eq('plan_id', plan.id)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existing) {
        router.replace(`/app/plans/${plan.id}`);
        return;
      }

      // Get current participant count for color assignment
      const { count } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', plan.id);

      await supabase.from('participants').insert({
        plan_id: plan.id,
        name: name.trim(),
        user_id: session.user.id,
        color: assignColor(count ?? 0),
        joined_via: 'app_joined',
      });

      router.replace(`/app/plans/${plan.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : strings.genericError);
    }
    setLoading(false);
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl font-bold">Loading...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">Plan not found</p>
          <p className="text-on-surface-variant">{strings.invalidCode}</p>
          <Button onClick={() => router.push('/app')}>Go to plans</Button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-primary">{strings.joinTitle}</h1>
          <p className="text-on-surface-variant mt-2">{strings.joinSubtitle}</p>
        </div>

        {/* Plan preview */}
        {preview && (
          <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 text-center space-y-1">
            <p className="text-lg font-semibold">{preview.title}</p>
            <p className="text-sm text-on-surface-variant">
              {preview.participant_count} people joined
              {preview.event_date && ` · ${format(preview.event_date)}`}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
        )}

        <Input
          label={strings.yourName}
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          autoFocus
        />

        <Button onClick={handleJoin} disabled={loading || !name.trim()} className="w-full">
          {loading ? 'Joining...' : strings.joinButton}
        </Button>
      </div>
    </div>
  );
}
