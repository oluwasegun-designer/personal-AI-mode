/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { ChatView } from './components/ChatView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { MemoriesView } from './components/MemoriesView.tsx';
import { PlansView } from './components/PlansView.tsx';
import { Info, X, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, activeTab, serverStatus } = useApp();
  const [showStatusNotice, setShowStatusNotice] = useState(true);

  if (!user) {
    return <LoginModal />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      {/* Model & persistence status notice (dismissible) */}
      {showStatusNotice && (
        <aside aria-label="System status notice" className="bg-amber-50/80 border-b border-amber-200/60 text-xs text-amber-900 py-1.5 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                {serverStatus?.hasKey ? (
                  <>
                    <strong className="font-semibold">Live AI Active:</strong> Running with{' '}
                    <span className="font-mono text-[11px]">{serverStatus.modelName}</span>. Your memories and profile persist in server storage.
                  </>
                ) : (
                  <>
                    <strong className="font-semibold">Demo Mode:</strong> Running with simulated companion. Add{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">GEMINI_API_KEY</code> or{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">GEMMA_API_KEY</code> to enable live model queries.
                  </>
                )}
              </span>
            </div>
            <button
              onClick={() => setShowStatusNotice(false)}
              className="text-amber-700 hover:text-amber-950 p-1 rounded-sm"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* Main Area */}
      <main className="flex-1">
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'plans' && <PlansView />}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'memories' && <MemoriesView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
