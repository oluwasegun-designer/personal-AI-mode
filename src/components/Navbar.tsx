import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { MessageSquare, User, Sparkles, LogOut, RotateCcw, ShieldCheck, ChevronDown, Layers } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    activeTab,
    setActiveTab,
    pendingMemoriesCount,
    plans,
    serverStatus,
    logout,
    resetAllData,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = async () => {
    await resetAllData();
    setShowResetConfirm(false);
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-400/20 to-purple-500/20 border border-amber-300/40 flex items-center justify-center text-amber-700 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="font-semibold text-stone-900 tracking-tight text-base sm:text-lg">
                Personal AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-stone-500 font-normal">
                A companion that gets to know you
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'chat'
                  ? 'bg-stone-900 text-stone-50 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'plans'
                  ? 'bg-stone-900 text-stone-50 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Plans & Prompts</span>
              {plans.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-semibold text-stone-600 bg-stone-100 rounded-full">
                  {plans.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-stone-900 text-stone-50 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('memories')}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'memories'
                  ? 'bg-stone-900 text-stone-50 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>My Memories</span>
              {pendingMemoriesCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-semibold text-white bg-amber-600 rounded-full animate-pulse">
                  {pendingMemoriesCount}
                </span>
              )}
            </button>
          </nav>

          {/* User & Status */}
          <div className="flex items-center gap-3">
            {/* Model / Key indicator */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-500">
              <span className={`w-2 h-2 rounded-full ${serverStatus?.hasKey ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <span>{serverStatus?.hasKey ? 'Gemma / Gemini Live' : 'Demo Mode'}</span>
            </div>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-stone-200 bg-white/80 hover:bg-white text-stone-700 text-xs sm:text-sm transition-colors shadow-2xs"
                  aria-label="User account menu"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-medium text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 text-stone-700 text-xs sm:text-sm">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="font-semibold text-stone-900 truncate">{user.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      {user.isDemo && (
                        <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Demo guest account
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setShowResetConfirm(true);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-600 hover:text-red-600 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset all learned data</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Reset learned data?</h3>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              This will clear your conversation history, approved memories, and personal profile information. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
              >
                Yes, reset everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
