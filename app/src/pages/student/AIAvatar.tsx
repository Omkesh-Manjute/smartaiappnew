import { motion, AnimatePresence } from 'framer-motion';
import idleImg from '../../assets/avatar/idle.jpg';
import thinkingImg from '../../assets/avatar/thinking.jpg';
import talkingImg from '../../assets/avatar/talking.png';
import wavingImg from '../../assets/avatar/waving.jpg';
import wavingBigImg from '../../assets/avatar/waving_big.jpg';

export type AvatarState = 'idle' | 'thinking' | 'talking' | 'waving';

interface AIAvatarProps {
  state: AvatarState;
  className?: string;
}

const AIAvatar = ({ state, className = '' }: AIAvatarProps) => {
  const images = {
    idle: idleImg,
    thinking: thinkingImg,
    talking: talkingImg,
    waving: wavingImg,
    waving_big: wavingBigImg,
  };

  return (
    <div className={`relative w-32 h-32 md:w-40 md:h-40 mx-auto ${className}`}>
      {/* Floating animation for the whole container */}
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-full h-full"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={state}
            src={state === 'waving' ? images.waving : images[state as keyof typeof images]}
            alt={`AI Tutor ${state}`}
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotate: 5 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </AnimatePresence>

        {/* Thinking Bubbles - Only show when thinking */}
        {state === 'thinking' && (
          <div className="absolute -top-4 -right-4 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-purple-400 rounded-full"
              />
            ))}
          </div>
        )}

        {/* Talking Waves - Only show when talking */}
        {state === 'talking' && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{
                  height: [4, 12, 4],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
                className="w-1 bg-pink-500 rounded-full"
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Shadow under the avatar */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.1, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-[100%] blur-md"
      />
    </div>
  );
};

export default AIAvatar;
