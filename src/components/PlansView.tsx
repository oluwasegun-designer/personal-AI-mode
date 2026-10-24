import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  FileText,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  Code2,
  Palette,
  Terminal,
  CheckCircle2,
  Circle,
  Download,
  X,
} from 'lucide-react';
import { AIPromptItem, ProjectPlan } from '../types.ts';

export const PlansView: React.FC = () => {
  const {
    plans,
    activePlanId,
    setActivePlanId,
    createPlan,
    deletePlan,
    toggleMilestone,
    updatePlanPrompt,
    profile,
    setActiveTab,
    isLoadingAI,
  } = useApp();

  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [newProjectIdea, setNewProjectIdea] = useState('');
  const [selectedPromptFilter, setSelectedPromptFilter] = useState('All');
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editingPromptText, setEditingPromptText] = useState('');

  const activePlan: ProjectPlan | undefined =
    plans.find((p) => p.id === activePlanId) || plans[0];

  const handleCopyPrompt = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2500);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

  const handleCopyEntirePlan = async () => {
    if (!activePlan) return;
    const markdown = `# ${activePlan.title}
${activePlan.summary}

## Category: ${activePlan.category}
## Stack & Tools: ${activePlan.techOrDesignStack.join(', ')}

---
## Milestones & Action Steps:
${activePlan.milestones.map((m) => `${m.step}. [${m.done ? 'x' : ' '}] ${m.title}: ${m.details}`).join('\n')}

---
## Ready-to-Use Prompts for Other AIs:

${activePlan.aiPrompts
  .map(
    (p, i) => `### Prompt ${i + 1}: ${p.title} (${p.targetAI})
*${p.description}*

\`\`\`
${p.promptText}
\`\`\`
`
  )
  .join('\n\n')}
`;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (e) {
      console.error('Failed to copy plan', e);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!activePlan) return;
    const markdown = `# ${activePlan.title}
${activePlan.summary}

## Category: ${activePlan.category}
## Stack & Tools: ${activePlan.techOrDesignStack.join(', ')}

---
## Milestones:
${activePlan.milestones.map((m) => `${m.step}. [${m.done ? 'x' : ' '}] ${m.title}\n   ${m.details}`).join('\n')}

---
## AI Prompt Packs for External Tools:

${activePlan.aiPrompts
  .map(
    (p, i) => `### ${i + 1}. ${p.title} (${p.targetAI})
${p.description}

\`\`\`
${p.promptText}
\`\`\`
`
  )
  .join('\n\n')}
`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePlan.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_plan.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectIdea.trim() || isLoadingAI) return;
    const idea = newProjectIdea;
    setNewProjectIdea('');
    setIsCreatingModal(false);
    await createPlan(idea);
  };

  const startEditPrompt = (prompt: AIPromptItem) => {
    setEditingPromptId(prompt.id);
    setEditingPromptText(prompt.promptText);
  };

  const saveEditPrompt = (planId: string, promptId: string) => {
    updatePlanPrompt(planId, promptId, editingPromptText);
    setEditingPromptId(null);
  };

  // Filter prompts
  const displayedPrompts = activePlan
    ? selectedPromptFilter === 'All'
      ? activePlan.aiPrompts
      : activePlan.aiPrompts.filter((p) =>
          p.targetAI.toLowerCase().includes(selectedPromptFilter.toLowerCase())
        )
    : [];

  const completedMilestones = activePlan
    ? activePlan.milestones.filter((m) => m.done).length
    : 0;
  const progressPercent = activePlan
    ? Math.round((completedMilestones / activePlan.milestones.length) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              My Plans & AI Prompts
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 bg-amber-100 text-amber-900 text-xs font-semibold rounded-md">
              AI Hand-off
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1 max-w-2xl">
            Structured roadmaps and ready-to-copy prompts tailored to who you are, ready to paste directly into Cursor, Claude, v0, ChatGPT, or Midjourney.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingModal(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project Plan</span>
        </button>
      </div>

      {/* Empty State */}
      {plans.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-stone-200/80 shadow-xs max-w-2xl mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-100 to-purple-100 text-amber-800 border border-amber-200/60 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-7 h-7 text-amber-700" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            No structured plans created yet
          </h2>
          <p className="text-sm text-stone-600 max-w-md mx-auto mb-6 leading-relaxed">
            Tell Personal AI what you want to work on or build. It will craft an actionable roadmap and package specialized prompts ready for other AIs!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <button
              onClick={() => {
                setNewProjectIdea('Design and build an accessible mobile task app with Tailwind and React');
                setIsCreatingModal(true);
              }}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded-xl transition-colors"
            >
              📱 Mobile app with React & Tailwind
            </button>
            <button
              onClick={() => {
                setNewProjectIdea('Create a modern design system with component tokens and dark mode');
                setIsCreatingModal(true);
              }}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded-xl transition-colors"
            >
              🎨 Design System & UI Tokens
            </button>
          </div>

          <button
            onClick={() => setActiveTab('chat')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium shadow-xs transition-colors cursor-pointer"
          >
            <span>Ask Personal AI in Chat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Plan Selector tabs if more than 1 */}
          {plans.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200/70">
              <span className="text-xs text-stone-400 font-medium shrink-0">Projects:</span>
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePlanId(p.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg shrink-0 transition-colors ${
                    activePlan?.id === p.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}

          {activePlan && (
            <div className="space-y-6">
              {/* Plan Overview Banner */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                      <span className="font-semibold text-amber-800">{activePlan.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Created {new Date(activePlan.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                      {activePlan.title}
                    </h2>
                    <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                      {activePlan.summary}
                    </p>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCopyEntirePlan}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors"
                      title="Copy complete plan markdown"
                    >
                      {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAll ? 'Copied Plan!' : 'Copy All'}</span>
                    </button>
                    <button
                      onClick={handleDownloadMarkdown}
                      className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Download as .md file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePlan(activePlan.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete this plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tech & Design Stack Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-stone-100 text-xs">
                  <span className="text-stone-400 font-medium">Stack & Tools:</span>
                  {activePlan.techOrDesignStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-stone-100 text-stone-700 rounded-md font-mono text-[11px]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* 1. Interactive Milestones Checklist */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">
                      Execution Milestones
                    </h3>
                    <p className="text-xs text-stone-400">
                      Step-by-step roadmap to guide your project from concept to launch
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>
                      {completedMilestones} of {activePlan.milestones.length} completed
                    </span>
                    <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {activePlan.milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(activePlan.id, m.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        m.done
                          ? 'bg-stone-50/70 border-stone-200/60 opacity-75'
                          : 'bg-white border-stone-200/90 hover:border-amber-300 hover:shadow-2xs'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-stone-400 hover:text-amber-600 transition-colors"
                        aria-label={m.done ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {m.done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-stone-300 hover:text-amber-500" />
                        )}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-stone-400">
                            STEP {m.step}
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              m.done ? 'line-through text-stone-500' : 'text-stone-900'
                            }`}
                          >
                            {m.title}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {m.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Ready-to-Use Prompts for Other AIs */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-stone-900">
                        Exportable Prompts for Other AIs
                      </h3>
                      <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md font-medium">
                        1-Click Copy
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Tailored with your design persona and technical rules ready to paste into Cursor, Claude, v0, ChatGPT, or Midjourney.
                    </p>
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {['All', 'Cursor', 'v0', 'ChatGPT', 'Midjourney'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSelectedPromptFilter(filter)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          selectedPromptFilter === filter
                            ? 'bg-stone-900 text-white'
                            : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {displayedPrompts.map((prompt, idx) => {
                    const isCopied = copiedPromptId === prompt.id;
                    const isEditing = editingPromptId === prompt.id;

                    return (
                      <div
                        key={prompt.id}
                        className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden transition-all hover:border-stone-300"
                      >
                        {/* Prompt Header */}
                        <div className="p-4 bg-stone-50/80 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-stone-900">{prompt.title}</span>
                              <span aria-hidden="true">·</span>
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-800 font-mono text-[10px] rounded-md font-medium border border-purple-200/60">
                                {prompt.targetAI}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500">{prompt.description}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEditPrompt(activePlan.id, prompt.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingPromptId(null)}
                                  className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditPrompt(prompt)}
                                  className="px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleCopyPrompt(prompt.id, prompt.promptText)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer ${
                                    isCopied
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                                  }`}
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy Prompt</span>
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Prompt Body */}
                        <div className="p-4">
                          {isEditing ? (
                            <textarea
                              rows={8}
                              value={editingPromptText}
                              onChange={(e) => setEditingPromptText(e.target.value)}
                              className="w-full p-3 font-mono text-xs text-stone-800 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          ) : (
                            <pre className="font-mono text-xs text-stone-700 whitespace-pre-wrap leading-relaxed bg-[#FAF9F6] p-4 rounded-xl border border-stone-100 overflow-x-auto max-h-72 overflow-y-auto">
                              {prompt.promptText}
                            </pre>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create New Project Plan */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-stone-900">
                    Create Structured Plan & AI Prompts
                  </h3>
                  <p className="text-xs text-stone-400">
                    Tailored using what Personal AI knows about you
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  What are you building or working on?
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. A mobile app for freelance designers to share quick interactive client previews with comments..."
                  value={newProjectIdea}
                  onChange={(e) => setNewProjectIdea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-stone-400"
                  required
                  autoFocus
                />
              </div>

              <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-600 border border-stone-100 space-y-1">
                <span className="font-semibold text-stone-800">
                  Context automatically injected from your profile:
                </span>
                <p>
                  • Role: <span className="font-medium text-stone-800">{profile.profession || 'Designer'}</span>
                  {profile.preferredName && ` · Name: ${profile.preferredName}`}
                </p>
                <p>
                  • Generates 4 prompt packs for: Cursor, Claude, v0, and ChatGPT.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-3.5 py-2 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectIdea.trim() || isLoadingAI}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:bg-stone-300"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoadingAI ? 'Generating Plan...' : 'Generate Plan & Prompts'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
