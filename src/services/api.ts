import {
  ChatMessage,
  MemoryItem,
  UserProfile,
  ServerStatusResponse,
  ChatApiResponse,
  UserAccount,
  ProjectPlan,
} from '../types.ts';

const LOCAL_STORAGE_KEY_PREFIX = 'personal_ai_user_';

export async function checkServerStatus(): Promise<ServerStatusResponse> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status failed');
    return await res.json();
  } catch (err) {
    return {
      hasKey: false,
      keyType: 'NONE',
      modelName: 'demo-local',
      isDemoMode: true,
      storageType: 'Client LocalStorage Fallback',
    };
  }
}

export interface UserPersistedState {
  user: UserAccount;
  messages: ChatMessage[];
  memories: MemoryItem[];
  profile: UserProfile;
  plans?: ProjectPlan[];
  isOnboardingComplete: boolean;
}

export async function loadUserData(userId: string): Promise<UserPersistedState | null> {
  // Try server first
  try {
    const res = await fetch(`/api/user-data?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (e) {
    console.warn('Could not load from server API, falling back to localStorage', e);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading localStorage', e);
  }

  return null;
}

export async function saveUserData(userId: string, data: UserPersistedState): Promise<boolean> {
  // Save to localStorage immediately for instant local persistence
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }

  // Sync to server storage
  try {
    const res = await fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, data }),
    });
    return res.ok;
  } catch (e) {
    console.warn('Could not sync to server database', e);
    return false;
  }
}

export async function sendChatMessage(
  userId: string,
  message: string,
  history: ChatMessage[],
  approvedMemories: MemoryItem[],
  profile: UserProfile,
  isOnboardingComplete: boolean
): Promise<ChatApiResponse> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        message,
        history,
        approvedMemories,
        profile,
        isOnboardingComplete,
      }),
    });
    if (!res.ok) {
      throw new Error(`Chat API error: ${res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error('Failed to communicate with chat backend:', err);
    throw err;
  }
}

export async function resetUserData(userId: string): Promise<boolean> {
  try {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
  } catch (e) {}

  try {
    const res = await fetch('/api/reset-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function generatePlanAPI(
  userId: string,
  projectIdea: string,
  profile: UserProfile,
  approvedMemories: MemoryItem[]
): Promise<ProjectPlan> {
  const res = await fetch('/api/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, projectIdea, profile, approvedMemories }),
  });
  if (!res.ok) throw new Error('Failed to generate structured plan');
  const json = await res.json();
  return json.plan;
}
