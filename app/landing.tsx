import React, { useEffect, useState, useRef } from 'react';
import { Platform, View, Text } from 'react-native';
import { useRouter } from 'expo-router';

// Native users never see this page (they go straight to login)
// So we render web-native HTML for the full visual experience

function AnimatedCounter({ target }: { target: number }) {
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

  return <span ref={ref}>{count}</span>;
}

export default function LandingPage() {
  const router = useRouter();

  // Fallback for native (shouldn't reach here, but just in case)
  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <div style={{ overflowX: 'hidden', overflowY: 'auto', height: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

        .landing * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing { font-family: 'Be Vietnam Pro', sans-serif; color: #2d2f33; background: #f6f6fc; }
        .landing h1, .landing h2, .landing h3 { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes float-a { 0%,100%{transform:translateY(0) rotate(0deg)} 25%{transform:translateY(-20px) rotate(5deg)} 75%{transform:translateY(-16px) rotate(-3deg)} }
        @keyframes float-b { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-14px) rotate(-4deg)} 66%{transform:translateY(-24px) rotate(6deg)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(107,30,243,0.3),0 0 60px rgba(107,30,243,0.1)} 50%{box-shadow:0 0 30px rgba(107,30,243,0.5),0 0 80px rgba(107,30,243,0.2)} }
        @keyframes slide-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes badge-bob { 0%,100%{transform:scale(1) rotate(-2deg)} 50%{transform:scale(1.05) rotate(1deg)} }

        .hero-grain { position: relative; }
        .hero-grain::after {
          content:''; position:absolute; inset:0; pointer-events:none; z-index:1;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity:0.5;
        }

        .stg-1{animation:slide-up .7s cubic-bezier(.16,1,.3,1) forwards}
        .stg-2{animation:slide-up .7s cubic-bezier(.16,1,.3,1) .1s forwards;opacity:0}
        .stg-3{animation:slide-up .7s cubic-bezier(.16,1,.3,1) .2s forwards;opacity:0}
        .stg-4{animation:slide-up .7s cubic-bezier(.16,1,.3,1) .3s forwards;opacity:0}
        .stg-5{animation:slide-up .7s cubic-bezier(.16,1,.3,1) .45s forwards;opacity:0}

        .fcard { transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease; }
        .fcard:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 16px 40px rgba(107,30,243,0.12); }

        .cta-btn { transition: transform .2s, box-shadow .2s; cursor: pointer; border: none; }
        .cta-btn:hover { transform: scale(1.05); box-shadow: 0 12px 40px rgba(107,30,243,0.45); }

        .float-emoji { position:absolute; pointer-events:none; user-select:none; z-index:0; }
      `}} />

      <div className="landing">
        {/* ========== HERO ========== */}
        <section
          className="hero-grain"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(107,30,243,0.35), transparent), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(107,30,243,0.15), transparent), radial-gradient(ellipse 50% 60% at 20% 80%, rgba(90,20,200,0.1), transparent), #0c0a14',
          }}
        >
          {/* Floating emojis */}
          {['🎂','✈️','🎮','🍕','🎵','📋','🏠','🎒','🎭','⚡'].map((e, i) => (
            <span
              key={i}
              className="float-emoji"
              style={{
                fontSize: `${20 + Math.random() * 24}px`,
                left: `${5 + i * 9.5}%`,
                top: `${15 + Math.sin(i * 1.2) * 30 + 20}%`,
                opacity: 0.12 + Math.random() * 0.12,
                animation: `${i % 2 === 0 ? 'float-a' : 'float-b'} ${4 + i * 0.7}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            >{e}</span>
          ))}

          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 640 }}>
            <h1
              className="stg-1"
              style={{
                fontSize: 'clamp(4.5rem, 15vw, 10rem)',
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #fff 0%, #d4b8ff 40%, #6b1ef3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 30px rgba(107,30,243,0.4))',
              }}
            >Whodo</h1>

            <p className="stg-2" style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
              color: '#c4b5fd',
              fontWeight: 500,
              fontStyle: 'italic',
              marginTop: 8,
            }}>Jiska naam, uska kaam</p>

            <p className="stg-3" style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
              color: 'rgba(255,255,255,0.5)',
              marginTop: 24,
              lineHeight: 1.7,
            }}>
              One link. Your whole crew.<br/>
              Tasks assigned, kharcha tracked, no one ghosts.
            </p>

            <div className="stg-4" style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <button
                className="cta-btn"
                onClick={() => router.push('/(auth)/login')}
                style={{
                  background: 'linear-gradient(135deg, #6b1ef3 0%, #9333ea 50%, #6b1ef3 100%)',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  padding: '16px 44px',
                  borderRadius: 999,
                  animation: 'glow 3s ease-in-out infinite',
                }}
              >Start Planning →</button>
              <a
                href="https://expo.dev/artifacts/eas/dZwCwGX8dcbsTKhVzH2sA1.apk"
                className="cta-btn"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#c4b5fd',
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  padding: '12px 32px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.15)',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >📱 Download Android APK</a>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 }}>Works in browser too — no download needed</p>
            </div>
          </div>

          {/* Bottom fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
            background: 'linear-gradient(to bottom, transparent, #f6f6fc)',
          }} />
        </section>

        {/* ========== FEATURES ========== */}
        <section style={{ padding: '96px 24px', maxWidth: 960, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: 3, color: '#6b1ef3', textTransform: 'uppercase', marginBottom: 12 }}>
            Everything you need
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 48 }}>
            Sab ka plan.<br/><span style={{ color: '#6b1ef3' }}>Sab ka kaam.</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { emoji: '📋', title: 'Plans, not chaos', desc: 'Birthday? Trip? Chores? Pick a template, add your crew, done.', accent: '#6b1ef3' },
              { emoji: '✅', title: 'Naam pe kaam', desc: 'Every task has a face. No more "main kar lunga" and then silence.', accent: '#006a28' },
              { emoji: '📊', title: 'Kharcha sorted', desc: 'Log expenses as you go. Whodo figures out who owes whom.', accent: '#e65100' },
              { emoji: '🔗', title: '5 second join', desc: 'Share a link. Your friend is in before they can say "kya scene hai?"', accent: '#0066cc' },
            ].map((f) => (
              <div key={f.title} className="fcard" style={{
                background: '#fff',
                borderRadius: 24,
                padding: 28,
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: `0 2px 20px ${f.accent}08`,
              }}>
                <span style={{ fontSize: 32, display: 'block', marginBottom: 16, width: 56, height: 56, borderRadius: 16, background: `${f.accent}10`, lineHeight: '56px', textAlign: 'center' }}>{f.emoji}</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#5a5b60', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========== HOW IT WORKS ========== */}
        <section style={{ padding: '96px 24px', background: '#faf9ff' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: 3, color: '#6b1ef3', textTransform: 'uppercase', marginBottom: 12 }}>
              Itna simple hai
            </p>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, marginBottom: 48 }}>
              3 steps. That's it.
            </h2>

            {[
              { emoji: '🎯', title: 'Bana plan', desc: 'Template chun, gang add kar, tasks auto-fill' },
              { emoji: '📲', title: 'Bhej link', desc: 'WhatsApp pe share. Log browser mein join. Bas.' },
              { emoji: '🎉', title: 'Ho gaya kaam', desc: 'Tasks done, kharcha tracked, hisaab clear' },
            ].map((step, i) => (
              <div key={step.title} style={{ display: 'flex', gap: 20, marginBottom: i < 2 ? 0 : 0, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 24,
                    background: 'linear-gradient(135deg, #6b1ef3, #9333ea)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>{step.emoji}</div>
                  {i < 2 && <div style={{ width: 2, height: 48, background: 'linear-gradient(to bottom, #6b1ef3, #e7e8ef)' }} />}
                </div>
                <div style={{ paddingBottom: 32 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#6b1ef3', textTransform: 'uppercase', marginBottom: 4 }}>
                    Step 0{i + 1}
                  </p>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: '#5a5b60' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========== FINAL CTA ========== */}
        <section style={{
          padding: '96px 24px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(107,30,243,0.1), transparent), #f6f6fc',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 20px',
            borderRadius: 999,
            background: '#6b1ef3',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 32,
            animation: 'badge-bob 3s ease-in-out infinite',
          }}>📱 Available now</div>

          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.2 }}>
            Ready to plan<br/><span style={{ color: '#6b1ef3' }}>something epic?</span>
          </h2>
          <p style={{ color: '#5a5b60', marginTop: 16, fontSize: 16 }}>
            Ek link, poori gang ready.
          </p>

          <div style={{ marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', flexDirection: 'column', alignItems: 'center' }}>
            <button
              className="cta-btn"
              onClick={() => router.push('/(auth)/login')}
              style={{
                background: 'linear-gradient(135deg, #6b1ef3, #9333ea)',
                color: '#fff', fontSize: 16, fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                padding: '16px 36px', borderRadius: 999,
                boxShadow: '0 8px 30px rgba(107,30,243,0.3)',
              }}
            >🌐 Open Web App</button>
            <a
              href="https://expo.dev/artifacts/eas/dZwCwGX8dcbsTKhVzH2sA1.apk"
              className="cta-btn"
              style={{
                color: '#5a5b60', fontSize: 14, fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                padding: '10px 28px', borderRadius: 999,
                border: '1px solid rgba(0,0,0,0.1)',
                textDecoration: 'none', display: 'inline-block',
                background: '#fff',
              }}
            >📱 Download Android APK</a>
          </div>
        </section>

        {/* ========== FOOTER ========== */}
        <footer style={{
          padding: '40px 24px',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          maxWidth: 960,
          margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#6b1ef3', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Whodo</span>
            <span style={{ fontSize: 14, color: '#5a5b60' }}>· Jiska naam, uska kaam</span>
          </div>
          <p style={{ fontSize: 14, color: '#5a5b60' }}>Built for plans that actually happen ✨</p>
        </footer>
      </div>
    </div>
  );
}
