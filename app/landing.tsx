import React, { useEffect, useState, useRef } from 'react';
import { Platform, View, Text } from 'react-native';
import { useRouter } from 'expo-router';

/* ── Scroll-triggered reveal ─────────────────────────────────── */
function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (!('IntersectionObserver' in window)) { setVis(true); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity .8s cubic-bezier(.16,1,.3,1) ${delay}s, transform .8s cubic-bezier(.16,1,.3,1) ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

  .landing *{box-sizing:border-box;margin:0;padding:0}
  .landing{font-family:'Be Vietnam Pro',sans-serif;color:#1a1625;background:#faf8ff;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
  .landing h1,.landing h2,.landing h3{font-family:'Outfit',sans-serif}

  @keyframes slide-up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes phone-float{0%,100%{transform:translateY(0) rotate(3deg)}50%{transform:translateY(-14px) rotate(3deg)}}
  @keyframes ticker-scroll{0%{transform:translateX(0)}100%{transform:translateX(-33.333%)}}
  @keyframes bounce-hint{0%,100%{transform:translateY(0);opacity:.35}50%{transform:translateY(6px);opacity:.7}}
  @keyframes notif-enter{from{opacity:0;transform:rotate(3deg) translateY(-12px) scale(.9)}to{opacity:1;transform:rotate(3deg) translateY(0) scale(1)}}

  .stg-1{animation:slide-up .8s cubic-bezier(.16,1,.3,1) .1s both}
  .stg-2{animation:slide-up .8s cubic-bezier(.16,1,.3,1) .2s both}
  .stg-3{animation:slide-up .8s cubic-bezier(.16,1,.3,1) .3s both}
  .stg-4{animation:slide-up .8s cubic-bezier(.16,1,.3,1) .4s both}
  .stg-5{animation:slide-up .8s cubic-bezier(.16,1,.3,1) .55s both}
  .stg-6{animation:slide-up .8s cubic-bezier(.16,1,.3,1) .7s both}

  .lnav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:rgba(10,6,18,0.7);border-bottom:1px solid rgba(255,255,255,0.06);transition:background .3s}

  .cta-main{cursor:pointer;border:none;text-decoration:none;display:inline-flex;align-items:center;gap:8px;font-family:'Outfit',sans-serif;transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease}
  .cta-main:hover{transform:scale(1.06) translateY(-2px);box-shadow:0 20px 50px rgba(107,30,243,0.5)!important}
  .cta-main:focus-visible{outline:2px solid #f59e0b;outline-offset:3px}

  .cta-ghost{cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;font-family:'Outfit',sans-serif;transition:transform .2s,background .3s,border-color .3s}
  .cta-ghost:hover{transform:translateY(-2px);background:rgba(255,255,255,0.1)!important;border-color:rgba(255,255,255,0.25)!important}
  .cta-ghost:focus-visible{outline:2px solid #f59e0b;outline-offset:3px}

  .feat-card{transition:transform .4s cubic-bezier(.34,1.56,.64,1),box-shadow .4s ease}
  .feat-card:hover{transform:translateY(-8px) scale(1.015);box-shadow:0 20px 48px rgba(107,30,243,0.1)!important}

  .phone-mock{animation:phone-float 6s ease-in-out infinite;will-change:transform}

  .hero-grain::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:1;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");opacity:.45}

  .dot-bg{background-image:radial-gradient(rgba(107,30,243,0.05) 1px,transparent 1px);background-size:24px 24px}

  .ticker-track{display:inline-flex;animation:ticker-scroll 45s linear infinite;will-change:transform}
  .ticker-track:hover{animation-play-state:paused}

  .notif-float{animation:notif-enter .6s cubic-bezier(.16,1,.3,1) .8s both}

  @media(max-width:900px){
    .hero-grid{flex-direction:column!important;text-align:center!important;align-items:center!important}
    .hero-text{align-items:center!important}
    .hero-ctas{justify-content:center!important}
    .phone-wrap{display:none!important}
    .bento{grid-template-columns:1fr!important}
    .bento>*{grid-column:span 1!important}
    .steps-row{flex-direction:column!important;gap:32px!important;align-items:center!important}
    .step-connector{display:none!important}
    .lnav{padding:12px 20px}
    .social-proof{justify-content:center!important}
  }
`;

/* ── Landing Page ────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();

  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const ticker = '\u00A0\u00A0🎂 Birthday Party\u00A0\u00A0·\u00A0\u00A0✈️ Group Trip\u00A0\u00A0·\u00A0\u00A0🍕 Dinner Plans\u00A0\u00A0·\u00A0\u00A0🎮 Game Night\u00A0\u00A0·\u00A0\u00A0🏠 Flatmate Chores\u00A0\u00A0·\u00A0\u00A0🎒 Hackathon Team\u00A0\u00A0·\u00A0\u00A0🎭 Event Planning\u00A0\u00A0·\u00A0\u00A0⚡ Sprint Retro\u00A0\u00A0·\u00A0\u00A0🎵 Concert Crew\u00A0\u00A0·\u00A0\u00A0🏕️ Camping Trip\u00A0\u00A0·\u00A0\u00A0🎓 Study Group\u00A0\u00A0·\u00A0\u00A0🏋️ Gym Buddies\u00A0\u00A0·\u00A0\u00A0🎪 Festival Crew\u00A0\u00A0·\u00A0\u00A0🏖️ Beach Day\u00A0\u00A0·\u00A0\u00A0';

  const features = [
    { emoji: '📋', title: 'Plans, not chaos', desc: 'Birthday? Trip? Chores? Pick a template, add your crew, done.', color: '#6b1ef3' },
    { emoji: '✅', title: 'Naam pe kaam', desc: 'Every task has a face. No more "main kar lunga" and then silence.', color: '#10b981' },
    { emoji: '🔗', title: '5 second join', desc: 'Share a link. Friends join before they can say "kya scene hai?"', color: '#3b82f6' },
    { emoji: '📊', title: 'Kharcha sorted', desc: 'Log expenses as you go. Whodo figures out who owes whom — automatically.', color: '#f97316' },
  ];

  const steps = [
    { emoji: '🎯', title: 'Bana plan', desc: 'Template chun, gang add kar, tasks auto-fill' },
    { emoji: '📲', title: 'Bhej link', desc: 'WhatsApp pe share. Log browser mein join. Bas.' },
    { emoji: '🎉', title: 'Ho gaya kaam', desc: 'Tasks done, kharcha tracked, hisaab clear' },
  ];

  const plans = [
    { emoji: '🎂', name: "Rahul's Birthday", done: 5, total: 7, color: '#6b1ef3' },
    { emoji: '✈️', name: 'Goa Trip 2024', done: 3, total: 8, color: '#10b981' },
    { emoji: '🍕', name: 'Friday Dinner', done: 1, total: 4, color: '#f97316' },
  ];

  return (
    <div style={{ overflowX: 'hidden', overflowY: 'auto', height: '100vh', scrollBehavior: 'smooth' }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="landing">

        {/* ═══════════════════ NAV ═══════════════════ */}
        <nav className="lnav">
          <div className="stg-1" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #6b1ef3, #9333ea)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900, color: '#fff',
              fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em',
            }}>W</div>
            <span style={{
              fontSize: 17, fontWeight: 700, color: '#fff',
              fontFamily: "'Outfit', sans-serif",
            }}>Whodo</span>
          </div>
          <button
            className="cta-main stg-1"
            onClick={() => router.push('/(auth)/login')}
            style={{
              background: '#6b1ef3', color: '#fff',
              fontSize: 13, fontWeight: 600,
              padding: '10px 24px', borderRadius: 999,
            }}
          >Start Planning</button>
        </nav>

        {/* ═══════════════════ HERO ═══════════════════ */}
        <section className="hero-grain" style={{
          minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          background: `
            radial-gradient(ellipse 70% 50% at 20% 0%, rgba(107,30,243,0.22), transparent),
            radial-gradient(ellipse 50% 40% at 85% 20%, rgba(147,51,234,0.12), transparent),
            radial-gradient(ellipse 40% 50% at 10% 80%, rgba(90,20,200,0.08), transparent),
            radial-gradient(ellipse 25% 30% at 90% 90%, rgba(245,158,11,0.04), transparent),
            #0a0612
          `,
          padding: '120px 48px 96px',
        }}>
          <div className="hero-grid" style={{
            display: 'flex', alignItems: 'center', gap: 80,
            maxWidth: 1100, width: '100%', position: 'relative', zIndex: 10,
          }}>

            {/* ── Text column ── */}
            <div className="hero-text" style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            }}>
              <div className="stg-1" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 999,
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.2)',
              }}>
                <span style={{ fontSize: 12 }}>✨</span>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: '#f59e0b',
                  fontFamily: "'Outfit', sans-serif", letterSpacing: '0.02em',
                }}>Group planning, sorted</span>
              </div>

              <h1 className="stg-2" style={{
                fontSize: 'clamp(3.5rem, 8vw, 6rem)',
                fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.04em',
                color: '#f5f0ff', marginTop: 28,
              }}>Whodo</h1>

              <p className="stg-3" style={{
                fontSize: 'clamp(1.05rem, 2.5vw, 1.35rem)',
                fontWeight: 500, fontStyle: 'italic', color: '#f59e0b',
                marginTop: 12, letterSpacing: '0.01em',
              }}>Jiska naam, uska kaam</p>

              <p className="stg-4" style={{
                fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)',
                color: 'rgba(255,255,255,0.4)',
                marginTop: 28, lineHeight: 1.8, maxWidth: 380,
              }}>
                One link. Your whole crew.<br />
                Tasks assigned, kharcha tracked, no one ghosts.
              </p>

              <div className="stg-5 hero-ctas" style={{
                marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap',
              }}>
                <button
                  className="cta-main"
                  onClick={() => router.push('/(auth)/login')}
                  style={{
                    background: 'linear-gradient(135deg, #6b1ef3, #9333ea)',
                    color: '#fff', fontSize: 16, fontWeight: 700,
                    padding: '16px 36px', borderRadius: 999,
                    boxShadow: '0 8px 32px rgba(107,30,243,0.4)',
                  }}
                >Start Planning <span style={{ fontSize: 18 }}>→</span></button>
                <a
                  href="https://expo.dev/accounts/raykhushi/projects/whodo/builds/a8a89949-93ad-4450-a4fd-3fbe6706ff5e"
                  className="cta-ghost"
                  style={{
                    color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600,
                    padding: '16px 28px', borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >📱 Android APK</a>
              </div>

              {/* Social proof */}
              <div className="stg-6 social-proof" style={{
                display: 'flex', alignItems: 'center', gap: 14, marginTop: 32,
              }}>
                <div style={{ display: 'flex' }}>
                  {['#6b1ef3', '#10b981', '#f59e0b', '#3b82f6'].map((c, i) => (
                    <div key={i} style={{
                      width: 26, height: 26, borderRadius: 13,
                      background: c, border: '2px solid #0a0612',
                      marginLeft: i > 0 ? -8 : 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: '#fff',
                      fontFamily: "'Outfit', sans-serif",
                    }}>{['R', 'A', 'P', 'S'][i]}</div>
                  ))}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                  Free · Works in browser · No download needed
                </span>
              </div>
            </div>

            {/* ── Phone mockup ── */}
            <div className="phone-wrap" style={{ flexShrink: 0, position: 'relative' }}>
              {/* Floating notification */}
              <div className="notif-float" style={{
                position: 'absolute', top: -12, right: -48, zIndex: 3,
                background: '#fff', borderRadius: 16, padding: '10px 14px',
                boxShadow: '0 8px 28px rgba(0,0,0,0.15)',
                display: 'flex', alignItems: 'center', gap: 8,
                transform: 'rotate(3deg)',
              }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#1a1625', fontFamily: "'Outfit', sans-serif" }}>Task completed!</p>
                  <p style={{ fontSize: 10, color: '#6b6580' }}>Cake ordered by Priya</p>
                </div>
              </div>

              <div className="phone-mock stg-4" style={{
                width: 270, height: 540, borderRadius: 40, overflow: 'hidden',
                background: '#1a1625',
                border: '3px solid rgba(255,255,255,0.08)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)',
                position: 'relative',
              }}>
                {/* Dynamic Island */}
                <div style={{
                  width: 96, height: 26, borderRadius: 16,
                  background: '#000', margin: '10px auto 0',
                }} />

                {/* Screen content */}
                <div style={{ padding: '18px 16px 0' }}>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>Good morning</p>
                  <p style={{
                    color: '#fff', fontSize: 17, fontWeight: 700,
                    fontFamily: "'Outfit', sans-serif", marginTop: 2,
                  }}>Hey! 👋</p>

                  <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {plans.map((plan) => (
                      <div key={plan.name} style={{
                        background: `linear-gradient(135deg, ${plan.color}18, ${plan.color}08)`,
                        borderRadius: 14, padding: 12,
                        border: `1px solid ${plan.color}18`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{plan.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{
                              color: '#fff', fontSize: 12, fontWeight: 600,
                              fontFamily: "'Outfit', sans-serif",
                            }}>{plan.name}</p>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 1 }}>
                              {plan.done} of {plan.total} done
                            </p>
                          </div>
                        </div>
                        <div style={{
                          marginTop: 8, height: 3, borderRadius: 2,
                          background: 'rgba(255,255,255,0.08)',
                        }}>
                          <div style={{
                            width: `${(plan.done / plan.total) * 100}%`, height: '100%',
                            borderRadius: 2,
                            background: `linear-gradient(90deg, ${plan.color}, ${plan.color}aa)`,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAB */}
                <div style={{
                  position: 'absolute', bottom: 56, right: 16,
                  width: 40, height: 40, borderRadius: 20,
                  background: 'linear-gradient(135deg, #6b1ef3, #9333ea)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(107,30,243,0.4)',
                }}>
                  <span style={{ color: '#fff', fontSize: 22, fontWeight: 300, lineHeight: 1 }}>+</span>
                </div>

                {/* Tab bar */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '10px 20px 24px',
                  background: 'linear-gradient(to top, #1a1625 60%, transparent)',
                  display: 'flex', justifyContent: 'space-around',
                }}>
                  {['📋', '🔔', '⚡', '👤'].map((icon, i) => (
                    <span key={i} style={{ fontSize: 16, opacity: i === 0 ? 1 : 0.3 }}>{icon}</span>
                  ))}
                </div>

                {/* Home indicator */}
                <div style={{
                  position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                  width: 80, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)',
                }} />
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="stg-6" style={{
            position: 'absolute', bottom: 36, left: '50%',
            transform: 'translateX(-50%)', zIndex: 10,
            animation: 'bounce-hint 2s ease infinite',
          }}>
            <div style={{
              width: 18, height: 18,
              borderRight: '2px solid rgba(255,255,255,0.25)',
              borderBottom: '2px solid rgba(255,255,255,0.25)',
              transform: 'rotate(45deg)',
            }} />
          </div>

          {/* Bottom fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
            background: 'linear-gradient(to bottom, transparent, #faf8ff)',
            zIndex: 2, pointerEvents: 'none',
          }} />
        </section>

        {/* ═══════════════════ FEATURES ═══════════════════ */}
        <section style={{ padding: '96px 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <Reveal>
              <p style={{
                textAlign: 'center', fontSize: 12, fontWeight: 700,
                letterSpacing: 3, color: '#6b1ef3',
                textTransform: 'uppercase', marginBottom: 12,
              }}>Everything you need</p>
              <h2 style={{
                textAlign: 'center',
                fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
                fontWeight: 800, lineHeight: 1.2, marginBottom: 48,
              }}>
                Sab ka plan.<br /><span style={{ color: '#6b1ef3' }}>Sab ka kaam.</span>
              </h2>
            </Reveal>

            <div className="bento" style={{
              display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16,
            }}>
              {features.map((f, i) => (
                <Reveal
                  key={f.title}
                  delay={i * 0.1}
                  style={{ gridColumn: i === 0 || i === 3 ? 'span 4' : 'span 2' }}
                >
                  <div className="feat-card" style={{
                    background: '#13101e',
                    borderRadius: 24, padding: 28,
                    boxShadow: `0 4px 32px rgba(0,0,0,0.12), 0 0 0 1px ${f.color}18`,
                    height: '100%',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Accent glow */}
                    <div style={{
                      position: 'absolute', top: -40, right: -40,
                      width: 120, height: 120, borderRadius: '50%',
                      background: `radial-gradient(circle, ${f.color}20, transparent 70%)`,
                      pointerEvents: 'none',
                    }} />
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: `linear-gradient(135deg, ${f.color}30, ${f.color}10)`,
                      border: `1px solid ${f.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, marginBottom: 20,
                      position: 'relative',
                    }}>{f.emoji}</div>
                    <h3 style={{
                      fontSize: 18, fontWeight: 700, marginBottom: 8,
                      color: '#f5f0ff',
                    }}>{f.title}</h3>
                    <p style={{
                      fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7,
                    }}>{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ TICKER ═══════════════════ */}
        <section style={{
          overflow: 'hidden', whiteSpace: 'nowrap',
          padding: '20px 0', background: '#0a0612',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div className="ticker-track">
            {[0, 1, 2].map(k => (
              <span key={k} style={{
                fontSize: 14, color: 'rgba(255,255,255,0.3)',
                fontWeight: 500, letterSpacing: 1,
                fontFamily: "'Outfit', sans-serif",
              }}>{ticker}</span>
            ))}
          </div>
        </section>

        {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
        <section style={{ padding: '96px 24px', background: '#f0ecff' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Reveal>
              <p style={{
                textAlign: 'center', fontSize: 12, fontWeight: 700,
                letterSpacing: 3, color: '#6b1ef3',
                textTransform: 'uppercase', marginBottom: 12,
              }}>Itna simple hai</p>
              <h2 style={{
                textAlign: 'center',
                fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
                fontWeight: 800, marginBottom: 56,
              }}>3 steps. That's it.</h2>
            </Reveal>

            <div className="steps-row" style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            }}>
              {steps.map((s, i) => (
                <React.Fragment key={s.title}>
                  <Reveal delay={i * 0.15} style={{ flex: 1, textAlign: 'center', maxWidth: 220 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 28,
                      background: 'linear-gradient(135deg, #6b1ef3, #9333ea)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 16px', fontSize: 24,
                      boxShadow: '0 8px 24px rgba(107,30,243,0.2)',
                    }}>{s.emoji}</div>
                    <p style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: 2,
                      color: '#6b1ef3', textTransform: 'uppercase', marginBottom: 6,
                    }}>Step 0{i + 1}</p>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: '#6b6580', lineHeight: 1.6 }}>{s.desc}</p>
                  </Reveal>
                  {i < 2 && (
                    <div className="step-connector" style={{
                      width: 48, height: 2, flexShrink: 0,
                      background: 'linear-gradient(90deg, rgba(107,30,243,0.25), rgba(107,30,243,0.08))',
                      marginTop: 28, borderRadius: 1,
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ FINAL CTA ═══════════════════ */}
        <section className="hero-grain" style={{
          padding: '96px 24px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          background: `
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(107,30,243,0.2), transparent),
            radial-gradient(ellipse 40% 40% at 20% 20%, rgba(245,158,11,0.04), transparent),
            #0a0612
          `,
        }}>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 560, margin: '0 auto' }}>
            <Reveal>
              <div style={{
                display: 'inline-block', padding: '8px 20px', borderRadius: 999,
                background: 'rgba(107,30,243,0.12)',
                border: '1px solid rgba(107,30,243,0.2)',
                color: '#a78bfa', fontSize: 14, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", marginBottom: 28,
              }}>📱 Available now — it's free</div>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
                fontWeight: 800, lineHeight: 1.2, color: '#f5f0ff',
              }}>
                Ready to plan<br /><span style={{ color: '#f59e0b' }}>something epic?</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 16 }}>
                Ek link, poori gang ready.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div style={{
                marginTop: 40, display: 'flex', gap: 12,
                justifyContent: 'center', flexWrap: 'wrap',
              }}>
                <button
                  className="cta-main"
                  onClick={() => router.push('/(auth)/login')}
                  style={{
                    background: 'linear-gradient(135deg, #6b1ef3, #9333ea)',
                    color: '#fff', fontSize: 16, fontWeight: 700,
                    padding: '16px 36px', borderRadius: 999,
                    boxShadow: '0 8px 32px rgba(107,30,243,0.4)',
                  }}
                >🌐 Open Web App</button>
                <a
                  href="https://expo.dev/accounts/raykhushi/projects/whodo/builds/a8a89949-93ad-4450-a4fd-3fbe6706ff5e"
                  className="cta-ghost"
                  style={{
                    color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600,
                    padding: '14px 28px', borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >📱 Android APK</a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════ FOOTER ═══════════════════ */}
        <footer style={{
          padding: '40px 32px',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          maxWidth: 960, margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'linear-gradient(135deg, #6b1ef3, #9333ea)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 900, color: '#fff',
              fontFamily: "'Outfit', sans-serif",
            }}>W</div>
            <span style={{
              fontSize: 15, fontWeight: 700, color: '#6b1ef3',
              fontFamily: "'Outfit', sans-serif",
            }}>Whodo</span>
            <span style={{ fontSize: 13, color: '#6b6580' }}>· Jiska naam, uska kaam</span>
          </div>
          <p style={{ fontSize: 13, color: '#6b6580' }}>Built for plans that actually happen</p>
        </footer>
      </div>
    </div>
  );
}
