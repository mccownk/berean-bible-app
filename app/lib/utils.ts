
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTimeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`;
  }
}

export function calculateReadingProgress(completed: number, total: number): number {
  return Math.round((completed / total) * 100);
}

export function formatReadingStreak(streak: number): string {
  if (streak === 0) return 'Start your streak!';
  if (streak === 1) return '1 day streak';
  return `${streak} day streak`;
}

export function getBiblePassageKey(passage: string): string {
  // Convert passage like "Matthew 1:1-17" to "matthew-1-1-17"
  return passage.toLowerCase().replace(/\s+/g, '-').replace(/:/g, '-');
}

export function getCurrentCycle(dayNumber: number): number {
  // 750-day plan repeats over 3.5 years (approximately 1,277 days)
  const totalDuration = 1277; // 3.5 years in days
  const planLength = 750;
  
  if (dayNumber <= planLength) return 1;
  if (dayNumber <= planLength * 2) return 2;
  return 3;
}

export function getCurrentPhase(dayNumber: number): string {
  // Based on the 750-day plan structure
  if (dayNumber <= 180) return 'Gospels Foundation';
  if (dayNumber <= 240) return 'Early Church';
  if (dayNumber <= 400) return 'Pauline Letters';
  if (dayNumber <= 600) return 'General Letters';
  return 'Prophecy & Revelation';
}

export function getNextReadingDay(currentDay: number, totalDays: number): number {
  return currentDay < totalDays ? currentDay + 1 : 1;
}

export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function calculateStreakFromReadings(readings: { completedAt: Date | null }[]): number {
  if (!readings?.length) return 0;
  
  const completedReadings = readings
    .filter(r => r.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
  
  if (!completedReadings.length) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const reading of completedReadings) {
    const completedDate = new Date(reading.completedAt!);
    completedDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function generateReadingSchedule(startDate: Date, totalDays: number): Date[] {
  const schedule: Date[] = [];
  
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    schedule.push(date);
  }
  
  return schedule;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function formatPassageReference(passages: string[]): string {
  if (passages.length === 1) {
    return passages[0];
  }
  
  return passages.join(', ');
}

export function getReadingPlanProgress(completedDays: number, totalDays: number): {
  percentage: number;
  phase: string;
  cycleInfo: string;
} {
  const percentage = calculateReadingProgress(completedDays, totalDays);
  const phase = getCurrentPhase(completedDays);
  const cycle = getCurrentCycle(completedDays);
  
  return {
    percentage,
    phase,
    cycleInfo: `Cycle ${cycle} of 3.5-year plan`
  };
}

export const bereanPlanStructure = {
  phases: [
    {
      name: 'Gospels Foundation',
      description: 'Matthew, Mark, Luke, John - The life and teachings of Jesus',
      startDay: 1,
      endDay: 180,
      books: ['Matthew', 'Mark', 'Luke', 'John'],
      repetitions: 1
    },
    {
      name: 'Early Church',
      description: 'Acts and Romans - The birth and growth of the church',
      startDay: 181,
      endDay: 300,
      books: ['Acts', 'Romans'],
      repetitions: 1
    },
    {
      name: 'Pauline Letters',
      description: 'Paul\'s letters to the churches',
      startDay: 301,
      endDay: 500,
      books: ['1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians'],
      repetitions: 1
    },
    {
      name: 'Pastoral & General Letters',
      description: 'Timothy, Titus, Philemon, Hebrews, James, Peter, John, Jude',
      startDay: 501,
      endDay: 680,
      books: ['1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude'],
      repetitions: 1
    },
    {
      name: 'Prophecy & Revelation',
      description: 'The culmination of God\'s redemptive plan',
      startDay: 681,
      endDay: 750,
      books: ['Revelation'],
      repetitions: 1
    }
  ],
  totalDays: 750,
  totalYears: 3.5,
  methodology: 'Repetition-based learning with daily immersion'
};
