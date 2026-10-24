import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve('data');
const STORAGE_FILE = path.join(DATA_DIR, 'personal_ai_storage.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory + persisted storage helper
interface StorageSchema {
  users: Record<string, any>;
}

function loadStorage(): StorageSchema {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading storage file, initializing empty store:', err);
  }
  return { users: {} };
}

function saveStorage(data: StorageSchema) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving storage file:', err);
  }
}

app.use(express.json({ limit: '10mb' }));

// Helper to validate whether a string is an actual API key vs a model name or placeholder
function isValidApiKey(val: string | undefined): boolean {
  if (!val) return false;
  const s = val.trim();
  if (!s || s === 'MY_GEMINI_API_KEY' || s === 'MY_GEMMA_API_KEY') return false;
  // If it starts with gemma- or gemini- or models/, it is a model identifier, NOT an API key!
  if (
    s.toLowerCase().startsWith('gemma-') ||
    s.toLowerCase().startsWith('gemini-') ||
    s.toLowerCase().startsWith('models/')
  ) {
    return false;
  }
  // Standard API key tokens are at least 20 characters
  if (s.length < 20) return false;
  return true;
}

// Determine API key and model
const rawGemmaKey = process.env.GEMMA_API_KEY?.trim();
const rawGeminiKey = process.env.GEMINI_API_KEY?.trim();

// If GEMMA_API_KEY was passed a model name (e.g. gemma-4-31b-it), use it as model
const gemmaModelFromKey =
  rawGemmaKey && (rawGemmaKey.startsWith('gemma-') || rawGemmaKey.startsWith('models/'))
    ? rawGemmaKey
    : undefined;

const effectiveApiKey = isValidApiKey(rawGemmaKey)
  ? rawGemmaKey!
  : (isValidApiKey(rawGeminiKey) ? rawGeminiKey! : '');

const keyType = isValidApiKey(rawGemmaKey)
  ? 'GEMMA_API_KEY'
  : (isValidApiKey(rawGeminiKey) ? 'GEMINI_API_KEY' : 'NONE');

const modelName =
  process.env.GEMMA_MODEL ||
  process.env.AI_MODEL ||
  gemmaModelFromKey ||
  'gemma-3-27b-it';

// State flag to track whether the key is verified working
let isKeyWorking = effectiveApiKey.length > 0;

// 1. Status API
app.get('/api/status', (req, res) => {
  res.json({
    hasKey: isKeyWorking,
    keyType,
    modelName,
    isDemoMode: !isKeyWorking,
    storageType: 'Persistent File Database (data/personal_ai_storage.json)',
  });
});

// 2. Get user data
app.get('/api/user-data', (req, res) => {
  const userId = (req.query.userId as string) || 'demo-user';
  const store = loadStorage();
  const userData = store.users[userId] || null;
  res.json({ success: true, data: userData });
});

// 3. Save user data
app.post('/api/user-data', (req, res) => {
  const { userId, data } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  const store = loadStorage();
  store.users[userId] = {
    ...data,
    lastSaved: new Date().toISOString(),
  };
  saveStorage(store);
  res.json({ success: true });
});

// 4. Reset user data
app.post('/api/reset-user', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  const store = loadStorage();
  delete store.users[userId];
  saveStorage(store);
  res.json({ success: true });
});

// Helper to create tailored project plans and AI prompt packs for other tools
function createTailoredPlan(
  userId: string,
  projectIdea: string,
  profile: any,
  approvedMemories: any[]
) {
  const role = profile?.profession || 'Designer & Creator';
  const name = profile?.preferredName || 'Creator';
  const cleanIdea = projectIdea?.trim() || 'Modern Application & Design System';
  const commPref = profile?.communicationPreferences || 'Concise, structured, and modular';

  const planId = 'plan_' + Date.now();
  const title = cleanIdea.length > 55 ? cleanIdea.slice(0, 52) + '...' : cleanIdea;
  const stack = ['React', 'TypeScript', 'Tailwind CSS', 'Figma', 'Lucide Icons', 'Motion'];

  const milestones = [
    {
      id: 'm1_' + planId,
      step: 1,
      title: 'Design System & Component Tokens',
      details: `Define responsive color tokens, typographic scale, elevation, and accessible state variants matching your aesthetic as a ${role}.`,
      done: false,
    },
    {
      id: 'm2_' + planId,
      step: 2,
      title: 'Information Architecture & Wireframe Scaffolding',
      details: 'Draft key screen user journeys, eliminate unnecessary modals, and establish consistent card layouts and navigation rhythm.',
      done: false,
    },
    {
      id: 'm3_' + planId,
      step: 3,
      title: 'Frontend Component Development (Vite/Tailwind)',
      details: 'Build interactive, accessible UI components with zero dead clicks, responsive flex/grid wrappers, and subtle micro-interactions.',
      done: false,
    },
    {
      id: 'm4_' + planId,
      step: 4,
      title: 'State Management & Local Persistence',
      details: 'Connect data state with clean stores or hooks, ensure seamless optimistic updates, and persist user work across sessions.',
      done: false,
    },
    {
      id: 'm5_' + planId,
      step: 5,
      title: 'Edge-Case Polish, Accessibility & AI Prompts Audit',
      details: 'Audit WCAG AA color contrast, mobile touch boundaries (>=44px), empty states, and package final documentation.',
      done: false,
    },
  ];

  const aiPrompts = [
    {
      id: 'p1_' + planId,
      title: 'Master Context & System Prompt',
      targetAI: 'Cursor / Claude Code / ChatGPT',
      description: 'Paste this at the start of your session to anchor other AIs to your background, taste, and project goals.',
      promptText: `You are my senior technical engineering partner.

ABOUT ME:
- Role: ${role}
- Name: ${name}
- Communication Style: ${commPref}
- Core Focus: High-quality visual craft, clean design systems, accessible UI, and intuitive product UX.

PROJECT GOAL:
${cleanIdea}

KEY TECHNICAL & DESIGN CONSTRAINTS:
1. Tech Stack: ${stack.join(', ')}.
2. Design Philosophy: Clean typographic hierarchy, generous whitespace, anti-pill discipline, WCAG AA contrast, and zero dead clicks.
3. Code Quality: Clean modular TypeScript, functional React hooks, and strict error handling.
4. Working Rhythm: Give me concise, step-by-step guidance with ready-to-run code snippets. Avoid generic filler.

First, acknowledge this context and provide a concise file architecture proposal.`,
    },
    {
      id: 'p2_' + planId,
      title: 'Component Architecture & Frontend Implementation',
      targetAI: 'v0 by Vercel / Claude 3.7 / Cursor',
      description: 'Use this prompt to build the interactive frontend components with clean Tailwind CSS.',
      promptText: `Act as a principal frontend engineer. Build the primary interactive screens for: "${cleanIdea}".

Design & Implementation Requirements:
- Framework: React + TypeScript + Tailwind CSS.
- Visual Language: Crafted by a ${role}. Warm neutral canvas, subtle borders (border-stone-200), readable typographic hierarchy, and delightful micro-interactions.
- State: Fully reactive with React useState/useCallback, complete with loading spinners, empty states, and optimistic UI updates.
- Accessibility: Keyboard navigable, ARIA labels on icon buttons, min 44px touch targets on mobile.
- Zero Placeholder Mocking: Every button and interactive control must be wired to a real handler.

Generate the complete, drop-in React component code with all imports and types included.`,
    },
    {
      id: 'p3_' + planId,
      title: 'UI Visual Art Direction & Asset Generation',
      targetAI: 'Midjourney / Figma AI / Flux',
      description: 'Generate high-fidelity visual assets, hero visuals, or iconography for this product.',
      promptText: `A modern, human-centric user interface design for "${cleanIdea}". Designed from the perspective of an elite ${role}. Warm off-white background, soft natural lighting, elegant typography, subtle depth, minimalist glassmorphism elements, tasteful warm accents (amber/indigo), studio quality, clean UI mockup, 8k resolution, crisp vector precision --ar 16:9 --v 6.1`,
    },
    {
      id: 'p4_' + planId,
      title: 'Product Requirements & Edge-Case Audit (PRD)',
      targetAI: 'ChatGPT / Claude (Product Partner)',
      description: 'Ask an AI to stress-test your concept and generate a comprehensive specification with edge cases.',
      promptText: `Review this project concept from the perspective of a seasoned Product Manager and UX Architect:

Concept: "${cleanIdea}"
Audience / User Context: Designed by a ${role}.
Target Stack: ${stack.join(', ')}.

Please generate:
1. 5 critical user stories with strict acceptance criteria (Given / When / Then).
2. A list of 6 potential edge cases or failure modes (e.g. offline status, empty data, unexpected user input) and recommended UX mitigations.
3. A prioritized MVP vs. V2 scope boundary matrix.
Keep the output crisp, actionable, and formatted in clean markdown.`,
    },
  ];

  return {
    id: planId,
    userId,
    title,
    summary: `Structured execution plan tailored for your work as a ${role}. Includes actionable milestones and 4 exportable prompt packs ready to paste into Cursor, Claude, v0, and ChatGPT.`,
    category: 'Product & Design Engineering',
    techOrDesignStack: stack,
    milestones,
    aiPrompts,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
}

// 4b. Generate structured plan & AI prompt pack endpoint
app.post('/api/generate-plan', (req, res) => {
  const { userId, projectIdea, profile, approvedMemories } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const plan = createTailoredPlan(userId, projectIdea, profile || {}, approvedMemories || []);
  const store = loadStorage();
  if (store.users[userId]) {
    store.users[userId].plans = [plan, ...(store.users[userId].plans || [])];
    saveStorage(store);
  }
  res.json({ success: true, plan });
});

// Helper: simulated conversation engine for Demo Mode or missing API key
function getSimulatedResponse(
  message: string,
  history: any[],
  approvedMemories: any[],
  profile: any,
  isOnboardingComplete: boolean
) {
  const lower = message.toLowerCase();
  const userMsgCount = history.filter((m) => m.sender === 'user').length + 1;

  const proposedMemories: any[] = [];
  const profileUpdates: any = {};
  let reply = '';
  let completeOnboarding = isOnboardingComplete;

  // Check if user asks about memories
  if (
    lower.includes('what do you remember') ||
    lower.includes('what do you know about me') ||
    lower.includes('tell me what you remember')
  ) {
    if (approvedMemories.length === 0) {
      reply = "I don't have any saved memories yet! As we talk, I'll notice helpful facts and preferences about you and offer to save them so you can approve them.";
    } else {
      const summary = approvedMemories.map((m: any) => `• [${m.category}] ${m.content}`).join('\n');
      reply = `Here is what I remember about you:\n\n${summary}\n\nYou can review, edit, or remove any of these anytime in My Memories. What else would you like to explore?`;
    }
    return { reply, proposedMemories, profileUpdates, isOnboardingComplete: completeOnboarding, isSimulated: true };
  }

  // Check if user wants goal setting
  if (lower.includes('help me set a goal') || lower.includes('goal')) {
    reply = "I'd love to help you set a meaningful goal! What's an area you're eager to make progress on right now — is it career, creative, health, or learning something new?";
    return { reply, proposedMemories, profileUpdates, isOnboardingComplete: completeOnboarding, isSimulated: true };
  }

  // Onboarding conversation flow
  if (!isOnboardingComplete) {
    if (userMsgCount === 1) {
      // First response after initial greeting
      const nameMatch = message.match(/(?:my name is|i'm|i am|call me|name's)\s+([A-Z][a-z]+)/i);
      const name = nameMatch ? nameMatch[1] : '';
      if (name) {
        profileUpdates.preferredName = name;
        proposedMemories.push({
          id: 'mem_' + Date.now() + '_1',
          content: `Preferred name is ${name}`,
          category: 'Personal',
          status: 'pending',
          confidence: 'explicit',
          createdAt: new Date().toISOString(),
        });
      }
      reply = name
        ? `Wonderful to meet you, ${name}! What kind of work or projects do you spend most of your time on?`
        : "It's wonderful to meet you! Tell me a bit about what you do — what kind of work, study, or projects keep you busy?";
    } else if (userMsgCount === 2) {
      profileUpdates.profession = message.trim();
      proposedMemories.push({
        id: 'mem_' + Date.now() + '_2',
        content: `Work / role: ${message.slice(0, 80)}`,
        category: 'Work',
        status: 'pending',
        confidence: 'explicit',
        createdAt: new Date().toISOString(),
      });
      reply = "That sounds fascinating! Outside of your work and daily responsibilities, what are you most passionate about or interested in?";
    } else if (userMsgCount === 3) {
      profileUpdates.interests = [message.trim()];
      proposedMemories.push({
        id: 'mem_' + Date.now() + '_3',
        content: `Passionate about: ${message.slice(0, 80)}`,
        category: 'Interests',
        status: 'pending',
        confidence: 'explicit',
        createdAt: new Date().toISOString(),
      });
      reply = "I love that. Having meaningful interests keeps life energized! Looking ahead over the next few months, what is a key goal you're working toward?";
    } else if (userMsgCount === 4) {
      profileUpdates.goals = [message.trim()];
      proposedMemories.push({
        id: 'mem_' + Date.now() + '_4',
        content: `Current goal: ${message.slice(0, 90)}`,
        category: 'Goals',
        status: 'pending',
        confidence: 'explicit',
        createdAt: new Date().toISOString(),
      });
      reply = "That is an inspiring goal to focus on. How do you prefer we communicate and collaborate — for instance, do you like concise bullet points, deep detailed explanations, or practical step-by-step advice?";
    } else {
      profileUpdates.communicationPreferences = message.trim();
      proposedMemories.push({
        id: 'mem_' + Date.now() + '_5',
        content: `Communication preference: ${message.slice(0, 80)}`,
        category: 'Preferences',
        status: 'pending',
        confidence: 'explicit',
        createdAt: new Date().toISOString(),
      });
      completeOnboarding = true;
      reply = "Thanks for sharing a little about yourself! I'm starting to understand you better. You can keep telling me more whenever you like. The more I know about your preferences and goals, the more personally I can help.\n\nWhat would you like to work on or chat about today?";
    }
    return { reply, proposedMemories, profileUpdates, isOnboardingComplete: completeOnboarding, isSimulated: true };
  }

  // Check if user is asking to build an app, create a project, or wants a plan/prompts for other AIs
  if (
    lower.includes('build an app') ||
    lower.includes('project') ||
    lower.includes('plan') ||
    lower.includes('prompt') ||
    lower.includes('designer') ||
    lower.includes('other ai') ||
    lower.includes('create an app')
  ) {
    const isDesigner = lower.includes('designer') || profile?.profession?.toLowerCase()?.includes('design');
    if (lower.includes('designer') && !profile?.profession) {
      profileUpdates.profession = 'Designer';
      proposedMemories.push({
        id: 'mem_' + Date.now() + '_role',
        content: 'Works as a Designer',
        category: 'Work',
        status: 'pending',
        confidence: 'explicit',
        createdAt: new Date().toISOString(),
      });
    }

    const mergedProfile = { ...profile, ...profileUpdates };
    const generatedPlan = createTailoredPlan(profile?.userId || 'user', message, mergedProfile, approvedMemories);
    reply = `I've put together a personalized, structured plan for your project based on your background as a ${isDesigner ? 'designer' : 'creator'}!\n\nI also crafted 4 ready-to-use AI Prompt Packs tailored specifically for other AIs (Cursor, Claude Code, v0, and ChatGPT) so you can directly copy and paste them into your workflow.\n\nYou can review the milestones and copy all AI prompts in the card below or head to the My Plans & AI Prompts tab!`;

    return {
      reply,
      proposedMemories,
      profileUpdates,
      generatedPlan,
      isOnboardingComplete: true,
      isSimulated: true,
    };
  }

  // Regular conversational responses
  // Extract potential facts if user mentioned preferences, hobbies, or work
  if (lower.includes('prefer') || lower.includes('like') || lower.includes('hate') || lower.includes('love')) {
    proposedMemories.push({
      id: 'mem_' + Date.now() + '_pref',
      content: `User shared: "${message.slice(0, 90)}"`,
      category: 'Preferences',
      status: 'pending',
      confidence: 'explicit',
      createdAt: new Date().toISOString(),
    });
  }

  const knownName = profile.preferredName ? `, ${profile.preferredName}` : '';
  reply = `I appreciate you telling me that${knownName}! I've noted that in your context. How would you like us to approach this together?`;

  return { reply, proposedMemories, profileUpdates, isOnboardingComplete: true, isSimulated: true };
}

// 5. Chat endpoint (Live Gemma / Gemini with fallback)
app.post('/api/chat', async (req, res) => {
  const { userId, message, history, approvedMemories, profile, isOnboardingComplete } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If no working API key configured, seamlessly use the smart simulation engine
  if (!isKeyWorking || !effectiveApiKey) {
    const simResult = getSimulatedResponse(
      message,
      history || [],
      approvedMemories || [],
      profile || {},
      isOnboardingComplete ?? false
    );
    return res.json(simResult);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveApiKey });

    // Format approved memories and profile context
    const memoriesContext = (approvedMemories || []).length > 0
      ? approvedMemories.map((m: any) => `- [${m.category}] ${m.content}`).join('\n')
      : 'None yet.';

    const profileContext = JSON.stringify({
      preferredName: profile?.preferredName || 'Unknown',
      profession: profile?.profession || 'Unknown',
      interests: profile?.interests || [],
      goals: profile?.goals || [],
      currentProjects: profile?.currentProjects || [],
      communicationPreferences: profile?.communicationPreferences || 'Not specified',
      learningStyle: profile?.learningStyle || 'Not specified',
      otherNotes: profile?.otherNotes || [],
    }, null, 2);

    const isFirstTime = !isOnboardingComplete;

    const systemPrompt = `You are Personal AI, a warm, thoughtful, empathetic personal AI companion whose mission is to genuinely get to know the user.
Your personality is friendly, intelligent, kind, attentive, and human-scaled — never cold, clinical, robotic, or like a technical developer dashboard.

CONTEXT ABOUT THE USER:
--- Approved Memories ---
${memoriesContext}

--- Known Profile ---
${profileContext}

ONBOARDING INSTRUCTIONS:
- Onboarding status: ${isFirstTime ? 'IN PROGRESS (Still getting to know the user)' : 'COMPLETED'}
${isFirstTime ? `
- IMPORTANT RULE: Ask EXACTLY ONE question at a time.
- Wait for the user's answer before deciding what to ask next.
- Gradually explore:
  1. Preferred name (if not known)
  2. Profession, role, or what they do
  3. Interests and passions
  4. Personal or professional goals
  5. Current projects or responsibilities
  6. Communication preferences & explanation style
  7. Working and learning styles
- Acknowledge their answer naturally with warm enthusiasm and empathy.
- Never repeat a question or ask for info you already have in memories or profile.
- If the user has already answered 3 to 5 key questions, or says they want to wrap up/skip, warmly conclude onboarding by saying:
  "Thanks for sharing a little about yourself! I'm starting to understand you better. You can keep telling me more whenever you like. The more I know about your preferences and goals, the more personally I can help."
  and set "isOnboardingComplete": true.
` : `
- The user is past onboarding. Chat naturally, helpfully, and personally.
- Naturally weave in things you know about them (their name, interests, work, goals, preferences) without being intrusive.
`}

MEMORY EXTRACTION RULES:
- Identify any useful, stable personal facts, preferences, goals, or roles mentioned in the user's latest message.
- Categories MUST be one of: "Personal", "Work", "Goals", "Interests", "Preferences".
- NEVER save passwords, authentication secrets, tokens, credit card info, or sensitive private credentials.
- Do NOT save every transient message — prioritize lasting, helpful information.
- Distinguish between explicit user statements ("confidence": "explicit") and inferences ("confidence": "inferred").

OUTPUT FORMAT:
You MUST respond with valid JSON matching this schema:
{
  "reply": "Warm conversational response to the user. (If onboarding, asks one single question)",
  "proposedMemories": [
    {
      "content": "Short, clear summary of fact or preference learned",
      "category": "Personal" | "Work" | "Goals" | "Interests" | "Preferences",
      "confidence": "explicit" | "inferred"
    }
  ],
  "profileUpdates": {
    "preferredName": "string or undefined",
    "profession": "string or undefined",
    "addInterests": ["string"],
    "addGoals": ["string"],
    "addProjects": ["string"],
    "communicationPreferences": "string or undefined",
    "learningStyle": "string or undefined",
    "aboutMe": "string or undefined"
  },
  "isOnboardingComplete": boolean
}`;

    // Format chat conversation turns
    const conversationTurns = (history || []).slice(-8).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    conversationTurns.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let generatedText = '';
    try {
      // First attempt with configured model (Gemma or Gemini Flash)
      const response = await ai.models.generateContent({
        model: modelName,
        contents: conversationTurns,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });
      generatedText = response.text || '';
    } catch (modelErr: any) {
      // If the model call fails due to invalid key, quota, or permission, fall back to companion simulation
      isKeyWorking = false;
      const fallback = getSimulatedResponse(
        message,
        history || [],
        approvedMemories || [],
        profile || {},
        isOnboardingComplete ?? false
      );
      return res.json({
        ...fallback,
        apiNotice: 'Demo Companion mode active (Live AI key not active in current environment).',
      });
    }

    // Parse JSON from generated text
    let parsed: any = null;
    const cleaned = generatedText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      const startIdx = cleaned.indexOf('{');
      const endIdx = cleaned.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        parsed = JSON.parse(cleaned.substring(startIdx, endIdx + 1));
      } else {
        parsed = {
          reply: generatedText,
          proposedMemories: [],
          profileUpdates: {},
          isOnboardingComplete: isOnboardingComplete,
        };
      }
    }

    const proposedList = (parsed.proposedMemories || []).map((m: any, idx: number) => ({
      id: 'mem_' + Date.now() + '_' + idx,
      userId,
      content: m.content || '',
      category: ['Personal', 'Work', 'Goals', 'Interests', 'Preferences'].includes(m.category)
        ? m.category
        : 'Personal',
      status: 'pending',
      confidence: m.confidence === 'inferred' ? 'inferred' : 'explicit',
      createdAt: new Date().toISOString(),
      sourceMessage: message,
    }));

    let generatedPlan = null;
    const lowerMsg = message.toLowerCase();
    if (
      lowerMsg.includes('build an app') ||
      lowerMsg.includes('project') ||
      lowerMsg.includes('plan') ||
      lowerMsg.includes('prompt') ||
      lowerMsg.includes('other ai')
    ) {
      const merged = { ...profile, ...(parsed.profileUpdates || {}) };
      generatedPlan = createTailoredPlan(userId, message, merged, approvedMemories);
      const store = loadStorage();
      if (store.users[userId]) {
        store.users[userId].plans = [generatedPlan, ...(store.users[userId].plans || [])];
        saveStorage(store);
      }
    }

    return res.json({
      reply: parsed.reply || "I'm listening and getting to know you better. Tell me more!",
      proposedMemories: proposedList,
      profileUpdates: parsed.profileUpdates || {},
      generatedPlan,
      isOnboardingComplete: Boolean(parsed.isOnboardingComplete ?? isOnboardingComplete),
      isSimulated: false,
    });
  } catch (err: any) {
    isKeyWorking = false;
    const fallback = getSimulatedResponse(
      message,
      history || [],
      approvedMemories || [],
      profile || {},
      isOnboardingComplete ?? false
    );
    return res.json({
      ...fallback,
      apiNotice: 'Demo Companion mode active (Live AI key not active in current environment).',
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Personal AI server listening on http://0.0.0.0:${PORT}`);
    console.log(`API Key status: ${isKeyWorking ? 'Configured (' + keyType + ')' : 'Demo Mode (no key)'}`);
    console.log(`Model: ${modelName}`);
  });
}

startServer();
