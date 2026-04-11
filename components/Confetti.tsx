import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';

type Props = {
  active: boolean;
  onComplete?: () => void;
};

const COLORS = ['#6b1ef3', '#5cfd80', '#ff928c', '#0066cc', '#e65100', '#ad8eff', '#f74b6d', '#006a28'];
const PARTICLE_COUNT = 60;
const DURATION = 2500;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
};

function createParticles(width: number, height: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: width * 0.3 + Math.random() * width * 0.4,
    y: height * 0.2,
    vx: (Math.random() - 0.5) * 12,
    vy: -(Math.random() * 8 + 4),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    gravity: 0.15 + Math.random() * 0.1,
  }));
}

// Web implementation using canvas
function WebConfetti({ active, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = createParticles(canvas.width, canvas.height);
    const startTime = Date.now();
    let animFrame: number;

    function animate() {
      const elapsed = Date.now() - startTime;
      if (elapsed > DURATION) {
        ctx!.clearRect(0, 0, canvas.width, canvas.height);
        onComplete?.();
        return;
      }

      const fade = Math.max(0, 1 - (elapsed - DURATION * 0.7) / (DURATION * 0.3));

      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vx *= 0.99;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.globalAlpha = fade;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx!.restore();
      }

      animFrame = requestAnimationFrame(animate);
    }

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

// Native implementation using React Native views
function NativeConfetti({ active, onComplete }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const ps = createParticles(400, 800);
    setParticles(ps);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + p.gravity,
          vx: p.vx * 0.99,
          rotation: p.rotation + p.rotationSpeed,
        })),
      );
    }, 16);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setParticles([]);
      onComplete?.();
    }, DURATION);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            transform: [{ rotate: `${p.rotation}deg` }],
          }}
        />
      ))}
    </View>
  );
}

function CelebrationText({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <View style={textStyles.overlay} pointerEvents="none">
      <View style={textStyles.card}>
        <Text style={textStyles.emoji}>🎉</Text>
        <Text style={textStyles.title}>Sab Ho Gaya!</Text>
        <Text style={textStyles.subtitle}>All tasks done. Ab chill karo.</Text>
      </View>
    </View>
  );
}

const textStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9998,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#6b1ef3',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 10,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6b1ef3',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#5a5b60',
  },
});

export function Confetti(props: Props) {
  return (
    <>
      {Platform.OS === 'web' ? <WebConfetti {...props} /> : <NativeConfetti {...props} />}
      <CelebrationText active={props.active} />
    </>
  );
}
