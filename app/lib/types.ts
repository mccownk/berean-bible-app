
export interface ReadingPlan {
  id: string;
  name: string;
  description: string | null;
  totalDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyReading {
  id: string;
  planId: string;
  day: number;
  passages: string[];
  estimatedMinutes: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  planId: string;
  readingId: string;
  currentCycle: number;
  isCompleted: boolean;
  completedAt: Date | null;
  readingTimeSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  timezone: string | null;
  preferredReadingTime: number | null;
  notificationsEnabled: boolean;
  theme: string | null;
  fontSize: string | null;
}

export interface Note {
  id: string;
  userId: string;
  readingId: string;
  content: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  requiredCount: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: Date;
  achievement: Achievement;
}

export interface ReadingStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastReadingDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BiblePassage {
  reference: string;
  content: string;
}

export interface ReadingSession {
  day: number;
  passages: BiblePassage[];
  estimatedMinutes: number;
  isCompleted: boolean;
  progress?: ReadingProgress;
  notes?: Note[];
}

export interface DashboardStats {
  totalDaysCompleted: number;
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  averageReadingTime: number;
  currentPhase: string;
  daysInCurrentPhase: number;
  totalPhases: number;
  achievements: UserAchievement[];
  recentReadings: ReadingProgress[];
}

export interface ReadingPlanOverview {
  plan: ReadingPlan;
  dailyReadings: DailyReading[];
  userProgress: ReadingProgress[];
  completedDays: number;
  currentDay: number;
  nextDay: number;
}

export type Theme = 'light' | 'dark' | 'sepia';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

export interface UserPreferences {
  theme: Theme;
  fontSize: FontSize;
  notificationsEnabled: boolean;
  preferredReadingTime: number | null;
  timezone: string;
}

export interface ReadingPlanPhase {
  name: string;
  description: string;
  startDay: number;
  endDay: number;
  books: string[];
  repetitions: number;
}

export interface BereanReadingPlan {
  phases: ReadingPlanPhase[];
  totalDays: number;
  totalYears: number;
  methodology: string;
}
