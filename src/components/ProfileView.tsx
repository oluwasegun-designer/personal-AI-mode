import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  User,
  Briefcase,
  Heart,
  Target,
  FolderKanban,
  MessageCircle,
  GraduationCap,
  Sparkles,
  Edit2,
  Check,
  X,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile } from '../types.ts';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, setActiveTab, user } = useApp();

  // State for which section is currently being edited
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Temporary edit states
  const [tempAboutMe, setTempAboutMe] = useState(profile.aboutMe || '');
  const [tempPreferredName, setTempPreferredName] = useState(profile.preferredName || '');
  const [tempProfession, setTempProfession] = useState(profile.profession || '');
  const [tempComm, setTempComm] = useState(profile.communicationPreferences || '');
  const [tempLearning, setTempLearning] = useState(profile.learningStyle || '');

  // Tag inputs for list sections
  const [newInterestInput, setNewInterestInput] = useState('');
  const [newGoalInput, setNewGoalInput] = useState('');
  const [newProjectInput, setNewProjectInput] = useState('');
  const [newNoteInput, setNewNoteInput] = useState('');

  const hasAnyData =
    Boolean(profile.preferredName) ||
    Boolean(profile.aboutMe) ||
    Boolean(profile.profession) ||
    (profile.interests && profile.interests.length > 0) ||
    (profile.goals && profile.goals.length > 0) ||
    (profile.currentProjects && profile.currentProjects.length > 0) ||
    Boolean(profile.communicationPreferences) ||
    Boolean(profile.learningStyle) ||
    (profile.otherNotes && profile.otherNotes.length > 0);

  const startEditing = (section: string) => {
    setEditingSection(section);
    setTempAboutMe(profile.aboutMe || '');
    setTempPreferredName(profile.preferredName || '');
    setTempProfession(profile.profession || '');
    setTempComm(profile.communicationPreferences || '');
    setTempLearning(profile.learningStyle || '');
  };

  const cancelEditing = () => {
    setEditingSection(null);
  };

  const saveTextSection = (field: keyof UserProfile, value: string) => {
    updateProfile({ [field]: value.trim() || undefined });
    setEditingSection(null);
  };

  const removeListItem = (field: 'interests' | 'goals' | 'currentProjects' | 'otherNotes', index: number) => {
    const list = [...(profile[field] || [])];
    list.splice(index, 1);
    updateProfile({ [field]: list });
  };

  const addListItem = (field: 'interests' | 'goals' | 'currentProjects' | 'otherNotes', value: string) => {
    if (!value.trim()) return;
    const list = [...(profile[field] || [])];
    if (!list.includes(value.trim())) {
      list.push(value.trim());
      updateProfile({ [field]: list });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              My Personal Profile
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              What Personal AI has learned about you. You can review, refine, or update any detail.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-stone-500 bg-stone-100/70 border border-stone-200/60 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Private & completely user-controlled</span>
          </div>
        </div>
      </div>

      {/* Empty State when no profile details yet */}
      {!hasAnyData ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-stone-200/80 shadow-xs max-w-2xl mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            I&apos;m still getting to know you
          </h2>
          <p className="text-sm text-stone-600 max-w-md mx-auto mb-6 leading-relaxed">
            Let&apos;s chat, and your personal profile will grow with you. As you share what you do, your interests, and your goals, they&apos;ll be collected here.
          </p>
          <button
            onClick={() => setActiveTab('chat')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium shadow-xs transition-colors cursor-pointer"
          >
            <span>Start Chatting</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Identity & About Me Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-stone-900">About Me</h2>
                  <p className="text-xs text-stone-400">Name and personal background</p>
                </div>
              </div>

              {editingSection !== 'aboutMe' ? (
                <button
                  onClick={() => startEditing('aboutMe')}
                  className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 px-2.5 py-1 rounded-md transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      updateProfile({
                        preferredName: tempPreferredName.trim() || undefined,
                        aboutMe: tempAboutMe.trim() || undefined,
                      });
                      setEditingSection(null);
                    }}
                    className="flex items-center gap-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-2 py-1 rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {editingSection === 'aboutMe' ? (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Preferred Name
                  </label>
                  <input
                    type="text"
                    value={tempPreferredName}
                    onChange={(e) => setTempPreferredName(e.target.value)}
                    placeholder="What should the AI call you?"
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    About You
                  </label>
                  <textarea
                    rows={3}
                    value={tempAboutMe}
                    onChange={(e) => setTempAboutMe(e.target.value)}
                    placeholder="Brief background or overview of who you are..."
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-medium text-stone-900">
                  {profile.preferredName || user?.name || 'Not yet specified'}
                </div>
                {profile.aboutMe ? (
                  <p className="text-sm text-stone-600 leading-relaxed">{profile.aboutMe}</p>
                ) : (
                  <p className="text-xs text-stone-400 italic">No biographical note shared yet.</p>
                )}
              </div>
            )}
          </div>

          {/* What I Do (Profession & Responsibilities) */}
          {(profile.profession || editingSection === 'profession') && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-800 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-stone-900">What I Do</h2>
                    <p className="text-xs text-stone-400">Profession, role, and main responsibilities</p>
                  </div>
                </div>

                {editingSection !== 'profession' ? (
                  <button
                    onClick={() => startEditing('profession')}
                    className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => saveTextSection('profession', tempProfession)}
                      className="flex items-center gap-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-md transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-2 py-1 rounded-md transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {editingSection === 'profession' ? (
                <div className="pt-2">
                  <textarea
                    rows={2}
                    value={tempProfession}
                    onChange={(e) => setTempProfession(e.target.value)}
                    placeholder="e.g. Senior Product Designer focusing on healthcare..."
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              ) : (
                <p className="text-sm text-stone-700 leading-relaxed">{profile.profession}</p>
              )}
            </div>
          )}

          {/* My Interests */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-stone-900">My Interests</h2>
                <p className="text-xs text-stone-400">Passions, hobbies, and topics you care about</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {(profile.interests || []).map((interest, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-800 rounded-lg text-xs"
                >
                  <span>{interest}</span>
                  <button
                    onClick={() => removeListItem('interests', idx)}
                    className="text-stone-400 hover:text-red-600 transition-colors"
                    title="Remove interest"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {(!profile.interests || profile.interests.length === 0) && (
                <span className="text-xs text-stone-400 italic">No interests recorded yet.</span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <input
                type="text"
                placeholder="Add an interest (e.g. Urban gardening, Astrophysics)..."
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addListItem('interests', newInterestInput);
                    setNewInterestInput('');
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={() => {
                  addListItem('interests', newInterestInput);
                  setNewInterestInput('');
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* My Goals */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-stone-900">My Goals</h2>
                <p className="text-xs text-stone-400">Personal and professional ambitions</p>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {(profile.goals || []).map((goal, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 bg-stone-50 rounded-xl text-xs text-stone-700 border border-stone-100"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{goal}</span>
                  </div>
                  <button
                    onClick={() => removeListItem('goals', idx)}
                    className="text-stone-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(!profile.goals || profile.goals.length === 0) && (
                <span className="text-xs text-stone-400 italic">No specific goals shared yet.</span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <input
                type="text"
                placeholder="Add a goal you are aiming for..."
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addListItem('goals', newGoalInput);
                    setNewGoalInput('');
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={() => {
                  addListItem('goals', newGoalInput);
                  setNewGoalInput('');
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Current Projects */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-stone-900">Current Projects</h2>
                <p className="text-xs text-stone-400">Initiatives and work you are actively driving</p>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {(profile.currentProjects || []).map((proj, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 bg-stone-50 rounded-xl text-xs text-stone-700 border border-stone-100"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{proj}</span>
                  </div>
                  <button
                    onClick={() => removeListItem('currentProjects', idx)}
                    className="text-stone-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(!profile.currentProjects || profile.currentProjects.length === 0) && (
                <span className="text-xs text-stone-400 italic">No active projects listed yet.</span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <input
                type="text"
                placeholder="Add a current project..."
                value={newProjectInput}
                onChange={(e) => setNewProjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addListItem('currentProjects', newProjectInput);
                    setNewProjectInput('');
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={() => {
                  addListItem('currentProjects', newProjectInput);
                  setNewProjectInput('');
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Communication Preferences & Learning Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Communication Preferences */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-stone-900">Communication Style</h2>
                    <p className="text-xs text-stone-400">How you like information presented</p>
                  </div>
                </div>

                {editingSection !== 'comm' ? (
                  <button
                    onClick={() => startEditing('comm')}
                    className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => saveTextSection('communicationPreferences', tempComm)}
                      className="flex items-center gap-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-md transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-2 py-1 rounded-md transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {editingSection === 'comm' ? (
                <textarea
                  rows={2}
                  value={tempComm}
                  onChange={(e) => setTempComm(e.target.value)}
                  placeholder="e.g. Concise bullet points, direct tone, plain English..."
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              ) : (
                <p className="text-sm text-stone-700 leading-relaxed">
                  {profile.communicationPreferences || 'Not yet specified.'}
                </p>
              )}
            </div>

            {/* Learning Style */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-stone-900">How I Like to Learn</h2>
                    <p className="text-xs text-stone-400">Working and learning style</p>
                  </div>
                </div>

                {editingSection !== 'learning' ? (
                  <button
                    onClick={() => startEditing('learning')}
                    className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 hover:bg-stone-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => saveTextSection('learningStyle', tempLearning)}
                      className="flex items-center gap-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-md transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-2 py-1 rounded-md transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {editingSection === 'learning' ? (
                <textarea
                  rows={2}
                  value={tempLearning}
                  onChange={(e) => setTempLearning(e.target.value)}
                  placeholder="e.g. Visual diagrams, concrete examples first..."
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              ) : (
                <p className="text-sm text-stone-700 leading-relaxed">
                  {profile.learningStyle || 'Not yet specified.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
