import React from 'react';
import { ArrowLeft, ShieldCheck, HardDrive, EyeOff, Cpu, Lock, Download, FileText } from 'lucide-react';
import { Haptics } from '../services/haptics';

interface PrivacyPolicyViewProps {
  onBack: () => void;
  onExportJson?: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({
  onBack,
  onExportJson,
}) => {
  return (
    <div id="soulnote-privacy-page" className="max-w-2xl mx-auto space-y-10 pb-20 pt-2 animate-in fade-in duration-200">
      {/* Back to Journal Button */}
      <div>
        <button
          type="button"
          onClick={() => {
            Haptics.selection();
            onBack();
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-[#5F5D57] dark:text-[#A6A49D] hover:text-[#1E1E1C] dark:hover:text-[#EDEDEB] hover:bg-[#F2EFE9] dark:hover:bg-[#1E1E1C] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Journal</span>
        </button>
      </div>

      {/* Hero Header */}
      <section className="space-y-3 border-b border-[#E8E6DF] dark:border-[#262622] pb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-[#7C7A75] dark:text-[#8E8C85] tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Privacy-First Architecture</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#1E1E1C] dark:text-[#EDEDEB]">
          SoulNote Privacy Policy
        </h1>

        <p className="text-sm text-[#5F5D57] dark:text-[#A6A49D] leading-relaxed max-w-xl">
          SoulNote is founded on an uncompromising principle: <strong>your emotional life and private thoughts belong exclusively to you.</strong> We do not collect, transmit, monetize, or process any of your personal entries.
        </p>

        <div className="text-[11px] text-[#8E8C85] dark:text-[#7A7872] pt-1">
          Effective Date: September 11, 2026 • Route: <code className="px-1.5 py-0.5 rounded bg-[#F0EEE8] dark:bg-[#20201D]">/privacy</code>
        </div>
      </section>

      {/* 4 Pillars Summary Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-[#F4F2EC] dark:bg-[#242420] flex items-center justify-center text-[#1E1E1C] dark:text-[#EDEDEB]">
            <HardDrive className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-base font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            100% Local Storage
          </h3>
          <p className="text-xs text-[#6F6D67] dark:text-[#9A9890] leading-relaxed">
            All entries remain strictly on your device inside your browser's <code className="text-[11px] font-mono">localStorage</code>. No external database or server is ever contacted.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-[#F4F2EC] dark:bg-[#242420] flex items-center justify-center text-[#1E1E1C] dark:text-[#EDEDEB]">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-base font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            Zero Tracking & Ads
          </h3>
          <p className="text-xs text-[#6F6D67] dark:text-[#9A9890] leading-relaxed">
            No telemetry, no Google Analytics, no tracking pixels, and no advertising networks. Your behavior is never profiled or sold.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-[#F4F2EC] dark:bg-[#242420] flex items-center justify-center text-[#1E1E1C] dark:text-[#EDEDEB]">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-base font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            Data Minimization
          </h3>
          <p className="text-xs text-[#6F6D67] dark:text-[#9A9890] leading-relaxed">
            Your private journal writing is never mined. Optional AI prompts send strictly the minimum topic title, never your written entries.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-[#F4F2EC] dark:bg-[#242420] flex items-center justify-center text-[#1E1E1C] dark:text-[#EDEDEB]">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-base font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            Total Ownership & Export
          </h3>
          <p className="text-xs text-[#6F6D67] dark:text-[#9A9890] leading-relaxed">
            Download your raw JSON, TXT, or PDF backup anytime. Delete everything with a single tap in Settings with zero retention.
          </p>
        </div>
      </section>

      {/* Detailed Policy Text */}
      <article className="prose dark:prose-invert max-w-none text-[#2C2C28] dark:text-[#D5D3CC] text-sm space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            1. Zero Cloud Data Collection
          </h2>
          <p className="text-xs text-[#52504A] dark:text-[#A6A49D] leading-relaxed">
            SoulNote does not maintain an online account system. You do not need to register with an email address, username, or phone number. When you log an emotion or write a reflection, that data is committed directly into client-side web storage (<code className="font-mono text-[11px]">localStorage</code>) in your active browser profile.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            2. Offline Functionality & Progressive Web App (PWA)
          </h2>
          <p className="text-xs text-[#52504A] dark:text-[#A6A49D] leading-relaxed">
            SoulNote operates as a standalone Progressive Web App. When installed to your phone or desktop, all application shell assets are cached locally through a client-side Service Worker. You can use SoulNote in airplane mode or in remote areas with zero network connectivity.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            3. On-Device Security (PIN & Biometrics)
          </h2>
          <p className="text-xs text-[#52504A] dark:text-[#A6A49D] leading-relaxed">
            To prevent others who borrow your device from reading your journal, SoulNote offers an optional 4-digit PIN lock and WebAuthn biometric integration. Verification is executed locally on your device.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            4. Exporting and Deleting Your Records
          </h2>
          <p className="text-xs text-[#52504A] dark:text-[#A6A49D] leading-relaxed">
            You can export your complete journal history at any time without asking permission. SoulNote supports raw JSON exports, human-readable plain text (.txt), and formatted PDF printouts. If you choose to clear your data, the local storage keys are wiped immediately. Because no copies exist on external servers, this deletion is instantaneous and irreversible.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-medium text-[#1E1E1C] dark:text-[#EDEDEB]">
            5. Contact
          </h2>
          <p className="text-xs text-[#52504A] dark:text-[#A6A49D] leading-relaxed">
            If you have questions regarding SoulNote's privacy architecture, contact us at <a href="mailto:cp7edits@gmail.com" className="underline font-medium">cp7edits@gmail.com</a>.
          </p>
        </section>
      </article>

      {/* Action Footer */}
      <section className="p-5 rounded-3xl bg-[#F5F4F0] dark:bg-[#181816] border border-[#EAE8E1] dark:border-[#262622] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="space-y-0.5 text-center sm:text-left">
          <span className="font-serif text-sm font-medium text-[#1E1E1C] dark:text-[#EDEDEB] block">
            Take Your Data With You
          </span>
          <span className="text-xs text-[#7C7A75] dark:text-[#8E8C85]">
            Export a full raw JSON backup of all entries from localStorage.
          </span>
        </div>

        {onExportJson && (
          <button
            type="button"
            onClick={() => {
              Haptics.success();
              onExportJson();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E1E1C] dark:bg-[#EDEDEB] text-[#FBFBFA] dark:text-[#121211] text-xs font-medium cursor-pointer transition-all active:scale-[0.98] shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Entries (JSON)</span>
          </button>
        )}
      </section>
    </div>
  );
};
