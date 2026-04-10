'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { strings } from '@/constants/strings';

type Mode = 'phone' | 'otp' | 'email-login' | 'email-signup';

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

  const [mode, setMode] = useState<Mode>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (session) router.replace(redirect);
  }, [session, redirect, router]);

  // OTP cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const formatPhone = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length > 2) return '+' + digits;
    if (digits.length === 10) return '+91' + digits;
    return value.startsWith('+') ? value : '+91' + digits;
  }, []);

  async function handleSendOtp() {
    if (cooldown > 0) return;
    setLoading(true);
    setError('');

    const formatted = formatPhone(phone);
    const { error: err } = await supabase.auth.signInWithOtp({ phone: formatted });

    if (err) {
      if (err.status === 429) {
        setCooldown(60);
        setError('Too many attempts. Try again in 60 seconds.');
      } else {
        setError(err.message);
      }
    } else {
      setMode('otp');
      setCooldown(30);
    }
    setLoading(false);
  }

  async function handleVerifyOtp() {
    setLoading(true);
    setError('');

    const formatted = formatPhone(phone);
    const { error: err } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: 'sms',
    });

    if (err) {
      setError(strings.wrongOtp);
    } else {
      router.replace(redirect);
    }
    setLoading(false);
  }

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
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-primary">{strings.loginTitle}</h1>
          <p className="text-on-surface-variant mt-2">{strings.loginSubtitle}</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* Phone OTP mode */}
        {mode === 'phone' && (
          <div className="space-y-4">
            <Input
              label={strings.phoneLabel}
              placeholder={strings.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            />
            <Button
              onClick={handleSendOtp}
              disabled={loading || !phone.trim() || cooldown > 0}
              className="w-full"
            >
              {cooldown > 0 ? `Retry in ${cooldown}s` : loading ? 'Sending...' : strings.sendOtp}
            </Button>
            <button
              onClick={() => setMode('email-login')}
              className="w-full text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Use email instead
            </button>
          </div>
        )}

        {/* OTP verify mode */}
        {mode === 'otp' && (
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant text-center">
              Code sent to {formatPhone(phone)}
            </p>
            <Input
              label={strings.verifyTitle}
              placeholder={strings.otpPlaceholder}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
            />
            <Button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full"
            >
              {loading ? 'Verifying...' : strings.verifyButton}
            </Button>
            <button
              onClick={() => { setMode('phone'); setOtp(''); }}
              className="w-full text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>
        )}

        {/* Email auth mode */}
        {(mode === 'email-login' || mode === 'email-signup') && (
          <div className="space-y-4">
            <Input
              label={strings.emailLabel}
              placeholder={strings.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
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
            <div className="flex justify-between text-sm">
              <button
                onClick={() => setMode(mode === 'email-login' ? 'email-signup' : 'email-login')}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                {mode === 'email-login' ? 'Create account' : 'Already have account?'}
              </button>
              <button
                onClick={() => setMode('phone')}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                Use phone
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
