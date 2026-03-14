import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';

const quotes = [
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.", author: "Abigail Adams" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Your attitude, not your aptitude, will determine your altitude.", author: "Zig Ziglar" },
];

const DailyQuote = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Set random quote on mount
    setCurrentQuoteIndex(Math.floor(Math.random() * quotes.length));
  }, []);

  const refreshQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Quote className="w-5 h-5 text-white/80" />
          <h3 className="font-semibold text-white/90">Daily Motivation</h3>
        </div>
        <button
          onClick={refreshQuote}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          disabled={isAnimating}
        >
          <RefreshCw className={`w-4 h-4 text-white/80 ${isAnimating ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm italic text-white/90 mb-2 leading-relaxed">
            "{quotes[currentQuoteIndex].text}"
          </p>
          <p className="text-xs text-white/70 text-right">
            — {quotes[currentQuoteIndex].author}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DailyQuote;
