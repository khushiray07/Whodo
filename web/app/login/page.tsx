'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { strings } from '@/constants/strings';

type Mode = 'email-login' | 'email-signup';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-primary text-xl font-bold">Whodo</div></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/app';
  const { session } = useAuth();

  const [mode, setMode] = useState<Mode>('email-login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) router.replace(redirect);
  }, [session, redirect, router]);

  async function handleEmailAuth() {
    setLoading(true);
    setError('');

    if (mode === 'email-signup') {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) setError(err.message);
      else setError('Check your email for confirmation link.');
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else router.replace(redirect);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-primary">{strings.loginTitle}</h1>
          <p className="text-on-surface-variant mt-2">{strings.loginSubtitle}</p>
        </div>

        {error && (
          <div className={`px-4 py-3 rounded-2xl text-sm ${
            error.includes('Check your email')
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label={strings.emailLabel}
            placeholder={strings.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoFocus
          />
          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
          />
          <Button
            onClick={handleEmailAuth}
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full"
          >
            {loading ? 'Loading...' : mode === 'email-signup' ? 'Sign Up' : 'Sign In'}
          </Button>
          <button
            onClick={() => setMode(mode === 'email-login' ? 'email-signup' : 'email-login')}
            className="w-full text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            {mode === 'email-login' ? 'Don\'t have an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
