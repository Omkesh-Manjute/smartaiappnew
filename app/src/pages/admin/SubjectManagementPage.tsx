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
  Edit2,
  Save,
  X,
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
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
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
  const [editingChapterData, setEditingChapterData] = useState<{ name: string; description: string } | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [testUploadFile, setTestUploadFile] = useState<File | null>(null);
  const [contentUploadFile, setContentUploadFile] = useState<File | null>(null);
  const [isImportingContent, setIsImportingContent] = useState(false);

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

  const updateSubjectWithFallback = async (id: string, updates: Partial<Subject>): Promise<'cloud' | 'local'> => {
    try {
      await subjectDB.update(id, updates);
      return 'cloud';
    } catch (error) {
      console.warn('Cloud subject update failed. Falling back to local:', error);
      localSubjectDB.update(id, updates);
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

  const updateChapterWithFallback = async (id: string, updates: Partial<Chapter>): Promise<'cloud' | 'local'> => {
    try {
      await chapterDB.update(id, updates);
      return 'cloud';
    } catch (error) {
      console.warn('Cloud chapter update failed. Falling back to local:', error);
      // Local path: update subject's chapters array
      const allSubjects = localSubjectDB.getAll();
      let ok = false;
      for (const s of allSubjects) {
        const cIdx = s.chapters.findIndex(c => c.id === id);
        if (cIdx !== -1) {
          const newChapters = [...(s.chapters || [])];
          newChapters[cIdx] = { ...newChapters[cIdx], ...updates };
          localSubjectDB.update(s.id, { chapters: newChapters });
          ok = true;
          break;
        }
      }
      if (!ok) throw error;
      return 'local';
    }
  };

  const deleteChapterWithFallback = async (id: string): Promise<'cloud' | 'local'> => {
    try {
      await chapterDB.delete(id);
      return 'cloud';
    } catch (error) {
      console.warn('Cloud chapter delete failed. Falling back to local:', error);
      const allSubjects = localSubjectDB.getAll();
      let ok = false;
      for (const s of allSubjects) {
        const cIdx = s.chapters.findIndex(c => c.id === id);
        if (cIdx !== -1) {
          const newChapters = s.chapters.filter(c => c.id !== id);
          localSubjectDB.update(s.id, { chapters: newChapters });
          ok = true;
          break;
        }
      }
      if (!ok) throw error;
      return 'local';
    }
  };

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      // 1. Get local subjects (source of pre-installed data)
      const localData = localSubjectDB.getAll();
      const normalizedLocal = localData.map(normalizeSubject);
      
      let merged = [...normalizedLocal];
      let cloudSynced = false;

      // 2. Try to get cloud subjects
      try {
        const cloudData = await subjectDB.getAll();
        const normalizedCloud = cloudData.map(normalizeSubject);
        
        // Merge cloud into local, cloud overwrites local if ID matches
        normalizedCloud.forEach(cloudS => {
          const index = merged.findIndex(s => s.id === cloudS.id);
          if (index !== -1) {
            merged[index] = cloudS;
          } else {
            merged.push(cloudS);
          }
        });
        cloudSynced = true;
      } catch (cloudError) {
        console.warn('Cloud sync skipped or failed during load:', cloudError);
      }

      setSubjects(merged);
      if (!cloudSynced && merged.length > 0) {
        toast.info('Showing local data. Cloud sync unavailable.');
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast.error('Could not load subjects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSubjects();
  }, []);

  const handleAddOrUpdateSubject = async () => {
    if (!newSubject.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    if (editingSubjectId) {
      const updates = {
        name: newSubject.name.trim(),
        description: newSubject.description.trim(),
        icon: newSubject.icon,
        color: newSubject.color,
        grade: Math.min(12, Math.max(1, newSubject.grade)),
      };

      try {
        const mode = await updateSubjectWithFallback(editingSubjectId, updates);
        setSubjects((prev) =>
          prev.map((s) => (s.id === editingSubjectId ? { ...s, ...updates } : s))
        );
        setEditingSubjectId(null);
        setShowAddForm(false);
        setNewSubject({ name: '', description: '', icon: '[BK]', color: 'bg-blue-500', grade: 10 });
        toast.success(mode === 'cloud' ? 'Subject updated' : 'Subject updated (local)');
      } catch (error) {
        toast.error('Failed to update subject');
      }
    } else {
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
        toast.error('Could not add subject');
      }
    }
  };

  const startEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setNewSubject({
      name: subject.name,
      description: subject.description,
      icon: subject.icon,
      color: subject.color,
      grade: subject.grade,
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSubject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
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
      toast.error('Could not delete subject');
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
      toast.error('Could not add chapter');
    }
  };

  const deleteChapter = async (chapterId: string, subjectId: string) => {
    if (!window.confirm('Delete this chapter?')) return;
    try {
      const mode = await deleteChapterWithFallback(chapterId);
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === subjectId
            ? { ...s, chapters: s.chapters.filter((c) => c.id !== chapterId) }
            : s
        )
      );
      toast.success(mode === 'cloud' ? 'Chapter deleted' : 'Chapter deleted (local)');
    } catch (error) {
      toast.error('Failed to delete chapter');
    }
  };

  const startEditChapter = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setEditingChapterData({ name: chapter.name, description: chapter.description });
  };

  const saveChapterUpdate = async (chapterId: string, subjectId: string) => {
    if (!editingChapterData?.name.trim()) {
      toast.error('Chapter name required');
      return;
    }

    try {
      const updates = {
        name: editingChapterData.name.trim(),
        description: editingChapterData.description.trim(),
      };
      const mode = await updateChapterWithFallback(chapterId, updates);
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === subjectId
            ? {
                ...s,
                chapters: s.chapters.map((c) =>
                  c.id === chapterId ? { ...c, ...updates } : c
                ),
              }
            : s
        )
      );
      setEditingChapterId(null);
      setEditingChapterData(null);
      toast.success(mode === 'cloud' ? 'Chapter updated' : 'Chapter updated (local)');
    } catch (error) {
      toast.error('Failed to update chapter');
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
      toast.error('AI generation failed');
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

        // Normalize questions and handle various correctAnswer formats
        const normalizedQuestions = item.questions.map((q: any) => {
          let correctAnswer = q.correctAnswer;
          
          // Handle text-based answers (e.g., "Sad")
          if (typeof correctAnswer === 'string' && q.options.includes(correctAnswer)) {
            correctAnswer = q.options.indexOf(correctAnswer);
          }
          
          // Handle numeric strings (e.g., "1")
          if (typeof correctAnswer === 'string' && !isNaN(Number(correctAnswer))) {
            correctAnswer = Number(correctAnswer);
          }

          // Handle 1-indexed answers (heuristic: if answer index is >= options length)
          if (typeof correctAnswer === 'number' && correctAnswer >= q.options.length) {
            correctAnswer -= 1;
          }

          return {
            ...q,
            id: q.id || `q_${Math.random().toString(36).substr(2, 9)}`,
            correctAnswer: Number(correctAnswer),
            marks: Number(q.marks) || 1,
            difficulty: q.difficulty || 'medium',
            explanation: q.explanation || '',
          };
        });

        const totalMarks =
          typeof item.totalMarks === 'number'
            ? item.totalMarks
            : normalizedQuestions.reduce((sum: number, q: any) => sum + q.marks, 0);

        const normalizedTest: Test = {
          id: item.id || `test_upload_${Date.now()}_${i}`,
          title: String(item.title),
          description: String(item.description || ''),
          subjectId: String(item.subjectId),
          chapterIds: Array.isArray(item.chapterIds)
            ? item.chapterIds.map((chapterId: unknown) => String(chapterId))
            : [],
          questions: normalizedQuestions,
          duration: Number(item.duration) || 30,
          totalMarks,
          passingMarks: Number(item.passingMarks) || Math.max(1, Math.round(totalMarks * 0.5)),
          createdBy: user?.id || 'admin_upload',
          createdAt: new Date(),
          isActive: item.isActive ?? true,
        };

        try {
          await testDB.create(normalizedTest);
        } catch (error: any) {
          console.warn('Cloud test upload failed:', error);
          
          if (error.code === '23503') {
            toast.error(`Upload Failed: The subjectId "${normalizedTest.subjectId}" is invalid (does not exist in database).`);
            throw new Error('Foreign key violation');
          } else if (error.code === '23505') {
            toast.error(`Upload Failed: A test with ID "${normalizedTest.id}" already exists.`);
            throw new Error('Unique constraint violation');
          } else {
            localTestDB.create(normalizedTest);
            localFallbackUsed = true;
          }
        }
        uploaded += 1;
      }

      if (uploaded === 0) {
        toast.error('No valid tests found in file');
      } else {
        toast.success(
          localFallbackUsed
            ? `${uploaded} test(s) parsed, but cloud upload failed for some. Check console or IDs.`
            : `${uploaded} test(s) uploaded successfully to Cloud!`
        );
        setTestUploadFile(null);
      }
    } catch (error) {
      console.error('Test upload failed:', error);
      // Suppress the generic error if we already showed a specific toast above
      if (error instanceof Error && (error.message.includes('Foreign key') || error.message.includes('Unique constraint'))) {
        // already handled by specific toasts
      } else {
        toast.error('Failed to upload tests. Please ensure valid JSON structure.');
      }
    } finally {
      setIsUploadingTests(false);
    }
  };

  const handleBulkImport = async () => {
    if (!contentUploadFile) {
      toast.error('Please select a JSON content file');
      return;
    }

    setIsImportingContent(true);
    try {
      const rawText = await contentUploadFile.text();
      const parsed = JSON.parse(rawText);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      let subjectsCreated = 0;
      let chaptersCreated = 0;
      let mcqsCreated = 0;

      for (const item of items) {
        // 1. Get or Create Subject
        // Map "class" to "grade" and "subject" to subject name
        const gradeNum = Number(item.class) || 10;
        const subjectName = item.subject || 'New Subject';
        
        // Try to find existing subject for this grade
        let subjectId = '';
        const existingSubjects = subjects.filter(s => s.name.toLowerCase() === subjectName.toLowerCase() && s.grade === gradeNum);
        
        if (existingSubjects.length > 0) {
          subjectId = existingSubjects[0].id;
        } else {
          subjectId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const subject: Subject = {
            id: subjectId,
            name: subjectName,
            description: item.description || `${subjectName} for Class ${gradeNum}`,
            icon: item.icon || '[BK]',
            color: item.color || colorOptions[subjectsCreated % colorOptions.length],
            grade: gradeNum,
            chapters: [],
          };
          await createSubjectWithFallback(subject);
          subjectsCreated++;
        }

        // 2. Create Chapter
        const chapterName = item.chapter || 'New Chapter';
        const chapterId = `ch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        
        // Consolidate content from topics
        let consolidatedContent = '';
        const allMcqs: any[] = [];

        if (Array.isArray(item.topics)) {
          item.topics.forEach((t: any, idx: number) => {
            consolidatedContent += `### ${t.topic_name || `Topic ${idx+1}`}\n\n`;
            consolidatedContent += `${t.explanation || ''}\n\n`;
            
            if (Array.isArray(t.examples) && t.examples.length > 0) {
              consolidatedContent += `**Examples:**\n${t.examples.map((ex: string) => `- ${ex}`).join('\n')}\n\n`;
            }
            
            if (Array.isArray(t.key_points) && t.key_points.length > 0) {
              consolidatedContent += `**Key Points:**\n${t.key_points.map((kp: string) => `- ${kp}`).join('\n')}\n\n`;
            }

            if (Array.isArray(t.rules) && t.rules.length > 0) {
              consolidatedContent += `**Rules:**\n${t.rules.map((r: string) => `- ${r}`).join('\n')}\n\n`;
            }

            // Sub-topics
            if (Array.isArray(t.sub_topics)) {
              t.sub_topics.forEach((st: any) => {
                consolidatedContent += `#### ${st.type || 'Sub-topic'}\n${st.explanation || ''}\n`;
                if (Array.isArray(st.examples)) {
                  consolidatedContent += `${st.examples.map((ex: string) => `- ${ex}`).join('\n')}\n`;
                }
                consolidatedContent += '\n';
              });
            }

            // Extract MCQs
            if (Array.isArray(t.mcq)) {
              t.mcq.forEach((m: any) => {
                let correctAnswer = m.answer;
                if (typeof correctAnswer === 'string' && m.options.includes(correctAnswer)) {
                  correctAnswer = m.options.indexOf(correctAnswer);
                }
                allMcqs.push({
                  id: m.id || `mcq_${Math.random().toString(36).slice(2, 10)}`,
                  question: m.question,
                  options: m.options,
                  correctAnswer: Number(correctAnswer) || 0,
                  explanation: m.explanation || '',
                  difficulty: m.difficulty || 'easy',
                });
              });
            }
          });
        }

        const chapter: Chapter = {
          id: chapterId,
          subjectId: subjectId,
          name: chapterName,
          description: item.description || `${chapterName} overview`,
          order: 1, // Default to 1 or calculate based on existing
          content: consolidatedContent || item.chapter_explanation || '',
          mcqs: [],
        };

        await createChapterWithFallback(chapter);
        chaptersCreated++;

        if (allMcqs.length > 0) {
          await mcqDB.createBulk(allMcqs, chapterId);
          mcqsCreated += allMcqs.length;
        }
      }

      toast.success(`Import complete: ${subjectsCreated} Subjects, ${chaptersCreated} Chapters, ${mcqsCreated} MCQs`);
      setContentUploadFile(null);
      await loadSubjects();
    } catch (error) {
      console.error('Bulk import failed:', error);
      toast.error('Failed to import content. Check console for details.');
    } finally {
      setIsImportingContent(false);
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
            <Button onClick={() => {
              setEditingSubjectId(null);
              setNewSubject({ name: '', description: '', icon: '[BK]', color: 'bg-blue-500', grade: 10 });
              setShowAddForm(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Sparkles className="w-5 h-5" />
                AI Subject Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder='e.g. "Class 10 Science and Math ke 8-8 chapters generate karo"'
                rows={3}
              />
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={(event) => setAiFile(event.target.files?.[0] || null)}
                />
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                  PDF / TEXT Support
                </p>
              </div>
              <Button onClick={generateWithAI} disabled={isAiGenerating} className="w-full">
                {isAiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full border-2 border-indigo-200 shadow-md ring-1 ring-indigo-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <Layers className="w-5 h-5" />
                Bulk Content Import
              </CardTitle>
              <Badge className="bg-indigo-600 text-white animate-pulse">RECOMMENDED</Badge>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 mb-2">
                <p className="text-xs text-indigo-800 leading-relaxed font-bold">
                  USE THIS FOR: Class, Subject, Chapters & Topics (JSON)
                </p>
              </div>
              <Input
                type="file"
                accept=".json"
                onChange={(event) => setContentUploadFile(event.target.files?.[0] || null)}
              />
              <Button 
                onClick={handleBulkImport} 
                disabled={isImportingContent} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg"
              >
                {isImportingContent ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Import JSON Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="h-full opacity-80 hover:opacity-100 transition-opacity">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <FileUp className="w-5 h-5" />
                Bulk MCQ/Test Only
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 mb-2">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Only use this for stand-alone tests (No chapters/subjects).
                </p>
              </div>
              <Input
                type="file"
                accept=".json"
                onChange={(event) => setTestUploadFile(event.target.files?.[0] || null)}
              />
              <Button onClick={uploadTests} disabled={isUploadingTests} variant="secondary" className="w-full">
                {isUploadingTests ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Test JSON
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {showAddForm && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-2 border-purple-200 shadow-xl overflow-hidden">
              <div className="bg-purple-600 px-6 py-4 flex items-center justify-between">
                <CardTitle className="text-white">
                  {editingSubjectId ? 'Update Subject' : 'Create New Subject'}
                </CardTitle>
                <button onClick={() => setShowAddForm(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Name</label>
                      <Input
                        value={newSubject.name}
                        onChange={(event) => setNewSubject({ ...newSubject, name: event.target.value })}
                        placeholder="e.g. Mathematics"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Grade</label>
                      <Input
                        type="number"
                        value={newSubject.grade}
                        onChange={(event) =>
                          setNewSubject({
                            ...newSubject,
                            grade: parseInt(event.target.value) || 10,
                          })
                        }
                        min={1}
                        max={12}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Description</label>
                    <Input
                      value={newSubject.description}
                      onChange={(event) => setNewSubject({ ...newSubject, description: event.target.value })}
                      placeholder="Enter subject overview..."
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700">Select Icon</label>
                      <div className="grid grid-cols-4 gap-2">
                        {iconOptions.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => setNewSubject({ ...newSubject, icon })}
                            className={`h-10 rounded-lg font-bold transition-all border-2 ${
                              newSubject.icon === icon 
                                ? 'border-purple-600 bg-purple-50 text-purple-600 scale-105' 
                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700">Accent Color</label>
                      <div className="grid grid-cols-4 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewSubject({ ...newSubject, color })}
                            className={`h-10 rounded-lg transition-all ${color} ${
                              newSubject.color === color 
                                ? 'ring-4 ring-offset-2 ring-purple-600 scale-105' 
                                : 'opacity-80 hover:opacity-100 hover:scale-105'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 h-12 text-lg">
                      Cancel
                    </Button>
                    <Button onClick={handleAddOrUpdateSubject} className="flex-1 h-12 text-lg bg-purple-600 hover:bg-purple-700">
                      {editingSubjectId ? 'Update Changes' : 'Create Subject'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-gray-600" />
              Active Subjects
            </h2>
            <Badge variant="secondary" className="bg-gray-200 text-gray-700 font-bold px-3 py-1">
              {subjects.length} Total
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
              <p className="text-gray-500 font-medium tracking-wide">Synchronizing subjects...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedSubjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group h-full hover:shadow-lg transition-shadow border-gray-200 overflow-hidden">
                    <CardContent className="p-0">
                      <div className={`${subject.color} p-5 flex items-start justify-between`}>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-inner">
                            {subject.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{subject.name}</h3>
                            <Badge className="bg-black/20 hover:bg-black/30 text-white border-0">
                              Grade {subject.grade}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditSubject(subject)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => void deleteSubject(subject.id)}
                            className="p-2 bg-white/10 hover:bg-red-500/20 rounded-lg text-white/80 hover:text-white transition-colors"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {subject.description || 'No description available.'}
                        </p>

                        <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                          <div className="px-4 py-3 border-b flex items-center justify-between">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                              <BookPlus className="w-3.5 h-3.5" />
                              Chapter Management
                            </span>
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold px-2">
                              {subject.chapters.length} items
                            </Badge>
                          </div>
                          
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                className="h-9 text-sm"
                              />
                              <div className="flex gap-2">
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
                                  placeholder="Brief focus"
                                  className="h-9 text-sm"
                                />
                                <Button size="sm" onClick={() => void addChapter(subject)} className="shrink-0 bg-gray-800 hover:bg-black">
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {subject.chapters.length > 0 && (
                              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {subject.chapters
                                  .slice()
                                  .sort((a, b) => a.order - b.order)
                                  .map((chapter) => (
                                    <div
                                      key={chapter.id}
                                      className="group/item flex items-center justify-between p-3 bg-white border rounded-xl hover:border-purple-200 transition-colors"
                                    >
                                      {editingChapterId === chapter.id ? (
                                        <div className="flex-1 flex flex-col gap-2">
                                          <Input 
                                            value={editingChapterData?.name || ''}
                                            onChange={e => setEditingChapterData(prev => ({ ...prev!, name: e.target.value }))}
                                            className="h-8 text-sm font-bold"
                                            autoFocus
                                          />
                                          <div className="flex gap-2">
                                            <Input 
                                              value={editingChapterData?.description || ''}
                                              onChange={e => setEditingChapterData(prev => ({ ...prev!, description: e.target.value }))}
                                              className="h-8 text-sm"
                                            />
                                            <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700 shrink-0" onClick={() => saveChapterUpdate(chapter.id, subject.id)}>
                                              <Save className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => setEditingChapterId(null)}>
                                              <X className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-sm font-bold text-gray-800 truncate">
                                              #{chapter.order} {chapter.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-tighter">
                                              {chapter.description || 'Regular Content'}
                                            </p>
                                          </div>
                                          <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <button 
                                              onClick={() => startEditChapter(chapter)}
                                              className="p-1.5 hover:bg-purple-50 text-gray-400 hover:text-purple-600 rounded-lg"
                                              title="Edit Chapter"
                                            >
                                              <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                              onClick={() => deleteChapter(chapter.id, subject.id)}
                                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg"
                                              title="Delete Chapter"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubjectManagementPage;
