import type { Badge, TestAttempt } from '@/types';
import { BADGES } from '@/types';
import { gamificationDB } from './supabaseDB';

export const GamificationService = {
  calculateXP: (type: 'test' | 'battle' | 'voice' | 'daily', data?: any): number => {
    switch (type) {
      case 'test':
        // Base XP + Bonus for percentage
        const score = data as TestAttempt;
        return 50 + Math.floor(score.percentage / 2);
      case 'battle':
        // Win: 100 XP, Loss: 30 XP
        return (data as { isWinner: boolean }).isWinner ? 100 : 30;
      case 'voice':
        return 20;
      case 'daily':
        return 50;
      default:
        return 10;
    }
  },

  checkTestAchievements: (attempt: TestAttempt, currentBadges: Badge[]): string[] => {
    const newBadgeIds: string[] = [];
    const existingIds = new Set(currentBadges.map(b => b.id));

    // First Step
    if (!existingIds.has('first-test')) {
      newBadgeIds.push('first-test');
    }

    // Perfectionist
    if (attempt.percentage === 100 && !existingIds.has('perfect-score')) {
      newBadgeIds.push('perfect-score');
    }

    // Speed Demon
    if (!existingIds.has('speed-demon') && attempt.timeTaken < 30) { // arbitrary under 30s
       newBadgeIds.push('speed-demon');
    }

    return newBadgeIds;
  },

  checkBattleAchievements: (isWinner: boolean, totalWins: number, currentBadges: Badge[]): string[] => {
    const newBadgeIds: string[] = [];
    const existingIds = new Set(currentBadges.map(b => b.id));

    if (isWinner) {
      if (!existingIds.has('battle-winner')) {
        newBadgeIds.push('battle-winner');
      }
      if (totalWins >= 10 && !existingIds.has('battle-master')) {
        newBadgeIds.push('battle-master');
      }
      if (totalWins >= 20 && !existingIds.has('battle-king')) {
        newBadgeIds.push('battle-king');
      }
    }

    return newBadgeIds;
  },

  checkTimeBasedAchievements: (currentBadges: Badge[]): string[] => {
    const newBadgeIds: string[] = [];
    const existingIds = new Set(currentBadges.map(b => b.id));
    const hour = new Date().getHours();

    if (hour < 6 && !existingIds.has('early-bird')) {
      newBadgeIds.push('early-bird');
    }

    if (hour >= 22 && !existingIds.has('night-owl')) {
      newBadgeIds.push('night-owl');
    }

    return newBadgeIds;
  },

  unlockBadge: async (studentId: string, badgeId: string): Promise<boolean> => {
    const badge = BADGES[badgeId];
    if (!badge) return false;
    const result = await gamificationDB.addBadge(studentId, badge);
    return !!result;
  }
};
