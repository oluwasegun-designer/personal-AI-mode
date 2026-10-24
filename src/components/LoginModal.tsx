import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Sparkles, ArrowRight, ShieldAlert, HeartHandshake, Compass } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { login, serverStatus } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    login(name.trim(), email.trim() || `${name.trim().toLowerCase()}@example.com`, false);
  };

  const handleDemoLogin = () => {
    login('Guest Explorer', 'demo@personal.ai', true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#FAF8F5] via-[#F6F2EC] to-[#EFEAE2]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/80">
        {/* App Symbol & Intro */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100/70 border border-amber-300/40 text-amber-800 shadow-xs mb-4">
            <Sparkles className="w-7 h-7 text-amber-700" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-sans">
            Personal AI
          </h1>
          <p className="text-sm text-stone-600 mt-2 leading-relaxed">
            A friendly personal companion that gets to know who you are, what you care about, and how you like to work.
          </p>
        </div>

        {/* Core Values / Features */}
        <div className="space-y-2 mb-6 bg-stone-50/70 rounded-2xl p-4 border border-stone-100 text-xs text-stone-600">
          <div className="flex items-start gap-2.5">
            <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Asks gentle questions one at a time to learn your style and goals</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Proposes useful memories for your review and approval</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Compass className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Maintains your personal profile that you can edit anytime</span>
          </div>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleCustomLogin} className="space-y-3.5 mb-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="userName">
              Your name or preferred nickname
            </label>
            <input
              id="userName"
              type="text"
              placeholder="e.g. Maya, Jordan, Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-stone-400 bg-stone-50/40"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="userEmail">
              Email or account identifier <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="userEmail"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-stone-400 bg-stone-50/40"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Start Personal AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-3 text-[11px] text-stone-400 uppercase tracking-wider">or</span>
        </div>

        {/* Demo Mode Button */}
        <div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100/70 text-amber-900 border border-amber-200/80 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue in Demo Mode (Guest Access)</span>
          </button>
        </div>

        {/* Demo Mode Notice */}
        <div className="mt-4 p-3 rounded-xl bg-stone-100/60 border border-stone-200/60 flex items-start gap-2.5 text-[11px] text-stone-500 leading-snug">
          <ShieldAlert className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-stone-700">Storage & Privacy Notice: </span>
            This workspace saves your profile and memories to local persistence. Multi-user enterprise OAuth is not yet provisioned.
            {serverStatus?.hasKey ? (
              <span className="block mt-1 text-emerald-700 font-medium">
                Live Google AI is connected and active.
              </span>
            ) : (
              <span className="block mt-1 text-amber-700 font-medium">
                Running in Demo Mode with intelligent local companion simulation.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
