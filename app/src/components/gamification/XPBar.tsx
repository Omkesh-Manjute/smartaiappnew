import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { GamificationData } from '@/types';

interface XPBarProps {
  gamification: GamificationData;
}

const XPBar = ({ gamification }: XPBarProps) => {
  const xpForNextLevel = gamification.level * 1000;
  const xpInCurrentLevel = gamification.xp % 1000;
  const progressPercentage = (xpInCurrentLevel / 1000) * 100;

  return (
    <div className="bg-white rounded-xl p-4 border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-lg">Level {gamification.level}</p>
            <p className="text-xs text-gray-500">{gamification.xp} XP Total</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          <Zap className="w-4 h-4" />
          <span className="font-bold">{gamification.coins}</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Progress to Level {gamification.level + 1}</span>
          <span className="font-medium">{xpInCurrentLevel} / {xpForNextLevel} XP</span>
        </div>
        <div className="relative">
          <Progress value={progressPercentage} className="h-3" />
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default XPBar;
