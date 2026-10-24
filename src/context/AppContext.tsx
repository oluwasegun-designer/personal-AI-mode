import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  ChatMessage,
  MemoryCategory,
  MemoryItem,
  UserAccount,
  UserProfile,
  ServerStatusResponse,
  ProjectPlan,
} from '../types.ts';
import {
  checkServerStatus,
  loadUserData,
  saveUserData,
  sendChatMessage,
  resetUserData,
  generatePlanAPI,
  UserPersistedState,
} from '../services/api.ts';

interface AppContextType {
  user: UserAccount | null;
  serverStatus: ServerStatusResponse | null;
  activeTab: 'chat' | 'plans' | 'profile' | 'memories';
  messages: ChatMessage[];
  memories: MemoryItem[];
  profile: UserProfile;
  plans: ProjectPlan[];
  activePlanId: string | null;
  setActivePlanId: (id: string | null) => void;
  createPlan: (projectIdea: string) => Promise<ProjectPlan>;
  deletePlan: (planId: string) => void;
  toggleMilestone: (planId: string, milestoneId: string) => void;
  updatePlanPrompt: (planId: string, promptId: string, newText: string) => void;
  isOnboardingComplete: boolean;
  isLoadingAI: boolean;
  systemNotice: string | null;
  dismissNotice: () => void;
  pendingMemoriesCount: number;
  approvedMemoriesCount: number;
  login: (name: string, email: string, isDemo?: boolean) => void;
  logout: () => void;
  setActiveTab: (tab: 'chat' | 'plans' | 'profile' | 'memories') => void;
  sendMessage: (text: string) => Promise<void>;
  approveMemory: (memoryId: string) => void;
  rejectMemory: (memoryId: string) => void;
  deleteMemory: (memoryId: string) => void;
  editMemory: (memoryId: string, newContent: string, newCategory: MemoryCategory) => void;
  addManualMemory: (content: string, category: MemoryCategory) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  clearConversation: () => void;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_GREETING: ChatMessage = {
  id: 'msg_welcome',
  userId: '',
  sender: 'assistant',
  text: "Hey! 👋 I'm your Personal AI. I'd love to get to know you so I can be more helpful to you. Let's start with something simple: what should I know about you?",
  timestamp: new Date().toISOString(),
  isOnboarding: true,
};

const DEFAULT_PROFILE: UserProfile = {
  userId: '',
  interests: [],
  goals: [],
  currentProjects: [],
  otherNotes: [],
  lastUpdated: new Date().toISOString(),
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const savedUser = localStorage.getItem('personal_ai_active_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [serverStatus, setServerStatus] = useState<ServerStatusResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'plans' | 'profile' | 'memories'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [plans, setPlans] = useState<ProjectPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [systemNotice, setSystemNotice] = useState<string | null>(null);

  const dismissNotice = useCallback(() => {
    setSystemNotice(null);
  }, []);

  // Check server status once on startup
  useEffect(() => {
    checkServerStatus().then((status) => {
      setServerStatus(status);
    });
  }, []);

  // Load user data when user changes
  useEffect(() => {
    if (!user) {
      setIsDataLoaded(false);
      return;
    }

    let isMounted = true;
    loadUserData(user.id).then((saved) => {
      if (!isMounted) return;
      if (saved) {
        setMessages(saved.messages?.length > 0 ? saved.messages : [{ ...INITIAL_GREETING, userId: user.id }]);
        setMemories(saved.memories || []);
        setProfile(saved.profile || { ...DEFAULT_PROFILE, userId: user.id });
        setPlans(saved.plans || []);
        if (saved.plans && saved.plans.length > 0) {
          setActivePlanId(saved.plans[0].id);
        }
        setIsOnboardingComplete(Boolean(saved.isOnboardingComplete));
      } else {
        // Initialize clean state for new user
        setMessages([{ ...INITIAL_GREETING, userId: user.id }]);
        setMemories([]);
        setProfile({ ...DEFAULT_PROFILE, userId: user.id });
        setPlans([]);
        setActivePlanId(null);
        setIsOnboardingComplete(false);
      }
      setIsDataLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Sync to persistence whenever key state changes (debounced)
  useEffect(() => {
    if (!user || !isDataLoaded) return;

    const timeout = setTimeout(() => {
      const stateToPersist: UserPersistedState = {
        user,
        messages,
        memories,
        profile,
        plans,
        isOnboardingComplete,
      };
      saveUserData(user.id, stateToPersist);
    }, 400);

    return () => clearTimeout(timeout);
  }, [user, messages, memories, profile, plans, isOnboardingComplete, isDataLoaded]);

  const login = useCallback((name: string, email: string, isDemo = false) => {
    const id = isDemo ? 'demo-guest' : email.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const newUser: UserAccount = {
      id,
      name: name || (isDemo ? 'Guest Explorer' : 'Friend'),
      email: email || (isDemo ? 'demo@personal.ai' : ''),
      isDemo,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('personal_ai_active_user', JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('personal_ai_active_user');
    setUser(null);
    setMessages([INITIAL_GREETING]);
    setMemories([]);
    setProfile(DEFAULT_PROFILE);
    setIsOnboardingComplete(false);
    setActiveTab('chat');
  }, []);

  const approveMemory = useCallback((memoryId: string) => {
    setMemories((prev) =>
      prev.map((m) =>
        m.id === memoryId ? { ...m, status: 'approved', approvedAt: new Date().toISOString() } : m
      )
    );
  }, []);

  const rejectMemory = useCallback((memoryId: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
  }, []);

  const deleteMemory = useCallback((memoryId: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
  }, []);

  const editMemory = useCallback(
    (memoryId: string, newContent: string, newCategory: MemoryCategory) => {
      setMemories((prev) =>
        prev.map((m) =>
          m.id === memoryId
            ? {
                ...m,
                content: newContent,
                category: newCategory,
                status: 'approved',
                approvedAt: m.approvedAt || new Date().toISOString(),
              }
            : m
        )
      );
    },
    []
  );

  const addManualMemory = useCallback(
    (content: string, category: MemoryCategory) => {
      if (!user || !content.trim()) return;
      const newMem: MemoryItem = {
        id: 'mem_manual_' + Date.now(),
        userId: user.id,
        content: content.trim(),
        category,
        status: 'approved',
        confidence: 'explicit',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      };
      setMemories((prev) => [newMem, ...prev]);
    },
    [user]
  );

  const updateProfile = useCallback((updated: Partial<UserProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updated,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const clearConversation = useCallback(() => {
    if (!user) return;
    setMessages([
      {
        ...INITIAL_GREETING,
        id: 'msg_welcome_' + Date.now(),
        userId: user.id,
        text: "Fresh conversation started! I still remember everything we've saved in your profile and memories.",
        isOnboarding: false,
      },
    ]);
  }, [user]);

  const createPlan = useCallback(
    async (projectIdea: string) => {
      if (!user) throw new Error('User not logged in');
      setIsLoadingAI(true);
      try {
        const approvedOnly = memories.filter((m) => m.status === 'approved');
        const plan = await generatePlanAPI(user.id, projectIdea, profile, approvedOnly);
        setPlans((prev) => [plan, ...prev]);
        setActivePlanId(plan.id);
        return plan;
      } finally {
        setIsLoadingAI(false);
      }
    },
    [user, profile, memories]
  );

  const deletePlan = useCallback((planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    setActivePlanId((prev) => (prev === planId ? null : prev));
  }, []);

  const toggleMilestone = useCallback((planId: string, milestoneId: string) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          milestones: plan.milestones.map((m) =>
            m.id === milestoneId ? { ...m, done: !m.done } : m
          ),
          lastUpdated: new Date().toISOString(),
        };
      })
    );
  }, []);

  const updatePlanPrompt = useCallback(
    (planId: string, promptId: string, newText: string) => {
      setPlans((prev) =>
        prev.map((plan) => {
          if (plan.id !== planId) return plan;
          return {
            ...plan,
            aiPrompts: plan.aiPrompts.map((p) =>
              p.id === promptId ? { ...p, promptText: newText } : p
            ),
            lastUpdated: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  const resetAllData = useCallback(async () => {
    if (!user) return;
    await resetUserData(user.id);
    setMessages([{ ...INITIAL_GREETING, userId: user.id }]);
    setMemories([]);
    setProfile({ ...DEFAULT_PROFILE, userId: user.id });
    setPlans([]);
    setActivePlanId(null);
    setIsOnboardingComplete(false);
  }, [user]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!user || !text.trim() || isLoadingAI) return;

      const userMsg: ChatMessage = {
        id: 'msg_user_' + Date.now(),
        userId: user.id,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setIsLoadingAI(true);

      try {
        const approvedOnly = memories.filter((m) => m.status === 'approved');
        const response = await sendChatMessage(
          user.id,
          text.trim(),
          updatedHistory,
          approvedOnly,
          profile,
          isOnboardingComplete
        );

        if (response.apiNotice) {
          setSystemNotice(response.apiNotice);
        }

        // Add newly proposed memories if any
        if (response.proposedMemories && response.proposedMemories.length > 0) {
          setMemories((prev) => {
            // Filter out exact duplicates
            const newOnes = response.proposedMemories.filter(
              (cand) => !prev.some((existing) => existing.content.toLowerCase() === cand.content.toLowerCase())
            );
            return [...prev, ...newOnes];
          });
        }

        // Apply profile updates if suggested
        if (response.updatedProfile) {
          setProfile((prev) => {
            const up = response.updatedProfile as any;
            const updated: UserProfile = { ...prev };

            if (up.preferredName) updated.preferredName = up.preferredName;
            if (up.profession) updated.profession = up.profession;
            if (up.communicationPreferences) updated.communicationPreferences = up.communicationPreferences;
            if (up.learningStyle) updated.learningStyle = up.learningStyle;
            if (up.aboutMe) updated.aboutMe = up.aboutMe;

            if (Array.isArray(up.addInterests) && up.addInterests.length > 0) {
              const combined = Array.from(new Set([...(prev.interests || []), ...up.addInterests]));
              updated.interests = combined;
            }
            if (Array.isArray(up.addGoals) && up.addGoals.length > 0) {
              const combined = Array.from(new Set([...(prev.goals || []), ...up.addGoals]));
              updated.goals = combined;
            }
            if (Array.isArray(up.addProjects) && up.addProjects.length > 0) {
              const combined = Array.from(new Set([...(prev.currentProjects || []), ...up.addProjects]));
              updated.currentProjects = combined;
            }

            updated.lastUpdated = new Date().toISOString();
            return updated;
          });
        }

        if (response.isOnboardingComplete && !isOnboardingComplete) {
          setIsOnboardingComplete(true);
        }

        if (response.generatedPlan) {
          setPlans((prev) => {
            const exists = prev.some((p) => p.id === response.generatedPlan!.id);
            if (exists) return prev;
            return [response.generatedPlan!, ...prev];
          });
          setActivePlanId(response.generatedPlan.id);
        }

        const aiMsg: ChatMessage = {
          id: 'msg_ai_' + Date.now(),
          userId: user.id,
          sender: 'assistant',
          text: response.reply,
          timestamp: new Date().toISOString(),
          proposedMemories: response.proposedMemories,
          generatedPlan: response.generatedPlan,
          isOnboarding: !isOnboardingComplete && !response.isOnboardingComplete,
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch (err: any) {
        console.error('Error in sendMessage:', err);
        const errMsg: ChatMessage = {
          id: 'msg_err_' + Date.now(),
          userId: user.id,
          sender: 'assistant',
          text: "I ran into a temporary hiccup getting my thoughts together. Could you share that with me again?",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoadingAI(false);
      }
    },
    [user, messages, memories, profile, isOnboardingComplete, isLoadingAI]
  );

  const pendingMemoriesCount = memories.filter((m) => m.status === 'pending').length;
  const approvedMemoriesCount = memories.filter((m) => m.status === 'approved').length;

  return (
    <AppContext.Provider
      value={{
        user,
        serverStatus,
        activeTab,
        messages,
        memories,
        profile,
        plans,
        activePlanId,
        setActivePlanId,
        createPlan,
        deletePlan,
        toggleMilestone,
        updatePlanPrompt,
        isOnboardingComplete,
        isLoadingAI,
        systemNotice,
        dismissNotice,
        pendingMemoriesCount,
        approvedMemoriesCount,
        login,
        logout,
        setActiveTab,
        sendMessage,
        approveMemory,
        rejectMemory,
        deleteMemory,
        editMemory,
        addManualMemory,
        updateProfile,
        clearConversation,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
