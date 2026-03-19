import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { testDB, subjectDB } from '@/services/supabaseDB';
import { subjectDB as localSubjectDB } from '@/services/database';
import { generateTestQuestions, generateTestQuestionsFromPrompt } from '@/services/geminiAPI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Target,
  CheckCircle,
  Sparkles,
  Loader2,
  Edit2,
  Wand2,
} from 'lucide-react';
import type { TestQuestion, Subject } from '@/types';

const CreateTestPage = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    subjectId: '',
    chapterId: '',
    topic: '',
    duration: 30,
    passingMarks: 50,
    difficulty: 'mixed' as 'easy' | 'medium' | 'hard' | 'mixed',
    numQuestions: 10,
  });
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<TestQuestion>({
    id: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 10,
    difficulty: 'medium',
  });

  useEffect(() => {
    loadSubjects();
    if (testId) {
      loadTestData();
    }
  }, [testId]);

  const loadTestData = async () => {
    if (!testId) return;
    try {
      const test = await testDB.getById(testId);
      if (test) {
        setTestData({
          title: test.title,
          description: test.description,
          subjectId: test.subjectId,
          chapterId: test.chapterIds?.[0] || '',
          topic: '', // Topic is used for AI generation, not stored directly
          duration: test.duration,
          passingMarks: Math.round((test.passingMarks / test.totalMarks) * 100),
          difficulty: 'mixed',
          numQuestions: test.questions.length,
        });
        setQuestions(test.questions);
      }
    } catch (error) {
      console.error('Error loading test data:', error);
      toast.error('Failed to load test data');
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await subjectDB.getAll();
      setSubjects(
        data.map((subject) => ({
          ...subject,
          id: String(subject.id),
          chapters: (subject.chapters || []).map((chapter) => ({
            ...chapter,
            id: String(chapter.id),
            subjectId: String(chapter.subjectId),
          })),
        }))
      );
    } catch (error) {
      console.warn('Falling back to local subjects for Create Test:', error);
      setSubjects(localSubjectDB.getAll());
      toast.error('Could not load cloud subjects. Using local subject list.');
    }
  };

  const selectedSubject = subjects.find((s) => String(s.id) === String(testData.subjectId));
  const selectedChapter = selectedSubject?.chapters.find((c) => String(c.id) === String(testData.chapterId));

  const generateQuestionsWithAI = async () => {
    if (!testData.subjectId) {
      toast.error('Please select a subject first');
      return;
    }

    const trimmedPrompt = aiPrompt.trim();
    const trimmedTopic = testData.topic.trim();
    if (!trimmedPrompt && !trimmedTopic) {
      toast.error('Please enter either AI prompt or topic');
      return;
    }

    setIsGenerating(true);
    try {
      const chapterName = selectedChapter
        ? (typeof selectedChapter.name === 'string' ? selectedChapter.name : (selectedChapter.name[user?.board || 'CBSE'] || selectedChapter.name.CBSE))
        : undefined;

      const generatedQuestions = trimmedPrompt
        ? await generateTestQuestionsFromPrompt({
            subject: selectedSubject?.name || '',
            chapter: chapterName,
            prompt: trimmedPrompt,
            numQuestions: testData.numQuestions,
            difficulty: testData.difficulty,
          })
        : await generateTestQuestions({
            subject: selectedSubject?.name || '',
            chapter: chapterName || '',
            topic: trimmedTopic,
            numQuestions: testData.numQuestions,
            difficulty: testData.difficulty,
          });

      const formattedQuestions: TestQuestion[] = generatedQuestions.map((q, index) => ({
        id: `q_${Date.now()}_${index}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: 10,
        difficulty: q.difficulty,
      }));

      setQuestions(formattedQuestions);
      toast.success(`Generated ${formattedQuestions.length} questions!`);
      setShowAIGenerator(false);
      if (trimmedPrompt && !testData.topic.trim()) {
        setTestData((prev) => ({ ...prev, topic: trimmedPrompt }));
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question || currentQuestion.options.some((o) => !o)) {
      toast.error('Please fill in all fields');
      return;
    }

    setQuestions([...questions, { ...currentQuestion, id: `q_${Date.now()}` }]);
    setCurrentQuestion({
      id: '',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 10,
      difficulty: 'medium',
    });
    toast.success('Question added!');
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    toast.success('Question removed');
  };

  const saveTest = async () => {
    if (!user) return;

    const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0);

    const test = {
      id: testId || `test_${Date.now()}`,
      title: testData.title,
      description: testData.description,
      subjectId: testData.subjectId,
      chapterIds: testData.chapterId ? [testData.chapterId] : [],
      questions,
      duration: testData.duration,
      totalMarks,
      passingMarks: Math.round((testData.passingMarks / 100) * totalMarks),
      createdBy: user.id,
      createdAt: new Date(),
      isActive: true,
    };

    if (testId) {
      await testDB.update(testId, test);
      toast.success('Test updated successfully!');
    } else {
      await testDB.create(test);
      toast.success('Test created successfully!');
    }
    
    // Redirect based on user role or previous page
    if (user.role === 'admin') {
      navigate('/admin/tests');
    } else {
      navigate('/teacher/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button 
              onClick={() => user?.role === 'admin' ? navigate('/admin/tests') : navigate('/teacher/dashboard')} 
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{testId ? 'Edit Test' : 'Create New Test'}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className={`flex-1 h-1 ${step >= 2 ? 'bg-green-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
            <Target className="w-4 h-4" />
          </div>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Test Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Test Title</Label>
                  <Input
                    value={testData.title}
                    onChange={(e) => setTestData({ ...testData, title: e.target.value })}
                    placeholder="e.g., Mathematics Mid-Term"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={testData.description}
                    onChange={(e) => setTestData({ ...testData, description: e.target.value })}
                    placeholder="Brief description of the test"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Subject</Label>
                    <Select
                      value={testData.subjectId}
                      onValueChange={(value) => setTestData({ ...testData, subjectId: value, chapterId: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={String(s.id)} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Chapter (Optional)</Label>
                    <Select
                      value={testData.chapterId}
                      onValueChange={(value) => setTestData({ ...testData, chapterId: value })}
                      disabled={!selectedSubject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedSubject?.chapters.map((c) => (
                          <SelectItem key={String(c.id)} value={String(c.id)}>
                            {typeof c.name === 'string' ? c.name : (c.name[user?.board || 'CBSE'] || c.name.CBSE)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={testData.duration}
                      onChange={(e) => setTestData({ ...testData, duration: parseInt(e.target.value) })}
                      min={5}
                      max={180}
                    />
                  </div>
                  <div>
                    <Label>Passing %</Label>
                    <Input
                      type="number"
                      value={testData.passingMarks}
                      onChange={(e) => setTestData({ ...testData, passingMarks: parseInt(e.target.value) })}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <Label>Questions</Label>
                    <Input
                      type="number"
                      value={testData.numQuestions}
                      onChange={(e) => setTestData({ ...testData, numQuestions: parseInt(e.target.value) })}
                      min={1}
                      max={50}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!testData.title || !testData.subjectId}
                  className="w-full"
                >
                  Next: Add Questions
                  <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* AI Generator Button */}
            <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-dashed border-2">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                  Generate Questions with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-500" />
                    AI Question Generator
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Teacher Prompt (Recommended)</Label>
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder='e.g., "Chapter 1 ka test bana do with 10 MCQs and medium difficulty"'
                    />
                  </div>
                  <div>
                    <Label>Topic/Concept (Optional)</Label>
                    <Input
                      value={testData.topic}
                      onChange={(e) => setTestData({ ...testData, topic: e.target.value })}
                      placeholder="e.g., Quadratic Equations, Photosynthesis"
                    />
                  </div>
                  <div>
                    <Label>Difficulty Level</Label>
                    <Select
                      value={testData.difficulty}
                      onValueChange={(value: any) => setTestData({ ...testData, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Number of Questions</Label>
                    <Input
                      type="number"
                      value={testData.numQuestions}
                      onChange={(e) => setTestData({ ...testData, numQuestions: parseInt(e.target.value) })}
                      min={1}
                      max={50}
                    />
                  </div>
                  <Button 
                    onClick={generateQuestionsWithAI} 
                    disabled={isGenerating || (!aiPrompt.trim() && !testData.topic.trim())}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Questions
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Question Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add Question Manually ({questions.length} added)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Question</Label>
                  <Input
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                    placeholder="Enter your question"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Options</Label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct"
                        checked={currentQuestion.correctAnswer === index}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                        className="w-4 h-4"
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index] = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      value={currentQuestion.marks}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) })}
                      min={1}
                    />
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select
                      value={currentQuestion.difficulty}
                      onValueChange={(value: any) => setCurrentQuestion({ ...currentQuestion, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addQuestion} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>

            {/* Questions List with Edit */}
            {questions.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Questions Preview ({questions.length})</CardTitle>
                  <Badge variant="outline">Editable</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {questions.map((q, index) => (
                      <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                        {editingQuestionIndex === index ? (
                          <div className="space-y-3">
                            <Input
                              value={q.question}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[index] = { ...q, question: e.target.value };
                                setQuestions(updated);
                              }}
                              className="font-medium"
                            />
                            <div className="space-y-2">
                              {q.options.map((opt, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={q.correctAnswer === optIndex}
                                    onChange={() => {
                                      const updated = [...questions];
                                      updated[index] = { ...q, correctAnswer: optIndex };
                                      setQuestions(updated);
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <Input
                                    value={opt}
                                    onChange={(e) => {
                                      const newOptions = [...q.options];
                                      newOptions[optIndex] = e.target.value;
                                      const updated = [...questions];
                                      updated[index] = { ...q, options: newOptions };
                                      setQuestions(updated);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => setEditingQuestionIndex(null)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Done
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{index + 1}. {q.question}</p>
                              <div className="mt-2 space-y-1">
                                {q.options.map((opt, optIndex) => (
                                  <p 
                                    key={optIndex} 
                                    className={`text-sm ${optIndex === q.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}
                                  >
                                    {String.fromCharCode(65 + optIndex)}. {opt}
                                    {optIndex === q.correctAnswer && ' ✓'}
                                  </p>
                                ))}
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">{q.marks} marks</Badge>
                                <Badge variant="outline" className={
                                  q.difficulty === 'easy' ? 'text-green-600' :
                                  q.difficulty === 'hard' ? 'text-red-600' : 'text-yellow-600'
                                }>
                                  {q.difficulty}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingQuestionIndex(index)}
                                className="p-2 hover:bg-blue-100 rounded-lg text-blue-500"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeQuestion(index)}
                                className="p-2 hover:bg-red-100 rounded-lg text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Test Table Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Correct</TableHead>
                        <TableHead>Difficulty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question, index) => (
                        <TableRow key={`table_${question.id}`}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="max-w-md whitespace-normal">{question.question}</TableCell>
                          <TableCell>{String.fromCharCode(65 + question.correctAnswer)}</TableCell>
                          <TableCell className="capitalize">{question.difficulty}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={saveTest}
                disabled={questions.length === 0}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Test
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CreateTestPage;
