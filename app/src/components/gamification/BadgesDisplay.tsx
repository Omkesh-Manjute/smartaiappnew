import { motion } from 'framer-motion';
import { Award, Lock, Sparkles } from 'lucide-react';
import type { GamificationData, Badge } from '@/types';
import { BADGES } from '@/types';

interface BadgesDisplayProps {
  gamification: GamificationData;
}

const BadgesDisplay = ({ gamification }: BadgesDisplayProps) => {
  const unlockedBadgeIds = gamification.badges.map(b => b.id);
  
  // Show all potential badges from BADGES constant
  const allBadges = Object.values(BADGES);

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-slate-400';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-600';
      case 'legendary': return 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 ring-2 ring-amber-200';
      default: return 'bg-gray-400';
    }
  };

  const getRarityGlow = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'epic': return 'shadow-[0_0_15px_-3px_rgba(147,51,234,0.5)]';
      case 'legendary': return 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.6)]';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Award className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
            <p className="text-xs text-gray-500">Unlock badges as you learn</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
          {unlockedBadgeIds.length} / {allBadges.length}
        </div>
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 gap-4 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
        {allBadges.map((badge, index) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(index * 0.05, 1) }}
              className="relative group flex flex-col items-center gap-2"
            >
              <div className={`
                relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300
                ${isUnlocked ? `${getRarityColor(badge.rarity)} ${getRarityGlow(badge.rarity)}` : 'bg-gray-100 grayscale'}
                group-hover:scale-110 group-hover:rotate-3 cursor-help
              `}>
                {isUnlocked ? (
                  <>
                    <span className="relative z-10">{badge.icon}</span>
                    {badge.rarity === 'legendary' && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-2xl opacity-40"
                        style={{ background: 'conic-gradient(from 0deg, transparent, white, transparent)' }}
                      />
                    )}
                  </>
                ) : (
                  <Lock className="w-6 h-6 text-gray-400" />
                )}
                
                {/* Tooltip hint */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-[10px] rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                  <div className="font-bold">{badge.name}</div>
                  <div className="text-gray-300">{badge.description}</div>
                  {!isUnlocked && <div className="mt-1 text-amber-400 font-bold uppercase tracking-tighter">Locked</div>}
                </div>
              </div>

              {isUnlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <div className="bg-green-500 rounded-full p-0.5 shadow-sm border-2 border-white">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {!gamification.badges.length && (
        <div className="mt-auto pt-4 text-center">
          <p className="text-xs text-gray-400 italic">Start your first test to earn your first badge!</p>
        </div>
      )}
    </div>
  );
};

export default BadgesDisplay;
