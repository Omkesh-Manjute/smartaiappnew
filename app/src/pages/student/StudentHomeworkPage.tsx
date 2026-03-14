import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { homeworkDB, homeworkSubmissionDB, storageDB, subjectDB } from '@/services/supabaseDB';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  FileText,
  Upload,
  CalendarClock,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import type { Homework, HomeworkSubmission, Subject } from '@/types';

const StudentHomeworkPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const submissionByHomework = useMemo(() => {
    const map = new Map<string, HomeworkSubmission>();
    submissions.forEach((submission) => {
      map.set(String(submission.homeworkId), submission);
    });
    return map;
  }, [submissions]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const allSubjects = await subjectDB.getAll();
      const normalizedSubjects = allSubjects.map((subject) => ({
        ...subject,
        id: String(subject.id),
        chapters: (subject.chapters || []).map((chapter) => ({
          ...chapter,
          id: String(chapter.id),
          subjectId: String(chapter.subjectId),
        })),
      }));
      setSubjects(normalizedSubjects);

      const allHomework: Homework[] = [];
      for (const subject of normalizedSubjects) {
        const subjectHomework = await homeworkDB.getBySubject(String(subject.id));
        allHomework.push(...subjectHomework);
      }
      const sortedHomework = allHomework.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
      setHomework(sortedHomework);

      const studentSubmissions = await homeworkSubmissionDB.getByStudent(user.id);
      setSubmissions(studentSubmissions);
    } catch (error) {
      console.error('Failed to load homework:', error);
      toast.error('Unable to load homework right now');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void loadData();
    }
  }, [user]);

  const openSubmissionDialog = (item: Homework) => {
    const existing = submissionByHomework.get(String(item.id));
    setSelectedHomework(item);
    setAnswerText(existing?.answerText || '');
    setFile(null);
  };

  const closeDialog = () => {
    setSelectedHomework(null);
    setAnswerText('');
    setFile(null);
  };

  const submitHomework = async () => {
    if (!user || !selectedHomework) return;
    if (!answerText.trim() && !file) {
      toast.error('Please add answer text or upload a file');
      return;
    }

    setIsSubmitting(true);
    try {
      const existing = submissionByHomework.get(String(selectedHomework.id));
      let fileUrl: string | null = existing?.fileUrl || null;
      let fileName: string | null = existing?.fileName || null;

      if (file) {
        const uploadPath = `submissions/${user.id}/${selectedHomework.id}_${Date.now()}_${file.name}`;
        fileUrl = await storageDB.uploadFile('homework', uploadPath, file);
        fileName = file.name;
      }

      const dueTime = new Date(selectedHomework.dueDate).getTime();
      const status: HomeworkSubmission['status'] =
        Date.now() > dueTime ? 'late' : 'submitted';

      if (existing) {
        await homeworkSubmissionDB.update(existing.id, {
          fileUrl,
          fileName,
          answerText: answerText.trim() || null,
          status,
        });
      } else {
        await homeworkSubmissionDB.create({
          id: `submission_${Date.now()}`,
          homeworkId: selectedHomework.id,
          studentId: user.id,
          fileUrl,
          fileName,
          answerText: answerText.trim() || null,
          submittedAt: new Date(),
          marks: null,
          feedback: null,
          status,
        });
      }

      toast.success(existing ? 'Homework updated successfully' : 'Homework submitted successfully');
      closeDialog();
      await loadData();
    } catch (error) {
      console.error('Failed to submit homework:', error);
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold">Homework</span>
            </div>
            <Badge variant="outline">{homework.length} Assigned</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : homework.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border">
            <FileText className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No homework assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {homework.map((item, index) => {
              const submission = submissionByHomework.get(String(item.id));
              const dueDate = new Date(item.dueDate);
              const overdue = !submission && dueDate.getTime() < Date.now();
              const subjectName =
                subjects.find((subject) => String(subject.id) === String(item.subjectId))?.name ||
                'Unknown Subject';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{subjectName}</p>
                        </div>
                        <div className="flex gap-2">
                          {submission ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {submission.status === 'late' ? 'Submitted Late' : 'Submitted'}
                            </Badge>
                          ) : overdue ? (
                            <Badge variant="destructive">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Overdue
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock3 className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {item.description || 'No description provided.'}
                      </p>

                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="w-4 h-4" />
                          Due: {dueDate.toLocaleString()}
                        </span>
                        <span>Max Marks: {item.maxMarks}</span>
                        {item.fileUrl && (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            Teacher Attachment
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {submission?.feedback && (
                        <div className="rounded-lg border bg-emerald-50 border-emerald-100 p-3 text-sm">
                          <p className="font-medium text-emerald-700">Teacher Feedback</p>
                          <p className="text-emerald-700 mt-1">{submission.feedback}</p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button onClick={() => openSubmissionDialog(item)}>
                          <Upload className="w-4 h-4 mr-2" />
                          {submission ? 'Update Submission' : 'Upload Homework'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={Boolean(selectedHomework)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedHomework ? `Submit: ${selectedHomework.title}` : 'Submit Homework'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <p className="text-sm font-medium mb-2">Answer / Notes</p>
              <Textarea
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                placeholder="Write your answer or explanation..."
                rows={6}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Upload File (optional)</p>
              <Input
                type="file"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
              {file && <p className="text-xs text-gray-500 mt-1">Selected: {file.name}</p>}
            </div>
            <Button className="w-full" onClick={submitHomework} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Homework
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentHomeworkPage;

