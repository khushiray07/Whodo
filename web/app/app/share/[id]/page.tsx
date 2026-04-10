'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { strings } from '@/constants/strings';
import QRCode from 'qrcode';
import type { Plan } from '@/types/database';

export default function SharePage() {
  const params = useParams();
  const planId = params.id as string;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${plan?.invite_code}`
    : '';

  useEffect(() => {
    async function fetchPlan() {
      const { data } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();
      setPlan(data as Plan | null);
    }
    fetchPlan();
  }, [planId]);

  // Generate QR code
  useEffect(() => {
    if (!plan || !shareUrl) return;
    QRCode.toDataURL(shareUrl, {
      width: 256,
      margin: 2,
      color: { dark: '#6b1ef3', light: '#ffffff' },
    }).then(setQrDataUrl).catch(() => {});
  }, [plan, shareUrl]);

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: `Join "${plan?.title}" on Whodo!`,
        text: `Join our plan on Whodo!\n\nCode: ${plan?.invite_code}`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  }

  if (!plan) {
    return <div className="h-40 flex items-center justify-center"><div className="animate-pulse text-primary">Loading...</div></div>;
  }

  return (
    <div className="space-y-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">{strings.shareTitle}</h1>
        <p className="text-on-surface-variant mt-1">{strings.shareSubtitle}</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 space-y-4">
        <p className="font-semibold text-lg">{plan.title}</p>

        {/* QR Code */}
        {qrDataUrl && (
          <div className="flex justify-center">
            <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-xl" />
          </div>
        )}

        {/* Invite code */}
        <div className="bg-surface-container-low rounded-xl p-3">
          <p className="text-xs text-on-surface-variant mb-1">Invite Code</p>
          <p className="text-2xl font-mono font-bold tracking-widest text-primary">{plan.invite_code}</p>
        </div>

        {/* Share URL */}
        <div className="bg-surface-container-low rounded-xl p-3">
          <p className="text-xs text-on-surface-variant mb-1">Share Link</p>
          <p className="text-sm text-primary break-all">{shareUrl}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleCopy} variant="secondary" className="flex-1">
          {copied ? strings.copiedToClipboard : strings.copyLink}
        </Button>
        <Button onClick={handleShare} className="flex-1">
          Share
        </Button>
      </div>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`Join "${plan.title}" on Whodo!\n\n${shareUrl}\n\nCode: ${plan.invite_code}`)}`}
        target="_blank"
        rel="noopener"
      >
        <Button variant="whatsapp" className="w-full">
          Share via WhatsApp
        </Button>
      </a>
    </div>
  );
}
