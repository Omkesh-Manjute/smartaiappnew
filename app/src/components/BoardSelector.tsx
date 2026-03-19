import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react';
import type { Board } from '@/types';

interface BoardSelectorProps {
  selectedBoard?: Board;
  onSelect: (board: Board) => void;
}

const boards: { id: Board; name: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    id: 'CBSE',
    name: 'CBSE Board',
    description: 'Central Board of Secondary Education curriculum',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'STATE',
    name: 'Maharashtra State',
    description: 'Maharashtra State Board of Secondary Education',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'from-orange-500 to-red-600',
  },
];

export const BoardSelector: React.FC<BoardSelectorProps> = ({ selectedBoard, onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto p-4">
      {boards.map((board) => (
        <motion.button
          key={board.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(board.id)}
          className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 border-2 ${
            selectedBoard === board.id
              ? 'border-indigo-500 bg-white shadow-xl ring-2 ring-indigo-500/20'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
          }`}
        >
          {selectedBoard === board.id && (
            <div className="absolute top-4 right-4 text-indigo-500">
              <CheckCircle2 className="w-6 h-6 fill-indigo-50" />
            </div>
          )}

          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${board.color} text-white mb-4 shadow-lg`}>
            {board.icon}
          </div>

          <h3 className={`text-xl font-bold mb-2 ${selectedBoard === board.id ? 'text-indigo-900' : 'text-slate-900'}`}>
            {board.name}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {board.description}
          </p>

          <div className={`mt-6 inline-flex items-center text-sm font-semibold ${
            selectedBoard === board.id ? 'text-indigo-600' : 'text-slate-500'
          }`}>
            {selectedBoard === board.id ? 'Selected Board' : 'Select this Board'}
            <motion.span
              animate={{ x: selectedBoard === board.id ? 5 : 0 }}
              className="ml-2"
            >
              →
            </motion.span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};
