import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectDB, chapterDB } from '@/services/supabaseDB';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Upload,
  Database,
  FileJson,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { Subject, Chapter } from '@/types';

const AdminDataImportPage = () => {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const handlePreview = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setPreviewData(parsed);
      toast.success('JSON parsed successfully! Review the data below.');
    } catch (error) {
      setPreviewData(null);
      toast.error('Invalid JSON. Please check the format.');
    }
  };

  const handleImport = async () => {
    if (!previewData) return;
    setIsLoading(true);

    try {
      const items = Array.isArray(previewData) ? previewData : [previewData];
      let subjectsProcessed = 0;
      let chaptersProcessed = 0;

      for (const item of items) {
        // Detect if it's a Subject or a Chapter
        const isSubject = item.grade || item.class;
        const isChapter = item.chapter_id || item.chapter_name || item.topics;

        if (isSubject && !isChapter) {
          // Subject Import Logic
          const subjectId = item.id || `subj_${item.subject.toLowerCase()}_${item.class || item.grade}`;
          const subjectData: Subject = {
            id: subjectId,
            name: item.subject_name || item.subject || 'New Subject',
            description: item.description || '',
            icon: item.icon || '[SCI]',
            color: item.color || 'bg-blue-500',
            grade: Number(item.grade || item.class || 6),
            chapters: [],
          };
          await subjectDB.update(subjectId, subjectData).catch(() => subjectDB.create(subjectData));
          subjectsProcessed++;
        } else if (isChapter) {
          // Chapter Import Logic
          const subjectId = item.subject_id || `subj_science_${item.class || 6}`;
          const chapterId = item.chapter_id || (item.chapter_name?.cbse ? `ch_science_${item.class}_${item.chapter_id.replace(/\D/g, '')}` : `ch_${Date.now()}`);
          
          // Construct Board-specific content
          const name_board: Record<string, string> = {};
          
          if (item.chapter_name) {
            name_board.CBSE = item.chapter_name.cbse || item.chapter_name.CBSE;
            name_board.STATE = item.chapter_name.state || item.chapter_name.STATE;
          }

          const allMcqs: any[] = [];
          if (Array.isArray(item.topics)) {
             // Extract all MCQs for the general practice tab
             item.topics.forEach((t: any) => {
               if (Array.isArray(t.mcq)) {
                 t.mcq.forEach((m: any, idx: number) => {
                    let correctAnswer = m.answer;
                    if (typeof correctAnswer === 'string' && m.options.includes(correctAnswer)) {
                      correctAnswer = m.options.indexOf(correctAnswer);
                    }
                    allMcqs.push({
                      id: m.id || `${chapterId}_mcq_${idx}_${Math.random().toString(36).slice(2,5)}`,
                      question: m.question,
                      options: m.options,
                      correctAnswer: Number(correctAnswer) || 0,
                      explanation: m.explanation || '',
                    });
                 });
               }
             });
          }

          const chapterData: Partial<Chapter> & { content_board: any, name_board: any, topics: any } = {
            id: chapterId,
            subjectId: subjectId,
            name: name_board.CBSE || item.name || 'New Chapter',
            description: item.description || '',
            order: Number(item.order || item.chapter_id?.replace(/\D/g, '') || 1),
            content: item.explanation || '',
            name_board: name_board,
            content_board: {
              CBSE: {
                explanation: item.explanation || (item.topics?.[0]?.explanation || ''),
                mcq: allMcqs,
                short_questions: item.topics?.[0]?.short_questions || []
              },
              STATE: {
                explanation: item.explanation || (item.topics?.[0]?.explanation || ''),
                mcq: allMcqs,
                short_questions: item.topics?.[0]?.short_questions || []
              }
            },
            topics: item.topics || [],
          };

          // Using apply_migration for manual upsert to handle custom tables if needed, 
          // but service classes are easier if they support upsert. 
          // supabaseDB.ts Usually has update/create.
          await chapterDB.update(chapterId, chapterData as Chapter).catch(() => chapterDB.create(chapterData as Chapter));
          chaptersProcessed++;
        }
      }

      toast.success(`Import completed! Processed ${subjectsProcessed} subjects and ${chaptersProcessed} chapters.`);
      setJsonInput('');
      setPreviewData(null);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Import failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Bulk Data Import
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Input Section */}
          <div className="space-y-4 flex flex-col">
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="py-4 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  JSON Editor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 relative">
                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='Paste your JSON data here (Subjects or Chapters)...'
                  className="w-full h-full min-h-[500px] p-4 font-mono text-sm border-none focus-visible:ring-0 resize-none bg-slate-900 text-blue-200"
                />
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handlePreview} 
                className="flex-1"
                disabled={!jsonInput.trim() || isLoading}
              >
                Parse JSON
              </Button>
              <Button 
                onClick={handleImport} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!previewData || isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Import to Database
              </Button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <Card className="h-full max-h-[600px] overflow-y-auto">
              <CardHeader className="py-4 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Preview & Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {previewData ? (
                  <div className="space-y-6">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        Type detected: <span className="underline">{previewData.grade || previewData.class ? 'Subject' : 'Chapter'}</span>
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {Array.isArray(previewData) ? `${previewData.length} items found` : '1 item found'}
                      </p>
                    </div>

                    <pre className="text-xs p-4 bg-gray-900 text-green-400 rounded-xl overflow-x-auto">
                      {JSON.stringify(previewData, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">Paste JSON and click "Parse" to see preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDataImportPage;
