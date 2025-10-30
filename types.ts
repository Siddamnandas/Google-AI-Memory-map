// types.ts
export type View =
  | 'onboarding'
  | 'home'
  | 'scrapbook'
  | 'games'
  | 'family'
  | 'profile'
  | 'upgrade'
  | 'game-memory-match-up'
  | 'game-story-quiz-quest'
  | 'game-timeline-tango'
  | 'game-echo-echo'
  | 'game-legacy-link'
  | 'game-snapshot-solve'
  | 'aistudio';

export type Plan = 'free' | 'premium';
export type Theme = 'nostalgic' | 'fun';
export type Permission = 'view' | 'comment' | 'contribute';

export interface User {
  name: string;
  age: number;
  avatar: 'man' | 'woman';
  avatarUrl?: string; // Add avatarUrl for chat
  theme: Theme;
  plan: Plan;
  memoryStrength: number; // 0-100
  streak: number;
  longestStreak: number;
  trialEndDate?: string;
}

export interface Memory {
  id: string;
  content: string;
  tags: string[];
  timestamp: string;
  image?: string; // base64 data URL
  audio?: string; // base64 data URL
}

export enum GameType {
  MemoryMatchUp = "Memory Match-Up",
  StoryQuizQuest = "Story Quiz Quest",
  TimelineTango = "Timeline Tango",
  EchoEcho = "Echo Echo",
  LegacyLink = "Legacy Link",
  SnapshotSolve = "Snapshot Solve",
}

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export interface MatchPair {
  id: string;
  word: string;
  match: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface TimelineEvent {
  id: string;
  description: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  permission: Permission;
  avatarUrl: string;
}

export interface PendingContribution {
  id: string;
  familyMemberName: string;
  photo: string; // URL for a photo
  caption: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string; // URL
  text?: string;
  imageUrl?: string;
  reactions: { [emoji: string]: string[] };
  timestamp: string;
  edited?: boolean;
}