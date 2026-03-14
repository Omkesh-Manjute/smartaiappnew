import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AchievementNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'badge' | 'level' | 'streak';
  title: string;
  message: string;
  icon: string;
}

const AchievementNotification = ({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  message, 
  icon 
}: AchievementNotificationProps) => {
  const getIcon = () => {
    switch (type) {
      case 'badge':
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 'level':
        return <Star className="w-8 h-8 text-purple-500" />;
      case 'streak':
        return <Zap className="w-8 h-8 text-orange-500" />;
      default:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'badge':
        return 'from-yellow-400 to-orange-500';
      case 'level':
        return 'from-purple-400 to-pink-500';
      case 'streak':
        return 'from-orange-400 to-red-500';
      default:
        return 'from-blue-400 to-purple-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl pointer-events-auto">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
              
              <div className="text-center">
                {/* Animated Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                  className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getGradient()} flex items-center justify-center`}
                >
                  <span className="text-4xl">{icon || getIcon()}</span>
                </motion.div>
                
                {/* Confetti effect placeholder */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                      animate={{ 
                        opacity: 0, 
                        x: Math.cos(i * 30 * Math.PI / 180) * 100,
                        y: Math.sin(i * 30 * Math.PI / 180) * 100,
                        scale: 1
                      }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="absolute left-1/2 top-1/3 w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3'][i % 4]
                      }}
                    />
                  ))}
                </div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold mb-2"
                >
                  {title || 'Achievement Unlocked!'}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 mb-6"
                >
                  {message || 'Congratulations on your achievement!'}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={onClose}
                    className={`w-full bg-gradient-to-r ${getGradient()} text-white`}
                  >
                    Awesome!
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AchievementNotification;
