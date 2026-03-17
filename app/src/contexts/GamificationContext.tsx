import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { gamificationDB, battleDB } from '@/services/supabaseDB';
import { GamificationService } from '@/services/GamificationService';
import type { GamificationData, TestAttempt, Battle } from '@/types';
import { BADGES } from '@/types';
import AchievementNotification from '@/components/gamification/AchievementNotification';

interface GamificationContextType {
  gamification: GamificationData | null;
  isLoading: boolean;
  addXP: (amount: number) => Promise<void>;
  checkAchievements: (type: 'test' | 'battle' | 'study', data?: any) => Promise<void>;
  refreshGamification: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Achievement Notification State
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'badge' | 'level' | 'streak';
    title: string;
    message: string;
    icon: string;
  }>({
    isOpen: false,
    type: 'badge',
    title: '',
    message: '',
    icon: '',
  });

  useEffect(() => {
    if (user?.role === 'student') {
      loadGamification();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadGamification = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await gamificationDB.getByStudent(user.id);
      setGamification(data);
    } catch (error) {
      console.error('Error loading gamification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addXP = async (amount: number) => {
    if (!user || !gamification) return;
    try {
      const updated = await gamificationDB.addXP(user.id, amount);
      if (updated) {
        if (updated.level > gamification.level) {
          showAchievement('level', `Level ${updated.level}!`, 'You reached a new level!', '⭐');
        }
        setGamification(updated);
      }
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const showAchievement = (type: 'badge' | 'level' | 'streak', title: string, message: string, icon: string) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      icon,
    });
  };

  const checkAchievements = async (type: 'test' | 'battle' | 'study', data?: any) => {
    if (!user || !gamification) return;

    let newBadgeIds: string[] = [];

    if (type === 'test') {
      newBadgeIds = GamificationService.checkTestAchievements(data as TestAttempt, gamification.badges);
      const xp = GamificationService.calculateXP('test', data);
      await addXP(xp);
    } else if (type === 'battle') {
      const battles = await battleDB.getByPlayer(user.id);
      const wins = battles.filter(b => b.winnerId === user.id).length;
      const isWinner = (data as Battle).winnerId === user.id;
      newBadgeIds = GamificationService.checkBattleAchievements(isWinner, wins, gamification.badges);
      const xp = GamificationService.calculateXP('battle', { isWinner });
      await addXP(xp);
    } else if (type === 'study') {
      newBadgeIds = GamificationService.checkTimeBasedAchievements(gamification.badges);
      await addXP(20);
    }

    if (newBadgeIds.length > 0) {
      for (const badgeId of newBadgeIds) {
        const success = await GamificationService.unlockBadge(user.id, badgeId);
        if (success) {
          const badge = BADGES[badgeId];
          showAchievement('badge', badge.name, badge.description, badge.icon);
        }
      }
      await loadGamification(); // Refresh to get updated badges
    }
  };

  return (
    <GamificationContext.Provider value={{ 
      gamification, 
      isLoading, 
      addXP, 
      checkAchievements,
      refreshGamification: loadGamification 
    }}>
      {children}
      <AchievementNotification
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        icon={notification.icon}
      />
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
