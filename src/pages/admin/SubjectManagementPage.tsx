import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { subjectDB } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Plus,
  Layers,
  Trash2,
} from 'lucide-react';
import type { Subject } from '@/types';

const SubjectManagementPage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    description: '',
    icon: '📚',
    color: 'bg-blue-500',
    grade: 10,
  });

  useEffect(() => {
    setSubjects(subjectDB.getAll());
  }, []);

  const addSubject = () => {
    if (!newSubject.name) {
      toast.error('Subject name is required');
      return;
    }

    const subject: Subject = {
      id: `subject_${Date.now()}`,
      name: newSubject.name,
      description: newSubject.description,
      icon: newSubject.icon,
      color: newSubject.color,
      grade: newSubject.grade,
      chapters: [],
    };

    subjectDB.create(subject);
    setSubjects([...subjects, subject]);
    setShowAddForm(false);
    setNewSubject({ name: '', description: '', icon: '📚', color: 'bg-blue-500', grade: 10 });
    toast.success('Subject added!');
  };

  const deleteSubject = (id: string) => {
    subjectDB.delete(id);
    setSubjects(subjects.filter((s) => s.id !== id));
    toast.success('Subject deleted');
  };

  const colorOptions = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  const iconOptions = ['📚', '🔢', '🔬', '🧪', '📖', '🌍', '➗', '🎨', '🎵', '💻'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">Subject Management</h1>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Name</label>
                      <Input
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                        placeholder="Subject name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Grade</label>
                      <Input
                        type="number"
                        value={newSubject.grade}
                        onChange={(e) => setNewSubject({ ...newSubject, grade: parseInt(e.target.value) })}
                        min={1}
                        max={12}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Input
                      value={newSubject.description}
                      onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Icon</label>
                    <div className="flex flex-wrap gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setNewSubject({ ...newSubject, icon })}
                          className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 ${
                            newSubject.icon === icon ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewSubject({ ...newSubject, color })}
                          className={`w-10 h-10 rounded-lg ${color} ${
                            newSubject.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={addSubject} className="flex-1">
                      Add Subject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-xl ${subject.color} flex items-center justify-center text-3xl`}>
                      {subject.icon}
                    </div>
                    <button
                      onClick={() => deleteSubject(subject.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-lg mt-3">{subject.name}</h3>
                  <p className="text-sm text-gray-500">{subject.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline">Grade {subject.grade}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {subject.chapters.length} chapters
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SubjectManagementPage;
