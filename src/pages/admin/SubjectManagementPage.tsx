import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { chapterDB, subjectDB, testDB } from '@/services/supabaseDB';
import { subjectDB as localSubjectDB, testDB as localTestDB } from '@/services/database';
import { generateSubjectBlueprint } from '@/services/geminiAPI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Plus,
  Layers,
  Trash2,
  BookPlus,
  Sparkles,
  Upload,
  Loader2,
  FileUp,
} from 'lucide-react';
import type { Chapter, Subject, Test } from '@/types';

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

const iconOptions = ['[BK]', '[MTH]', '[SCI]', '[CHEM]', '[ENG]', '[GEO]', '[ART]', '[CS]'];

const normalizeSubject = (subject: Subject): Subject => ({
  ...subject,
  id: String(subject.id),
  chapters: (subject.chapters || []).map((chapter) => ({
    ...chapter,
    id: String(chapter.id),
    subjectId: String(chapter.subjectId),
  })),
});

const SubjectManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isUploadingTests, setIsUploadingTests] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    description: '',
    icon: '[BK]',
    color: 'bg-blue-500',
    grade: 10,
  });
  const [chapterDrafts, setChapterDrafts] = useState<Record<string, { name: string; description: string }>>({});
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [testUploadFile, setTestUploadFile] = useState<File | null>(null);

  const sortedSubjects = useMemo(
    () => [...subjects].sort((a, b) => a.name.localeCompare(b.name)),
    [subjects]
  );

  const upsertLocalChapter = (subjectId: string, chapter: Chapter) => {
    const localSubject = localSubjectDB.getById(subjectId);
    if (!localSubject) return false;
    const nextChapters = [...(localSubject.chapters || []), chapter];
    const updated = localSubjectDB.update(subjectId, { chapters: nextChapters });
    return Boolean(updated);
  };

  const createSubjectWithFallback = async (subject: Subject): Promise<'cloud' | 'local'> => {
    try {
      await subjectDB.create(subject);
      return 'cloud';
    } catch (error) {
      console.warn('Cloud subject create failed. Falling back to local:', error);
      localSubjectDB.create(subject);
      return 'local';
    }
  };

  const createChapterWithFallback = async (chapter: Chapter): Promise<'cloud' | 'local'> => {
    try {
      await chapterDB.create(chapter);
      return 'cloud';
    } catch (error) {
      console.warn('Cloud chapter create failed. Falling back to local:', error);
      const ok = upsertLocalChapter(chapter.subjectId, chapter);
      if (!ok) {
        throw error;
      }
      return 'local';
    }
  };

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await subjectDB.getAll();
      setSubjects(data.map(normalizeSubject));
    } catch (error) {
      console.error('Failed to load cloud subjects:', error);
      const localSubjects = localSubjectDB.getAll();
      setSubjects(localSubjects.map(normalizeSubject));
      toast.error('Cloud subject load failed. Showing local data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSubjects();
  }, []);

  const addSubject = async () => {
    if (!newSubject.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    const subject: Subject = {
      id: `subject_${Date.now()}`,
      name: newSubject.name.trim(),
      description: newSubject.description.trim(),
      icon: newSubject.icon,
      color: newSubject.color,
      grade: Math.min(12, Math.max(1, newSubject.grade)),
      chapters: [],
    };

    try {
      const mode = await createSubjectWithFallback(subject);
      setSubjects((prev) => [...prev, normalizeSubject(subject)]);
      setShowAddForm(false);
      setNewSubject({ name: '', description: '', icon: '[BK]', color: 'bg-blue-500', grade: 10 });
      toast.success(mode === 'cloud' ? 'Subject added' : 'Subject added (local fallback)');
    } catch (error) {
      console.error('Failed to add subject:', error);
      const message = error instanceof Error ? error.message : 'Could not add subject';
      toast.error(message);
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      try {
        await subjectDB.delete(id);
      } catch (error) {
        console.warn('Cloud subject delete failed. Falling back to local:', error);
        localSubjectDB.delete(id);
      }
      setSubjects((prev) => prev.filter((subject) => subject.id !== id));
      toast.success('Subject deleted');
    } catch (error) {
      console.error('Failed to delete subject:', error);
      const message = error instanceof Error ? error.message : 'Could not delete subject';
      toast.error(message);
    }
  };

  const addChapter = async (subject: Subject) => {
    const draft = chapterDrafts[subject.id];
    if (!draft?.name?.trim()) {
      toast.error('Chapter name is required');
      return;
    }

    const chapter: Chapter = {
      id: `chapter_${Date.now()}`,
      subjectId: subject.id,
      name: draft.name.trim(),
      description: draft.description.trim() || `${draft.name.trim()} description`,
      order: subject.chapters.length + 1,
      content: draft.description.trim() || `${draft.name.trim()} overview`,
      mcqs: [],
    };

    try {
      const mode = await createChapterWithFallback(chapter);
      setSubjects((prev) =>
        prev.map((item) =>
          item.id === subject.id
            ? { ...item, chapters: [...item.chapters, chapter] }
            : item
        )
      );
      setChapterDrafts((prev) => ({
        ...prev,
        [subject.id]: { name: '', description: '' },
      }));
      toast.success(mode === 'cloud' ? 'Chapter added' : 'Chapter added (local fallback)');
    } catch (error) {
      console.error('Failed to add chapter:', error);
      const message = error instanceof Error ? error.message : 'Could not add chapter';
      toast.error(message);
    }
  };

  const readFileAsText = async (file: File): Promise<string> => {
    const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return await file.text();
    }
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer).slice(0, 120000);
    return new TextDecoder('utf-8', { fatal: false })
      .decode(bytes)
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .trim();
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter an AI prompt');
      return;
    }

    setIsAiGenerating(true);
    try {
      const sourceText = aiFile ? await readFileAsText(aiFile) : '';
      const blueprint = await generateSubjectBlueprint({
        prompt: aiPrompt.trim(),
        sourceText,
      });

      const isFallbackBlueprint =
        blueprint.subjects.length === 1 &&
        blueprint.subjects[0]?.name === 'Generated Subject' &&
        blueprint.subjects[0]?.chapters?.[0]?.name === 'Chapter 1';

      if (isFallbackBlueprint) {
        toast.error(
          'AI provider response unavailable. Configure GEMINI_API_KEY/GROQ_API_KEY and try again.'
        );
        return;
      }

      let createdSubjects = 0;
      let createdChapters = 0;
      let usedLocalFallback = false;
      for (const generatedSubject of blueprint.subjects) {
        const subject: Subject = {
          id: `subject_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: generatedSubject.name,
          description: generatedSubject.description,
          icon: '[BK]',
          color: colorOptions[createdSubjects % colorOptions.length],
          grade: generatedSubject.grade,
          chapters: [],
        };
        const subjectSaveMode = await createSubjectWithFallback(subject);
        if (subjectSaveMode === 'local') {
          usedLocalFallback = true;
        }
        createdSubjects += 1;

        let order = 1;
        for (const generatedChapter of generatedSubject.chapters) {
          const chapter: Chapter = {
            id: `chapter_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            subjectId: subject.id,
            name: generatedChapter.name,
            description: generatedChapter.description,
            content: generatedChapter.content,
            order,
            mcqs: [],
          };
          const chapterSaveMode = await createChapterWithFallback(chapter);
          if (chapterSaveMode === 'local') {
            usedLocalFallback = true;
          }
          order += 1;
          createdChapters += 1;
        }
      }

      toast.success(
        usedLocalFallback
          ? `AI generated ${createdSubjects} subjects and ${createdChapters} chapters (saved locally)`
          : `AI generated ${createdSubjects} subjects and ${createdChapters} chapters`
      );
      setAiPrompt('');
      setAiFile(null);
      await loadSubjects();
    } catch (error) {
      console.error('AI subject generation failed:', error);
      const message = error instanceof Error ? error.message : 'AI generation failed';
      toast.error(message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const uploadTests = async () => {
    if (!testUploadFile) {
      toast.error('Please select a JSON file');
      return;
    }

    setIsUploadingTests(true);
    try {
      const rawText = await testUploadFile.text();
      const parsed = JSON.parse(rawText);
      const tests = Array.isArray(parsed) ? parsed : [parsed];

      let uploaded = 0;
      let localFallbackUsed = false;
      for (let i = 0; i < tests.length; i++) {
        const item = tests[i];
        if (!item?.title || !item?.subjectId || !Array.isArray(item?.questions)) {
          continue;
        }
        const questions = item.questions;
        const totalMarks =
          typeof item.totalMarks === 'number'
            ? item.totalMarks
            : questions.reduce((sum: number, question: any) => sum + (Number(question?.marks) || 1), 0);
        const normalizedTest: Test = {
          id: item.id || `test_upload_${Date.now()}_${i}`,
          title: String(item.title),
          description: String(item.description || ''),
          subjectId: String(item.subjectId),
          chapterIds: Array.isArray(item.chapterIds)
            ? item.chapterIds.map((chapterId: unknown) => String(chapterId))
            : [],
          questions,
          duration: Number(item.duration) || 30,
          totalMarks,
          passingMarks: Number(item.passingMarks) || Math.max(1, Math.round(totalMarks * 0.5)),
          createdBy: user?.id || 'admin_upload',
          createdAt: new Date(),
          isActive: item.isActive ?? true,
        };
        try {
          await testDB.create(normalizedTest);
        } catch (error) {
          console.warn('Cloud test upload failed. Falling back to local:', error);
          localTestDB.create(normalizedTest);
          localFallbackUsed = true;
        }
        uploaded += 1;
      }

      if (uploaded === 0) {
        toast.error('No valid tests found in file');
      } else {
        toast.success(
          localFallbackUsed
            ? `${uploaded} test(s) uploaded locally`
            : `${uploaded} test(s) uploaded successfully`
        );
        setTestUploadFile(null);
      }
    } catch (error) {
      console.error('Test upload failed:', error);
      const message = error instanceof Error ? error.message : 'Failed to upload tests. Use valid JSON.';
      toast.error(message);
    } finally {
      setIsUploadingTests(false);
    }
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
              <h1 className="text-xl font-bold">Subject & Chapter Management</h1>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Subject Generator (Prompt + PDF)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              placeholder='e.g. "Class 10 Science and Math ke 8-8 chapters generate karo"'
              rows={4}
            />
            <div className="space-y-2">
              <Input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={(event) => setAiFile(event.target.files?.[0] || null)}
              />
              <p className="text-xs text-gray-500">
                PDF upload supported. Extracted text AI context me pass kiya jayega.
              </p>
              {aiFile && <p className="text-xs text-gray-500">Selected: {aiFile.name}</p>}
            </div>
            <Button onClick={generateWithAI} disabled={isAiGenerating} className="w-full sm:w-auto">
              {isAiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Subjects & Chapters
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="w-5 h-5 text-blue-600" />
              Test Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="file"
              accept=".json"
              onChange={(event) => setTestUploadFile(event.target.files?.[0] || null)}
            />
            <p className="text-xs text-gray-500">
              Upload JSON array of tests with fields: title, subjectId, questions, duration, passingMarks.
            </p>
            {testUploadFile && <p className="text-xs text-gray-500">Selected: {testUploadFile.name}</p>}
            <Button onClick={uploadTests} disabled={isUploadingTests}>
              {isUploadingTests ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Tests
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {showAddForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
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
                        onChange={(event) => setNewSubject({ ...newSubject, name: event.target.value })}
                        placeholder="Subject name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Grade</label>
                      <Input
                        type="number"
                        value={newSubject.grade}
                        onChange={(event) =>
                          setNewSubject({
                            ...newSubject,
                            grade: Number.isFinite(Number.parseInt(event.target.value, 10))
                              ? Number.parseInt(event.target.value, 10)
                              : 10,
                          })
                        }
                        min={1}
                        max={12}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Input
                      value={newSubject.description}
                      onChange={(event) => setNewSubject({ ...newSubject, description: event.target.value })}
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
                          className={`w-10 h-10 rounded-lg text-xs flex items-center justify-center border-2 ${
                            newSubject.icon === icon ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                          }`}
                          type="button"
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
                          type="button"
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

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedSubjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-xl ${subject.color} flex items-center justify-center text-sm`}>
                        {subject.icon}
                      </div>
                      <button
                        onClick={() => void deleteSubject(subject.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg">{subject.name}</h3>
                      <p className="text-sm text-gray-500">{subject.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">Grade {subject.grade}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {subject.chapters.length} chapters
                        </Badge>
                      </div>
                    </div>

                    <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
                      <p className="text-sm font-medium">Add Chapter</p>
                      <Input
                        value={chapterDrafts[subject.id]?.name || ''}
                        onChange={(event) =>
                          setChapterDrafts((prev) => ({
                            ...prev,
                            [subject.id]: {
                              name: event.target.value,
                              description: prev[subject.id]?.description || '',
                            },
                          }))
                        }
                        placeholder="Chapter name"
                      />
                      <Input
                        value={chapterDrafts[subject.id]?.description || ''}
                        onChange={(event) =>
                          setChapterDrafts((prev) => ({
                            ...prev,
                            [subject.id]: {
                              name: prev[subject.id]?.name || '',
                              description: event.target.value,
                            },
                          }))
                        }
                        placeholder="Chapter short description"
                      />
                      <Button size="sm" onClick={() => void addChapter(subject)}>
                        <BookPlus className="w-4 h-4 mr-2" />
                        Add Chapter
                      </Button>
                    </div>

                    {subject.chapters.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Chapters</p>
                        <div className="max-h-40 overflow-auto space-y-1 pr-1">
                          {subject.chapters
                            .slice()
                            .sort((a, b) => a.order - b.order)
                            .map((chapter) => (
                              <div
                                key={chapter.id}
                                className="text-sm rounded-md border p-2 bg-white flex justify-between gap-2"
                              >
                                <span className="font-medium truncate">{chapter.name}</span>
                                <span className="text-xs text-gray-500">#{chapter.order}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
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

export default SubjectManagementPage;
