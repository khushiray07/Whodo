'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useRealtimeStatus } from '@/hooks/useRealtimeStatus';
import Link from 'next/link';

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const { session, profile, loading, signOut } = useAuth();
  const { isConnected } = useRealtimeStatus();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [loading, session, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl font-bold">Whodo</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-surface">
      {!isConnected && (
        <div className="reconnecting-banner">Reconnecting...</div>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-sm border-b border-outline-variant/30">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/app" className="text-xl font-extrabold text-primary">
            Whodo
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-on-surface-variant">{profile?.display_name}</span>
            <button
              onClick={async () => { await signOut(); router.replace('/login'); }}
              className="text-xs text-on-surface-variant hover:text-error transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
