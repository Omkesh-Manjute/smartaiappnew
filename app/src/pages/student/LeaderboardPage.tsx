import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { gamificationDB, userDB } from '@/services/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChevronLeft,
  Trophy,
  Crown,
  Medal,
  Flame,
  Star,
  Target,
  Users,
} from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  badges: number;
  streak: number;
  rank: number;
}

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const allGamification = gamificationDB.getAll();
    const allUsers = userDB.getAll().filter((u) => u.role === 'student');

    const leaderboardData: LeaderboardEntry[] = allUsers
      .map((u) => {
        const gamification = allGamification.find((g) => g.studentId === u.id);
        return {
          userId: u.id,
          name: u.name,
          avatar: u.avatar || '',
          xp: gamification?.xp || 0,
          level: gamification?.level || 1,
          badges: gamification?.badges.length || 0,
          streak: gamification?.streak || 0,
          rank: 0,
        };
      })
      .sort((a, b) => b.xp - a.xp)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    setEntries(leaderboardData);
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const currentUserEntry = entries.find((e) => e.userId === user?.id);
  const topThree = entries.slice(0, 3);
  const restEntries = entries.slice(3);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-xl font-bold">Leaderboard</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Podium */}
        <div className="mb-8">
          <div className="flex justify-center items-end gap-4 h-48">
            {topThree.map((entry, index) => {
              const rank = index + 1;
              const height = rank === 1 ? 'h-32' : rank === 2 ? 'h-24' : 'h-20';
              const order = rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3';
              
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col items-center ${order}`}
                >
                  <div className="relative mb-2">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback>{entry.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                      rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-600'
                    }`}>
                      {rank}
                    </div>
                  </div>
                  <p className="font-semibold text-sm text-center max-w-[100px] truncate">{entry.name}</p>
                  <p className="text-xs text-gray-500">{entry.xp.toLocaleString()} XP</p>
                  <div className={`w-24 ${height} mt-2 rounded-t-lg ${
                    rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-300' : 'bg-amber-500'
                  }`} />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-xs text-gray-500">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{entries.reduce((acc, e) => acc + e.xp, 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total XP</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{Math.max(...entries.map((e) => e.streak))}</p>
              <p className="text-xs text-gray-500">Best Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{entries.reduce((acc, e) => acc + e.badges, 0)}</p>
              <p className="text-xs text-gray-500">Badges Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Your Rank */}
        {currentUserEntry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-blue-600">#{currentUserEntry.rank}</div>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={currentUserEntry.avatar} />
                    <AvatarFallback>{currentUserEntry.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">You</p>
                    <div className="flex gap-3 text-sm text-gray-500">
                      <span>Level {currentUserEntry.level}</span>
                      <span>{currentUserEntry.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Next Rank</p>
                    <p className="font-semibold">
                      {entries[currentUserEntry.rank - 2]
                        ? `${(entries[currentUserEntry.rank - 2].xp - currentUserEntry.xp).toLocaleString()} XP needed`
                        : 'Top of the leaderboard!'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>All Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {restEntries.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    entry.userId === user?.id ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="w-10 flex justify-center">{getRankIcon(entry.rank)}</div>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback>{entry.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className={`font-semibold ${entry.userId === user?.id ? 'text-blue-700' : ''}`}>
                      {entry.name} {entry.userId === user?.id && '(You)'}
                    </p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        Level {entry.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {entry.badges} badges
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {entry.streak} streak
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.xp.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LeaderboardPage;
