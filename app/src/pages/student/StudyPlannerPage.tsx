import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { studyPlanDB, subjectDB } from '@/services/supabaseDB';
import { useGamification } from '@/contexts/GamificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Calendar,
  Clock,
  BookOpen,
  Target,
  Plus,
  CheckCircle,
  Trash2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { StudyPlan, Subject, StudyTask } from '@/types';

const StudyPlannerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addXP } = useGamification();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    duration: 7,
    subjects: [] as string[],
  });

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const [studentPlans, allSubjects] = await Promise.all([
          studyPlanDB.getByStudent(user.id),
          subjectDB.getAll(),
        ]);
        setPlans(studentPlans);
        setSubjects(allSubjects);
      } catch (error) {
        console.error('Failed to load study planner data:', error);
        toast.error('Failed to load study planner data');
      }
    };
    void loadData();
  }, [user]);

  const generateStudyPlan = async () => {
    if (!user) return;

    const selectedSubjects = subjects.filter((s) => newPlan.subjects.includes(s.id));
    const dailyGoals = [];

    for (let i = 0; i < newPlan.duration; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      const tasks: StudyTask[] = [];
      selectedSubjects.forEach((subject, idx) => {
        const chapter = subject.chapters[i % subject.chapters.length];
        if (chapter) {
          tasks.push({
            id: `task_${i}_${idx}`,
            title: `Study ${typeof chapter.name === 'string' ? chapter.name : (chapter.name.CBSE || 'Unknown')}`,
            description: `Complete chapter content and practice MCQs`,
            subjectId: subject.id,
            chapterId: chapter.id,
            duration: 30,
            completed: false,
            type: i % 3 === 0 ? 'read' : i % 3 === 1 ? 'practice' : 'review',
          });
        }
      });

      dailyGoals.push({
        date,
        tasks,
        completed: false,
      });
    }

    const plan: StudyPlan = {
      id: `plan_${Date.now()}`,
      studentId: user.id,
      title: newPlan.title,
      description: newPlan.description,
      startDate: new Date(),
      endDate: new Date(Date.now() + newPlan.duration * 24 * 60 * 60 * 1000),
      dailyGoals,
      subjects: newPlan.subjects,
      totalHours: dailyGoals.reduce((acc, day) => acc + day.tasks.reduce((t, task) => t + task.duration, 0), 0) / 60,
      createdAt: new Date(),
      isActive: true,
    };

    try {
      await studyPlanDB.create(plan);
      setPlans((prev) => [...prev, plan]);
      setShowCreateForm(false);
      setNewPlan({ title: '', description: '', duration: 7, subjects: [] });
      toast.success('Study plan created!');
    } catch (error) {
      console.error('Failed to create study plan:', error);
      toast.error('Could not create study plan');
    }
  };

  const toggleTask = async (planId: string, dayIndex: number, taskId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const updatedGoals = [...plan.dailyGoals];
    const task = updatedGoals[dayIndex].tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      updatedGoals[dayIndex].completed = updatedGoals[dayIndex].tasks.every((t) => t.completed);

      const updatedPlan = { ...plan, dailyGoals: updatedGoals };
      try {
        await studyPlanDB.update(planId, updatedPlan);
        setPlans((prev) => prev.map((p) => (p.id === planId ? updatedPlan : p)));

        if (task.completed) {
          await addXP(10);
          toast.success('+10 XP for completing a task!');
        }
      } catch (error) {
        console.error('Failed to update task state:', error);
        toast.error('Could not update task status');
      }
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      await studyPlanDB.delete(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      toast.success('Study plan deleted');
    } catch (error) {
      console.error('Failed to delete plan:', error);
      toast.error('Could not delete study plan');
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'read':
        return <BookOpen className="w-4 h-4" />;
      case 'practice':
        return <Target className="w-4 h-4" />;
      case 'review':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Calendar className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold">Study Planner</span>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Create AI Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Plan Title</label>
                    <Input
                      value={newPlan.title}
                      onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                      placeholder="e.g., Math Revision Plan"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Input
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                      placeholder="Brief description of your goals"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Duration (days)</label>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={newPlan.duration}
                      onChange={(e) => setNewPlan({ ...newPlan, duration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Subjects</label>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((subject) => (
                        <button
                          key={subject.id}
                          onClick={() => {
                            const updated = newPlan.subjects.includes(subject.id)
                              ? newPlan.subjects.filter((id) => id !== subject.id)
                              : [...newPlan.subjects, subject.id];
                            setNewPlan({ ...newPlan, subjects: updated });
                          }}
                          className={`px-4 py-2 rounded-full text-sm transition-colors ${
                            newPlan.subjects.includes(subject.id)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {subject.icon} {typeof subject.name === 'string' ? subject.name : (subject.name.CBSE || 'Unknown')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={generateStudyPlan}
                      disabled={!newPlan.title || newPlan.subjects.length === 0}
                      className="flex-1"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">No Study Plans Yet</h3>
            <p className="text-gray-500 mb-4">Create a personalized study plan to stay organized</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{plan.title}</CardTitle>
                      <p className="text-sm text-gray-500">{plan.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {plan.totalHours}h total
                      </Badge>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plan.dailyGoals.map((day, dayIndex) => (
                        <div key={dayIndex} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">
                              Day {dayIndex + 1} - {new Date(day.date).toLocaleDateString()}
                            </h4>
                            {day.completed && (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2">
                            {day.tasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                              >
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={() => toggleTask(plan.id, dayIndex, task.id)}
                                />
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100'
                                }`}>
                                  {getTaskTypeIcon(task.type)}
                                </div>
                                <div className="flex-1">
                                  <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                    {task.title}
                                  </p>
                                  <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                    <span>{task.duration} mins</span>
                                    <span>
                                      {(() => {
                                        const subject = subjects.find((s) => String(s.id) === String(task.subjectId));
                                        if (!subject) return 'Unknown Subject';
                                        return typeof subject.name === 'string' ? subject.name : (subject.name.CBSE || 'Unknown');
                                      })()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyPlannerPage;
