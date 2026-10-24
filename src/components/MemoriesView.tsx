import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Sparkles,
  Check,
  X,
  Edit2,
  Trash2,
  Plus,
  Shield,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { MemoryCategory, MemoryItem } from '../types.ts';

const CATEGORIES: MemoryCategory[] = ['Personal', 'Work', 'Goals', 'Interests', 'Preferences'];

export const MemoriesView: React.FC = () => {
  const {
    memories,
    approveMemory,
    rejectMemory,
    deleteMemory,
    editMemory,
    addManualMemory,
    setActiveTab,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCat, setNewCat] = useState<MemoryCategory>('Personal');

  // Edit memory state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCat, setEditCat] = useState<MemoryCategory>('Personal');

  const pendingList = memories.filter((m) => m.status === 'pending');
  const approvedList = memories.filter((m) => m.status === 'approved');

  const filteredApproved = selectedCategory === 'All'
    ? approvedList
    : approvedList.filter((m) => m.category === selectedCategory);

  const startEditing = (m: MemoryItem) => {
    setEditingId(m.id);
    setEditContent(m.content);
    setEditCat(m.category);
  };

  const handleSaveEdit = (id: string) => {
    if (!editContent.trim()) return;
    editMemory(id, editContent.trim(), editCat);
    setEditingId(null);
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    addManualMemory(newContent.trim(), newCat);
    setNewContent('');
    setIsAddingNew(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            My Memories
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Information Personal AI has learned to personalize future conversations. You have full control.
          </p>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add a Memory</span>
        </button>
      </div>

      {/* Add Memory Modal / Form */}
      {isAddingNew && (
        <div className="mb-8 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-stone-900">Add a new memory manually</h3>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreateMemory} className="space-y-3">
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                What should Personal AI remember?
              </label>
              <input
                type="text"
                placeholder="e.g. Likes morning meetings rather than afternoons"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
                autoFocus
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-stone-600">Category:</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCat(cat)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                      newCat === cat
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg shadow-xs"
              >
                Save Memory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 1. Pending Memories Section (Awaiting Approval) */}
      {pendingList.length > 0 && (
        <div className="mb-10 bg-amber-50/50 border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-700" />
              </div>
              <h2 className="text-base font-semibold text-stone-900">
                Awaiting Approval ({pendingList.length})
              </h2>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Review and approve memories before the AI uses them in future chats
            </p>
          </div>

          <div className="space-y-3">
            {pendingList.map((cand) => (
              <div
                key={cand.id}
                className="bg-white rounded-xl p-4 border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-semibold text-amber-800">{cand.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{cand.confidence === 'explicit' ? 'Explicitly stated' : 'AI Inferred'}</span>
                    <span aria-hidden="true">·</span>
                    <span>Just now</span>
                  </div>
                  <p className="text-sm font-medium text-stone-800">{cand.content}</p>
                  {cand.sourceMessage && (
                    <p className="text-xs text-stone-400 italic">
                      From: &ldquo;{cand.sourceMessage.slice(0, 100)}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => approveMemory(cand.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => rejectMemory(cand.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Saved Memories Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              Saved Memories ({approvedList.length})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Active knowledge the AI uses to customize responses
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {['All', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state for approved list */}
        {filteredApproved.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/80 shadow-xs max-w-lg mx-auto my-6">
            <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-5 h-5 text-stone-500" />
            </div>
            <h3 className="text-sm font-semibold text-stone-800 mb-1">
              {approvedList.length === 0
                ? 'No memories saved yet'
                : `No memories under "${selectedCategory}"`}
            </h3>
            <p className="text-xs text-stone-500 mb-4 max-w-xs mx-auto">
              {approvedList.length === 0
                ? 'As you talk to Personal AI in chat, it will notice facts and ask if you want to remember them.'
                : 'Try selecting another category or add a new memory above.'}
            </p>
            {approvedList.length === 0 && (
              <button
                onClick={() => setActiveTab('chat')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <span>Go to Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApproved.map((mem) => {
              const isEditing = editingId === mem.id;

              return (
                <div
                  key={mem.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between transition-all hover:border-stone-300"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-600 mb-1">
                          Edit Memory
                        </label>
                        <textarea
                          rows={2}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-stone-500">Category:</label>
                        <select
                          value={editCat}
                          onChange={(e) => setEditCat(e.target.value as MemoryCategory)}
                          className="text-xs border border-stone-200 rounded-md px-2 py-1 bg-white text-stone-700"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(mem.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-800">{mem.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-stone-400">
                              {mem.confidence === 'explicit' ? 'Explicit' : 'Inferred'}
                            </span>
                          </div>

                          <span className="text-[11px] text-stone-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(mem.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <p className="text-sm text-stone-800 leading-relaxed font-normal">
                          {mem.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-stone-100">
                        <button
                          onClick={() => startEditing(mem)}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
                          title="Edit memory"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMemory(mem.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete memory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Privacy Guarantee Box */}
      <div className="mt-12 bg-stone-100/70 border border-stone-200/80 rounded-2xl p-5 flex items-start gap-3 text-xs text-stone-600">
        <Shield className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-stone-800">Privacy & Memory Guarantee</p>
          <p className="leading-relaxed">
            Personal AI prioritizes useful, stable facts and working preferences. It will never save passwords, financial information, tokens, or intrusive assumptions. You can remove individual memories at any time or ask in chat &ldquo;What do you remember about me?&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
