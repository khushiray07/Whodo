'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/providers';
import Link from 'next/link';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!ref.current || animated.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        const duration = 1200;
        const start = performance.now();
        function tick(now: number) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const FEATURES = [
  {
    emoji: '📋',
    title: 'Plans, not chaos',
    desc: 'Birthday party? Goa trip? Flatmate chores? Pick a template, throw in names, done.',
    accent: '#6b1ef3',
  },
  {
    emoji: '✅',
    title: 'Naam pe kaam',
    desc: 'Every task has a face. Claim it, do it, mark it done. No more "main kar lunga" and then silence.',
    accent: '#006a28',
  },
  {
    emoji: '📊',
    title: 'Kharcha sorted',
    desc: 'Log expenses as you go. Whodo figures out who owes whom. One tap WhatsApp reminder.',
    accent: '#e65100',
  },
  {
    emoji: '🔗',
    title: '5 second join',
    desc: 'Share a link. Scan a QR. Your friend is in the plan before they can say "kya scene hai?"',
    accent: '#0066cc',
  },
];

const STEPS = [
  { num: '01', title: 'Bana plan', desc: 'Template chun, gang add kar, tasks auto-fill', emoji: '🎯' },
  { num: '02', title: 'Bhej link', desc: 'WhatsApp pe share. Log browser mein join. Bas.', emoji: '📲' },
  { num: '03', title: 'Ho gaya kaam', desc: 'Tasks done, kharcha tracked, hisaab clear', emoji: '🎉' },
];

const FLOATING_EMOJIS = ['🎂', '✈️', '🎮', '🍕', '🎵', '📋', '🏠', '🎒', '🎭', '⚡'];

export default function LandingPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState<{ plans_count: number; tasks_count: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    supabase.rpc('get_public_stats').then(({ data }) => {
      if (data && data.length > 0) setStats(data[0]);
    });
  }, []);

  return (
    <div className="overflow-x-hidden">
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-18px) rotate(5deg); }
          50% { transform: translateY(-8px) rotate(-3deg); }
          75% { transform: translateY(-22px) rotate(3deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-14px) rotate(-4deg); }
          66% { transform: translateY(-24px) rotate(6deg); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          30% { transform: translate(3%, -15%); }
          50% { transform: translate(12%, 9%); }
          70% { transform: translate(9%, 4%); }
          90% { transform: translate(-1%, 7%); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up-delayed {
          0%, 20% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(107, 30, 243, 0.3), 0 0 60px rgba(107, 30, 243, 0.1); }
          50% { box-shadow: 0 0 30px rgba(107, 30, 243, 0.5), 0 0 80px rgba(107, 30, 243, 0.2); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes badge-bounce {
          0%, 100% { transform: scale(1) rotate(-2deg); }
          50% { transform: scale(1.05) rotate(1deg); }
        }
        .hero-grain::before {
          content: '';
          position: absolute;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
          z-index: 1;
        }
        .feature-card {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-6px) scale(1.02);
        }
        .stagger-1 { animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .stagger-2 { animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
        .stagger-3 { animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
        .stagger-4 { animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
        .stagger-5 { animation: slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }
      `}</style>

      {/* ====================== HERO SECTION ====================== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center hero-grain overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(107, 30, 243, 0.35), transparent), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(107, 30, 243, 0.15), transparent), radial-gradient(ellipse 50% 60% at 20% 80%, rgba(90, 20, 200, 0.1), transparent), #0c0a14',
        }}
      >
        {/* Floating emojis */}
        {mounted && FLOATING_EMOJIS.map((emoji, i) => (
          <span
            key={i}
            className="absolute select-none pointer-events-none"
            style={{
              fontSize: `${20 + Math.random() * 24}px`,
              left: `${5 + (i * 9.5)}%`,
              top: `${15 + Math.sin(i * 1.2) * 30 + 20}%`,
              opacity: 0.15 + Math.random() * 0.15,
              animation: `${i % 2 === 0 ? 'float-slow' : 'float-medium'} ${4 + i * 0.7}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
              zIndex: 0,
            }}
          >
            {emoji}
          </span>
        ))}

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          {/* Logo text */}
          <div className="stagger-1">
            <h1
              className="font-extrabold tracking-tight leading-none"
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: 'clamp(4.5rem, 15vw, 10rem)',
                background: 'linear-gradient(135deg, #ffffff 0%, #d4b8ff 40%, #6b1ef3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 30px rgba(107, 30, 243, 0.4))',
              }}
            >
              Whodo
            </h1>
          </div>

          {/* Tagline */}
          <p className="stagger-2 mt-2 text-lg sm:text-2xl tracking-wide"
            style={{
              fontFamily: 'var(--font-body)',
              color: '#c4b5fd',
              fontWeight: 500,
              fontStyle: 'italic',
            }}
          >
            Jiska naam, uska kaam
          </p>

          {/* Subtitle */}
          <p className="stagger-3 mt-6 text-base sm:text-lg leading-relaxed max-w-md mx-auto"
            style={{ color: 'rgba(255, 255, 255, 0.55)' }}
          >
            One link. Your whole crew. Tasks assigned, kharcha tracked, no one ghosts.
          </p>

          {/* CTA */}
          <div className="stagger-4 mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={session ? '/app' : '/login'}>
              <button
                className="px-10 py-4 rounded-full text-lg font-bold text-white cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #6b1ef3 0%, #9333ea 50%, #6b1ef3 100%)',
                  animation: 'glow-pulse 3s ease-in-out infinite',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {session ? 'Open Whodo →' : 'Start Planning →'}
              </button>
            </Link>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              No download needed
            </span>
          </div>

          {/* Social proof */}
          {stats && (stats.plans_count > 0 || stats.tasks_count > 0) && (
            <div className="stagger-5 mt-14 flex justify-center gap-12">
              <div className="text-center">
                <p className="text-4xl font-extrabold" style={{ color: '#c4b5fd', fontFamily: 'var(--font-headline)' }}>
                  <AnimatedCounter target={stats.plans_count} />
                </p>
                <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Plans Created
                </p>
              </div>
              <div className="w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="text-center">
                <p className="text-4xl font-extrabold" style={{ color: '#c4b5fd', fontFamily: 'var(--font-headline)' }}>
                  <AnimatedCounter target={stats.tasks_count} />
                </p>
                <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Tasks Done
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to bottom, transparent, #f6f6fc)' }}
        />
      </section>

      {/* ====================== FEATURES SECTION ====================== */}
      <section className="relative bg-surface py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Everything you need
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-on-surface"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              Sab ka plan.<br />
              <span className="text-primary">Sab ka kaam.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card rounded-3xl p-7 border cursor-default"
                style={{
                  background: '#ffffff',
                  borderColor: 'rgba(0,0,0,0.05)',
                  boxShadow: `0 2px 20px ${f.accent}08, 0 0 0 0 transparent`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 12px 40px ${f.accent}18, 0 0 0 1px ${f.accent}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 2px 20px ${f.accent}08, 0 0 0 0 transparent`;
                }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="text-3xl w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: `${f.accent}10` }}
                  >
                    {f.emoji}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-on-surface" style={{ fontFamily: 'var(--font-headline)' }}>
                      {f.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm mt-1.5 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== HOW IT WORKS ====================== */}
      <section className="py-24 px-6" style={{ background: '#faf9ff' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Itna simple hai
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-on-surface"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              3 steps. That&apos;s it.
            </h2>
          </div>

          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex gap-6 items-start">
                {/* Line + dot */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #6b1ef3, #9333ea)',
                      fontFamily: 'var(--font-headline)',
                    }}
                  >
                    {step.emoji}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-0.5 h-16" style={{ background: 'linear-gradient(to bottom, #6b1ef3, #e7e8ef)' }} />
                  )}
                </div>
                <div className="pb-12">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                    Step {step.num}
                  </p>
                  <h3 className="text-xl font-bold text-on-surface" style={{ fontFamily: 'var(--font-headline)' }}>
                    {step.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== DOWNLOAD / CTA SECTION ====================== */}
      <section className="relative py-24 px-6 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(107, 30, 243, 0.12), transparent), #f6f6fc',
        }}
      >
        <div className="max-w-lg mx-auto text-center">
          <div
            className="inline-block px-5 py-2 rounded-full text-sm font-semibold mb-8"
            style={{
              background: '#6b1ef3',
              color: '#fff',
              animation: 'badge-bounce 3s ease-in-out infinite',
            }}
          >
            📱 Available now
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-on-surface"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Ready to plan<br />
            <span className="text-primary">something epic?</span>
          </h2>
          <p className="text-on-surface-variant mt-4 max-w-sm mx-auto">
            Browser mein kholo ya APK download karo. Ek link, poori gang ready.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link href={session ? '/app' : '/login'}>
              <button
                className="px-8 py-4 rounded-full text-base font-bold text-white cursor-pointer w-full sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, #6b1ef3, #9333ea)',
                  boxShadow: '0 8px 30px rgba(107, 30, 243, 0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(107, 30, 243, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(107, 30, 243, 0.3)';
                }}
              >
                🌐 Open Web App
              </button>
            </Link>
            <button
              className="px-8 py-4 rounded-full text-base font-bold cursor-pointer w-full sm:w-auto"
              style={{
                background: 'rgba(107, 30, 243, 0.08)',
                color: '#6b1ef3',
                border: '2px solid rgba(107, 30, 243, 0.2)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(107, 30, 243, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(107, 30, 243, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(107, 30, 243, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(107, 30, 243, 0.2)';
              }}
              onClick={() => alert('APK download link will be available after EAS Build!')}
            >
              📦 Download APK
            </button>
          </div>
        </div>
      </section>

      {/* ====================== FOOTER ====================== */}
      <footer className="py-10 px-6 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-primary" style={{ fontFamily: 'var(--font-headline)' }}>
              Whodo
            </span>
            <span className="text-sm text-on-surface-variant">· Jiska naam, uska kaam</span>
          </div>
          <p className="text-sm text-on-surface-variant">
            Built for plans that actually happen ✨
          </p>
        </div>
      </footer>
    </div>
  );
}
