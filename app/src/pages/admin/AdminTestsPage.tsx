import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { testDB, subjectDB, userDB } from '@/services/supabaseDB';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Search,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Users,
  Clock,
  Filter,
} from 'lucide-react';
import type { Test, Subject, User } from '@/types';

const AdminTestsPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [testData, subjectData, userData] = await Promise.all([
        testDB.getAll(),
        subjectDB.getAll(),
        userDB.getAll(),
      ]);
      setTests(testData);
      setSubjects(subjectData);
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load tests:', error);
      toast.error('Could not load tests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) return;
    
    try {
      const success = await testDB.delete(id);
      if (success) {
        setTests(prev => prev.filter(t => t.id !== id));
        toast.success('Test deleted successfully');
      } else {
        toast.error('Failed to delete test');
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error('An error occurred while deleting the test');
    }
  };

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'all' || test.subjectId === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [tests, searchQuery, selectedSubject]);

  const getSubjectName = (id: string) => {
    return subjects.find(s => s.id === id)?.name || 'Unknown Subject';
  };

  const getAuthorName = (id: string) => {
    return users.find(u => u.id === id)?.name || 'Unknown Author';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Global Test Management</h1>
            </div>
            <Button onClick={() => navigate('/teacher/create-test')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests by title..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="h-10 px-3 pr-8 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tests List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Tests ({filteredTests.length})</CardTitle>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Admin Access
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredTests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTests.map((test) => (
                  <motion.div
                    key={test.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 border rounded-2xl hover:shadow-lg transition-all bg-white relative group"
                  >
                    <div className="flex flex-col h-full">
                      <div className="mb-3">
                        <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                          {getSubjectName(test.subjectId)}
                        </Badge>
                        <h3 className="font-bold text-lg leading-tight line-clamp-2">{test.title}</h3>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Author: {getAuthorName(test.createdBy)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{test.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{test.questions.length} Questions</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center gap-2 pt-3 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100"
                          onClick={() => navigate(`/admin/edit-test/${test.id}`)}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                          onClick={() => handleDeleteTest(test.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No tests found</p>
                <p className="text-sm">Try adjusting your search or filter</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminTestsPage;
