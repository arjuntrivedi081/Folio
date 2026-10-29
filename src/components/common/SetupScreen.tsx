import React, { useState } from 'react';
import { Key, Check, Copy, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { brand } from '../../config/brand';
import { Logo } from './Logo';

export const SetupScreen: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleEnv = `VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"`;

  return (
    <div className="min-h-screen bg-[#FAF8F4] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-4 flex justify-center">
            <Logo variant="full" size="lg" />
          </div>
          <h1 className="text-3xl font-serif-heading font-semibold text-[#141413] tracking-tight">
            Connect {brand.name} to Firebase
          </h1>
          <p className="mt-2 text-sm text-[#5C5955] max-w-lg mx-auto">
            {brand.name} uses Google Firebase for native Cloud Firestore, Storage bucket management,
            multi-tab offline persistence, and Email/Password authentication.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="p-6 rounded-[var(--radius-lg)] border border-[#E7E3DA] bg-white shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#183B32] text-xs font-semibold text-white">
                1
              </span>
              <div className="flex-1">
                <h2 className="text-base font-medium text-[#141413]">
                  Firebase Configuration
                </h2>
                <p className="mt-1 text-xs text-[#5C5955] leading-relaxed">
                  Provide configuration via <code className="text-[#183B32] bg-[#FAF8F4] px-1 py-0.5 rounded border border-[#E7E3DA]">firebase-applet-config.json</code> or set environment variables:
                </p>

                <div className="mt-3 relative rounded-[var(--radius-sm)] bg-[#141413] text-[#FAF8F4] p-3 text-xs font-mono">
                  <pre className="overflow-x-auto">{sampleEnv}</pre>
                  <button
                    onClick={() => copyToClipboard(sampleEnv, 'env')}
                    className="absolute top-2.5 right-2.5 p-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
                    title="Copy sample environment variables"
                  >
                    {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-[var(--radius-lg)] border border-[#E7E3DA] bg-white shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#183B32] text-xs font-semibold text-white">
                2
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-medium text-[#141413]">
                    Deploy Security Rules and Storage
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#183B32]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Built-in
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#5C5955] leading-relaxed">
                  Deploy the configured <code className="text-[#183B32] bg-[#FAF8F4] px-1 py-0.5 rounded border border-[#E7E3DA]">firestore.rules</code> and <code className="text-[#183B32] bg-[#FAF8F4] px-1 py-0.5 rounded border border-[#E7E3DA]">storage.rules</code> via the Firebase CLI:
                </p>
                <div className="mt-2 p-2.5 rounded-[var(--radius-sm)] bg-[#141413] text-[#FAF8F4] font-mono text-xs">
                  firebase deploy --only firestore,storage
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reload button */}
        <div className="mt-8 text-center">
          <Button
            variant="primary"
            size="md"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <Key className="w-4 h-4" />
            Check Connection & Reload
          </Button>
        </div>
      </div>
    </div>
  );
};
