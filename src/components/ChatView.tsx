import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Send,
  Sparkles,
  RotateCcw,
  Check,
  X,
  Compass,
  ArrowRight,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import { MemoryItem } from '../types.ts';

export const ChatView: React.FC = () => {
  const {
    messages,
    sendMessage,
    isLoadingAI,
    memories,
    profile,
    isOnboardingComplete,
    clearConversation,
    approveMemory,
    rejectMemory,
    setActiveTab,
    setActivePlanId,
    serverStatus,
    systemNotice,
    dismissNotice,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [showNewChatConfirm, setShowNewChatConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAI]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoadingAI) return;
    const text = inputText;
    setInputText('');
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt);
  };

  // Find pending memories that were recently proposed in messages
  const pendingMemories = memories.filter((m) => m.status === 'pending');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto px-3 sm:px-6">
      {/* Top Chat Bar: Actions & Context notice */}
      <div className="py-2.5 px-2 flex items-center justify-between border-b border-stone-200/60 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-stone-700">Personal AI</span>
          </div>
          <span aria-hidden="true">·</span>
          <span>
            {isOnboardingComplete ? 'Conversation mode' : 'Getting to know you (1 question at a time)'}
          </span>
          {serverStatus?.isDemoMode && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm">Demo Companion</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {pendingMemories.length > 0 && (
            <button
              onClick={() => setActiveTab('memories')}
              className="text-amber-800 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-md flex items-center gap-1 text-[11px] font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>{pendingMemories.length} memory to review</span>
            </button>
          )}

          <button
            onClick={() => setShowNewChatConfirm(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors text-[11px]"
            title="Start a fresh chat (does not delete saved memories)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Conversation</span>
          </button>
        </div>
      </div>

      {/* API Notice / Demo Companion mode clarification */}
      {systemNotice && (
        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-2 shadow-2xs">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Notice: </span>
              <span>{systemNotice}</span>
            </div>
          </div>
          <button
            onClick={dismissNotice}
            className="text-amber-700 hover:text-amber-950 p-0.5 rounded-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.map((msg, index) => {
          const isAI = msg.sender === 'assistant';
          return (
            <div
              key={msg.id || index}
              className={`flex gap-3 sm:gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {/* AI Avatar */}
              {isAI && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-200 via-orange-100 to-purple-200 border border-amber-300/60 flex items-center justify-center shrink-0 text-amber-800 shadow-2xs mt-0.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                </div>
              )}

              {/* Message Bubble & Cards */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isAI
                      ? 'bg-white text-stone-800 border border-stone-200/80 shadow-xs'
                      : 'bg-stone-900 text-stone-50 shadow-xs rounded-tr-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Candidate Memories Proposed by this turn */}
                {isAI && msg.proposedMemories && msg.proposedMemories.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {msg.proposedMemories.map((cand) => {
                      // Check if already approved/dismissed
                      const current = memories.find((m) => m.id === cand.id);
                      const isPending = current?.status === 'pending';
                      const isApproved = current?.status === 'approved';

                      return (
                        <div
                          key={cand.id}
                          className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 text-[11px] text-amber-800 font-medium">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Proposed Memory · {cand.category}</span>
                              <span className="text-stone-400 font-normal">
                                ({cand.confidence === 'explicit' ? 'Stated by you' : 'Inferred'})
                              </span>
                            </div>
                            <p className="text-stone-800 font-medium">{cand.content}</p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => approveMemory(cand.id)}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-medium transition-colors shadow-2xs cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Save</span>
                                </button>
                                <button
                                  onClick={() => rejectMemory(cand.id)}
                                  className="flex items-center gap-1 px-2 py-1 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-md text-[11px] transition-colors cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Dismiss</span>
                                </button>
                              </>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-sm">
                                <Check className="w-3 h-3" /> Saved to Memories
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Generated Project Plan Card */}
                {isAI && msg.generatedPlan && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5 my-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4 text-amber-700" />
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">
                            Structured Plan & AI Prompts Ready
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                            {msg.generatedPlan.title}
                          </h4>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActivePlanId(msg.generatedPlan!.id);
                          setActiveTab('plans');
                        }}
                        className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>View Plan & Prompts</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                      {msg.generatedPlan.summary}
                    </p>

                    <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-1 text-[11px] text-stone-500">
                      <span>
                        {msg.generatedPlan.milestones.length} Milestones · {msg.generatedPlan.aiPrompts.length} Prompts for Other AIs
                      </span>
                      <span className="font-mono text-amber-900 font-medium">
                        Cursor · Claude · v0 · ChatGPT
                      </span>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-stone-400 px-1 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoadingAI && (
          <div className="flex gap-3 sm:gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-200 via-orange-100 to-purple-200 border border-amber-300/60 flex items-center justify-center shrink-0 text-amber-800 shadow-2xs mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-700 animate-spin" />
            </div>
            <div className="bg-white border border-stone-200/80 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-1.5 text-stone-400">
              <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-stone-500 ml-2 font-normal">Personal AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Topics / Prompts */}
      <div className="py-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-stone-600 no-scrollbar">
          <span className="text-stone-400 text-[11px] shrink-0">Suggestions:</span>
          <button
            onClick={() => handleSuggestionClick("I'm a designer. I want to build an app — help me create a structured plan and prompts for other AIs.")}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100/70 text-amber-900 border border-amber-200 rounded-lg text-xs shrink-0 transition-colors shadow-2xs font-medium"
          >
            🎨 I&apos;m a designer, help me plan an app
          </button>
          <button
            onClick={() => handleSuggestionClick('Generate exportable AI prompts for my project.')}
            className="px-3 py-1.5 bg-white/90 hover:bg-white text-stone-700 border border-stone-200 rounded-lg text-xs shrink-0 transition-colors shadow-2xs"
          >
            ⚡ Generate AI Prompts for Cursor / v0
          </button>
          <button
            onClick={() => handleSuggestionClick('Tell me what you remember about me.')}
            className="px-3 py-1.5 bg-white/90 hover:bg-white text-stone-700 border border-stone-200 rounded-lg text-xs shrink-0 transition-colors shadow-2xs"
          >
            What do you remember about me?
          </button>
          <button
            onClick={() => handleSuggestionClick('Help me set a goal for this month.')}
            className="px-3 py-1.5 bg-white/90 hover:bg-white text-stone-700 border border-stone-200 rounded-lg text-xs shrink-0 transition-colors shadow-2xs"
          >
            Help me set a goal
          </button>
          {!isOnboardingComplete && (
            <button
              onClick={() => handleSuggestionClick("I'd like to conclude onboarding now and just chat freely.")}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs shrink-0 transition-colors"
            >
              Finish onboarding
            </button>
          )}
          <button
            onClick={() => handleSuggestionClick('How can you adapt to my working style?')}
            className="px-3 py-1.5 bg-white/90 hover:bg-white text-stone-700 border border-stone-200 rounded-lg text-xs shrink-0 transition-colors shadow-2xs"
          >
            How can you adapt to my style?
          </button>
        </div>
      </div>

      {/* Message Input Box */}
      <div className="pb-4 pt-1">
        <form
          onSubmit={handleSend}
          className="relative flex items-end gap-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-2 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isOnboardingComplete
                ? 'Message your Personal AI...'
                : 'Reply with your answer (one question at a time)...'
            }
            className="flex-1 max-h-32 min-h-[38px] p-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none resize-none bg-transparent"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoadingAI}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              inputText.trim() && !isLoadingAI
                ? 'bg-stone-900 text-white shadow-xs hover:bg-stone-800'
                : 'bg-stone-100 text-stone-300 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-stone-400 text-center mt-2 flex items-center justify-center gap-1">
          <Info className="w-3 h-3 text-stone-400" />
          <span>
            Personal AI extracts useful memories to personalize your chats. You can review and edit them in My Memories.
          </span>
        </p>
      </div>

      {/* New Conversation Confirm Modal */}
      {showNewChatConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-base font-semibold text-stone-900 mb-2">Start a new conversation?</h3>
            <p className="text-xs text-stone-600 mb-5 leading-relaxed">
              This will clear the current chat thread. Don&apos;t worry: all your saved memories and profile information will stay intact!
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNewChatConfirm(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearConversation();
                  setShowNewChatConfirm(false);
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
