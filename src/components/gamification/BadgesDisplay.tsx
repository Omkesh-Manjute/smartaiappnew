import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';
import type { GamificationData } from '@/types';

interface BadgesDisplayProps {
  gamification: GamificationData;
}

const defaultBadges = [
  { id: 'first_test', name: 'First Steps', description: 'Complete your first test', icon: '🎯', color: 'bg-blue-500' },
  { id: 'perfect_score', name: 'Perfectionist', description: 'Score 100% on any test', icon: '💯', color: 'bg-green-500' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', color: 'bg-orange-500' },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '📅', color: 'bg-purple-500' },
  { id: 'battle_winner', name: 'Battle Champion', description: 'Win 5 battles', icon: '⚔️', color: 'bg-red-500' },
  { id: 'voice_master', name: 'Voice Pro', description: 'Complete 10 voice practices', icon: '🎤', color: 'bg-pink-500' },
  { id: 'night_owl', name: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', color: 'bg-indigo-500' },
  { id: 'early_bird', name: 'Early Bird', description: 'Study before 6 AM', icon: '🌅', color: 'bg-yellow-500' },
];

const BadgesDisplay = ({ gamification }: BadgesDisplayProps) => {
  const unlockedBadgeIds = gamification.badges.map(b => b.id);

  return (
    <div className="bg-white rounded-xl p-4 border">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold">Badges & Achievements</h3>
        <span className="ml-auto text-sm text-gray-500">
          {unlockedBadgeIds.length} / {defaultBadges.length}
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {defaultBadges.map((badge, index) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative group cursor-pointer ${isUnlocked ? '' : 'opacity-50'}`}
              title={`${badge.name}: ${badge.description}`}
            >
              <div className={`w-full aspect-square rounded-xl ${isUnlocked ? badge.color : 'bg-gray-200'} flex items-center justify-center text-2xl transition-transform group-hover:scale-105`}>
                {isUnlocked ? badge.icon : <Lock className="w-5 h-5 text-gray-400" />}
              </div>
              {isUnlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesDisplay;
