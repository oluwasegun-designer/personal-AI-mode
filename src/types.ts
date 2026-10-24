export type MemoryCategory = 'Personal' | 'Work' | 'Goals' | 'Interests' | 'Preferences';

export type MemoryStatus = 'pending' | 'approved';

export type MemorySource = 'explicit' | 'inferred';

export interface MemoryItem {
  id: string;
  userId: string;
  content: string;
  category: MemoryCategory;
  status: MemoryStatus;
  confidence: MemorySource;
  createdAt: string;
  approvedAt?: string;
  sourceMessage?: string;
}

export interface UserProfile {
  userId: string;
  preferredName?: string;
  aboutMe?: string;
  profession?: string;
  interests: string[];
  goals: string[];
  currentProjects: string[];
  communicationPreferences?: string;
  learningStyle?: string;
  otherNotes?: string[];
  lastUpdated: string;
}

export interface AIPromptItem {
  id: string;
  title: string;
  targetAI: string; // e.g., 'Claude / Cursor', 'v0 / Frontend AI', 'ChatGPT / Product Spec', 'Figma AI / Midjourney'
  description: string;
  promptText: string;
}

export interface ProjectMilestone {
  id: string;
  step: number;
  title: string;
  details: string;
  done: boolean;
}

export interface ProjectPlan {
  id: string;
  userId: string;
  title: string;
  summary: string;
  category: string;
  techOrDesignStack: string[];
  milestones: ProjectMilestone[];
  aiPrompts: AIPromptItem[];
  createdAt: string;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  proposedMemories?: MemoryItem[];
  generatedPlan?: ProjectPlan;
  isOnboarding?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  isDemo: boolean;
  createdAt: string;
}

export interface ServerStatusResponse {
  hasKey: boolean;
  keyType: 'GEMMA_API_KEY' | 'GEMINI_API_KEY' | 'NONE';
  modelName: string;
  isDemoMode: boolean;
  storageType: string;
}

export interface ChatApiResponse {
  reply: string;
  proposedMemories: MemoryItem[];
  updatedProfile?: Partial<UserProfile>;
  generatedPlan?: ProjectPlan;
  isOnboardingComplete?: boolean;
  isSimulated?: boolean;
  apiNotice?: string;
}
