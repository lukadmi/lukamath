import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuthNew";
import { useLanguage, type Language, translations } from "@/hooks/useLanguage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  insertQuestionSchema, 
  type Question, 
  type Homework, 
  type HomeworkFile,
  type InsertQuestion 
} from "@shared/schema";
import { 
  BookOpen, 
  MessageSquare, 
  Upload, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  User,
  Home,
  LogOut,
  Globe,
  Plus,
  FileText,
  Send,
  TrendingUp,
  BarChart3,
  Smartphone,
  Trash2,
  Edit,
  Star,
  Award
} from "lucide-react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from "wouter";

// Using global LanguageProvider - removed local one that was overriding global language settings

function StudentApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("homework");
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const queryClient = useQueryClient();

  // Student homework file upload form schema
  const studentFileSchema = z.object({
    file: z.instanceof(File).refine(file => file.size <= 50 * 1024 * 1024, "File must be less than 50MB"),
    notes: z.string().optional()
  });

  const studentFileForm = useForm<{ file: File; notes?: string }>({
    resolver: zodResolver(studentFileSchema),
    defaultValues: {
      notes: ""
    }
  });

  // Homework queries
  const { data: homework = [], isLoading: homeworkLoading } = useQuery<Homework[]>({
    queryKey: ["/api/homework/student", (user as any)?.id],
    enabled: !!user && !!(user as any).id,
    retry: false,
  });

  // Questions queries
  const { data: questions = [], isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions/student", (user as any)?.id],
    enabled: !!user && !!(user as any).id,
    retry: false,
  });

  // Progress queries
  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ["/api/progress/student", (user as any)?.id],
    enabled: !!user && !!(user as any).id,
    retry: false,
  });

  // Availability queries
  const { data: availability = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ["/api/availability"],
    enabled: !!user,
    retry: false,
  });

  // Homework files query - fetch files for all homework assignments
  const { data: allHomeworkFiles = {} } = useQuery({
    queryKey: ["/api/homework/files", homework],
    queryFn: async () => {
      if (!homework || homework.length === 0) return {};

      const filesPromises = homework.map(async (hw: Homework) => {
        try {
          const files = await apiRequest("GET", `/api/homework/${hw.id}/files`);
          return { [hw.id]: files || [] };
        } catch (error) {
          console.warn(`Failed to fetch files for homework ${hw.id}:`, error);
          return { [hw.id]: [] };
        }
      });

      const filesResults = await Promise.all(filesPromises);
      return filesResults.reduce((acc, fileMap) => ({ ...acc, ...fileMap }), {});
    },
    enabled: !!homework && homework.length > 0,
    retry: false,
  });

  // Student homework submissions query
  const { data: studentSubmissions = {} } = useQuery({
    queryKey: ["/api/homework/student-submissions", (user as any)?.id],
    queryFn: async () => {
      if (!homework || homework.length === 0) return {};
      
      const submissionsPromises = homework.map(async (hw: Homework) => {
        try {
          const submissions = await apiRequest("GET", `/api/homework/${hw.id}/student-submissions/${(user as any)?.id}`);
          return { [hw.id]: submissions || [] };
        } catch (error) {
          return { [hw.id]: [] };
        }
      });
      
      const results = await Promise.all(submissionsPromises);
      return results.reduce((acc, subMap) => ({ ...acc, ...subMap }), {});
    },
    enabled: !!homework && homework.length > 0 && !!(user as any)?.id,
    retry: false,
  });

  // Question form
  const questionForm = useForm<InsertQuestion>({
    resolver: zodResolver(insertQuestionSchema),
    defaultValues: {
      subject: "",
      title: "",
      content: "",
      priority: "medium",
    },
  });

  // Question mutation
  const questionMutation = useMutation({
    mutationFn: async (data: InsertQuestion) => {
      return await apiRequest("POST", "/api/questions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions/student", (user as any)?.id] });
      setQuestionDialogOpen(false);
      questionForm.reset();
      toast({
        title: "Question submitted!",
        description: "Your question has been sent to your tutor.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('app.unauthorized'),
          description: t('app.unauthorized_logout'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t('app.error'),
        description: t('app.submit_error'),
        variant: "destructive",
      });
    },
  });

  // Student file upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async ({ homeworkId, file, notes }: { homeworkId: string; file: File; notes?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (notes) formData.append('notes', notes);
      
      return await apiRequest("POST", `/api/homework/${homeworkId}/student-upload`, formData, {
        'Content-Type': 'multipart/form-data'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homework/student-submissions"] });
      setUploadDialogOpen(false);
      setSelectedHomework(null);
      studentFileForm.reset();
      toast({
        title: "File uploaded successfully!",
        description: "Your homework submission has been uploaded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error?.response?.data?.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete student submission mutation
  const deleteSubmissionMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      return await apiRequest("DELETE", `/api/homework/student-submission/${submissionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/homework/student-submissions"] });
      toast({
        title: "Submission deleted",
        description: "Your homework submission has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error?.response?.data?.message || "Failed to delete submission.",
        variant: "destructive",
      });
    },
  });

  // Booking mutation
  const bookSlotMutation = useMutation({
    mutationFn: async ({ slotId, notes }: { slotId: string; notes?: string }) => {
      return await apiRequest("POST", "/api/availability/book", { slotId, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({
        title: "Session Booked!",
        description: "Your tutoring session has been booked successfully. You'll receive a confirmation email.",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('app.unauthorized'),
          description: t('app.unauthorized_logout'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Booking Failed",
        description: error?.response?.data?.message || "Failed to book session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onQuestionSubmit = (data: InsertQuestion) => {
    questionMutation.mutate(data);
  };

  const onFileUpload = (data: { file: File; notes?: string }) => {
    if (!selectedHomework) return;
    uploadFileMutation.mutate({
      homeworkId: selectedHomework.id,
      file: data.file,
      notes: data.notes
    });
  };

  const handleUploadClick = (homework: Homework) => {
    setSelectedHomework(homework);
    setUploadDialogOpen(true);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: t('app.unauthorized'),
        description: t('app.unauthorized_logout'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Authentication Required</h2>
          <p className="text-slate-600 mb-6">Please log in to access the student portal.</p>
          <a href="/api/login">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Login
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <div className="text-2xl font-bold text-blue-600 flex items-center cursor-pointer">
                  <BookOpen className="w-8 h-8 mr-2" />
                  LukaMath
                </div>
              </Link>
              <span className="ml-4 text-slate-500">{t('app.student_portal')}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "hr" : "en")}
                className="text-slate-600 hover:text-blue-600"
              >
                <Globe className="w-4 h-4 mr-1" />
                {language === "en" ? "HR" : "EN"}
              </Button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <User className="w-4 h-4" />
                  <span>{(user as any)?.firstName || (user as any)?.email || "Student"}</span>
                </div>
                <Link href="/pwa">
                  <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                    <Smartphone className="w-4 h-4 mr-1" />
                    {t('app.pwa_app')}
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-1" />
                    {t('app.home')}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Clear the JWT token from localStorage
                    localStorage.removeItem('lukamath_auth_token');
                    // Redirect to home page
                    window.location.href = '/';
                  }}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  {t('app.logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {`${t('app.welcome_back')}, ${(user as any)?.firstName || t('app.student')}!`}
          </h1>
          <p className="text-slate-600 mb-4">
            {t('app.track_manage')}
          </p>
          
          {/* Mobile App Promotion */}
          <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-500 p-1.5 rounded-md mr-2">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700">
                    {t('app.try_mobile_app')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('app.mobile_experience')}
                  </p>
                </div>
              </div>
              <Link href="/pwa">
                <Button size="sm" variant="outline" className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50">
                  {t('app.open')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="homework" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>{t('app.homework')}</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>{t('app.questions')}</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>{t('app.progress')}</span>
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{t('app.terms')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Homework Tab */}
          <TabsContent value="homework" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">{t('app.your_homework')}</h2>
            </div>

            {homeworkLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-slate-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (homework?.length || 0) === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('app.no_homework_yet')}</h3>
                  <p className="text-slate-600 text-center">
                    {t('app.tutor_will_assign')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {homework?.map((hw: Homework) => (
                  <Card key={hw.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{hw.title}</CardTitle>
                        <Badge 
                          variant={hw.status === "completed" ? "default" : hw.status === "in_progress" ? "secondary" : "outline"}
                          className={
                            hw.status === "completed" ? "bg-green-100 text-green-800" :
                            hw.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                            "bg-slate-100 text-slate-800"
                          }
                        >
                          {hw.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {hw.status === "in_progress" && <Clock className="w-3 h-3 mr-1" />}
                          {hw.status === "pending" && <AlertCircle className="w-3 h-3 mr-1" />}
                          {hw.status === "completed" ? t('app.completed') :
                           hw.status === "in_progress" ? t('app.in_progress_status') :
                           t('app.pending')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{t('app.subject')}: {hw.subject}</p>
                      {hw.dueDate && (
                        <p className="text-sm text-slate-600">
                          {t('app.due_date')}: {new Date(hw.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 mb-4">{hw.description}</p>

                      {/* DEBUG: Log homework data */}
                      <script>{console.log('Homework data:', hw, 'Files:', (allHomeworkFiles as any)[hw.id], 'Submissions:', (studentSubmissions as any)[hw.id])}</script>

                      {/* Homework File Attachments */}
                      {(allHomeworkFiles as any)[hw.id] && (allHomeworkFiles as any)[hw.id].length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-slate-900 mb-2">Attachments:</p>
                          <div className="space-y-1">
                            {(allHomeworkFiles as any)[hw.id].map((file: HomeworkFile) => (
                              <div key={file.id} className="flex items-center justify-between bg-slate-50 p-2 rounded border">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 mr-2 text-slate-500" />
                                  <span className="text-sm text-slate-700">{file.fileName}</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(file.fileUrl, '_blank')}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Student Submissions */}
                      {(studentSubmissions as any)[hw.id] && (studentSubmissions as any)[hw.id].length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-slate-900 mb-2">Your Submissions:</p>
                          <div className="space-y-1">
                            {(studentSubmissions as any)[hw.id].map((submission: any) => (
                              <div key={submission.id} className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 mr-2 text-green-600" />
                                  <div>
                                    <span className="text-sm text-slate-700">{submission.originalName}</span>
                                    {submission.notes && (
                                      <p className="text-xs text-slate-500 mt-1">{submission.notes}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(submission.fileUrl, '_blank')}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteSubmissionMutation.mutate(submission.id)}
                                    className="text-red-600 hover:text-red-700"
                                    disabled={deleteSubmissionMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upload Button */}
                      <div className="mb-4">
                        <Button
                          size="sm"
                          onClick={() => handleUploadClick(hw)}
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Homework
                        </Button>
                      </div>

                      {hw.feedback && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900 mb-1">{t('app.feedback')}:</p>
                          <p className="text-sm text-blue-800">{hw.feedback}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">{t('app.questions_answers')}</h2>
              <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    <p>Postavi pitanje</p>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Ask a Question</DialogTitle>
                  </DialogHeader>
                  <Form {...questionForm}>
                    <form onSubmit={questionForm.handleSubmit(onQuestionSubmit)} className="space-y-4">
                      <FormField
                        control={questionForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('app.subject')}</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Algebra, Calculus" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={questionForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('app.question_title_label')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('app.question_placeholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={questionForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('app.question_details_label')}</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={t('app.content_placeholder')}
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setQuestionDialogOpen(false)}>
                          {t('app.cancel')}
                        </Button>
                        <Button type="submit" disabled={questionMutation.isPending}>
                          {questionMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {t('app.submitting')}
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              {t('app.submit_question_btn')}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {/* File Upload Dialog */}
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Submit Homework File</DialogTitle>
                  </DialogHeader>
                  <Form {...studentFileForm}>
                    <form onSubmit={studentFileForm.handleSubmit(onFileUpload)} className="space-y-4">
                      <FormField
                        control={studentFileForm.control}
                        name="file"
                        render={({ field: { onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Upload File</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) onChange(file);
                                }}
                                {...field}
                              />
                            </FormControl>
                            <p className="text-xs text-slate-500">Max file size: 50MB. Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={studentFileForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add any notes about your submission..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={uploadFileMutation.isPending}>
                          {uploadFileMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload File
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {questionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-20 bg-slate-200 rounded mb-4"></div>
                    <div className="h-16 bg-slate-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (questions?.length || 0) === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('app.no_questions_yet')}</h3>
                  <p className="text-slate-600 text-center mb-6">
                    {t('app.ask_first_question_desc')}
                  </p>
                  <Button onClick={() => setQuestionDialogOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('app.ask_first_question')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions?.map((question: Question) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{question.subject}</CardTitle>
                        <Badge variant={question.isAnswered ? "default" : "secondary"}>
                          {question.isAnswered ? t('app.answered') : t('app.pending')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        {t('app.asked_on')} {new Date(question.createdAt).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">{t('app.your_question')}:</h4>
                        <p className="text-slate-700">{question.content}</p>
                      </div>
                      {question.isAnswered && question.answer && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">{t('app.answer')}:</h4>
                          <p className="text-green-800">{question.answer}</p>
                          {question.answeredAt && (
                            <p className="text-sm text-green-600 mt-2">
                              {t('app.answered_on_date')} {new Date(question.answeredAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">{t('app.your_progress')}</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('app.homework_statistics')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{t('app.total_assignments')}:</span>
                      <span className="font-semibold">{homework?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{t('app.completed_count')}:</span>
                      <span className="font-semibold text-green-600">
                        {homework?.filter((hw: Homework) => hw.status === "completed")?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{t('app.pending_count')}:</span>
                      <span className="font-semibold text-slate-600">
                        {homework?.filter((hw: Homework) => hw.status === "pending")?.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('app.qa_activity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{t('app.total_questions')}:</span>
                      <span className="font-semibold">{questions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{t('app.answered_count')}:</span>
                      <span className="font-semibold text-green-600">
                        {questions?.filter((q: Question) => q.isAnswered)?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{t('app.unanswered')}:</span>
                      <span className="font-semibold text-yellow-600">
                        {questions?.filter((q: Question) => !q.isAnswered)?.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Tracking Graph */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>{t('app.progress_chart')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {progressLoading ? (
                  <div className="h-64 bg-slate-200 animate-pulse rounded"></div>
                ) : ((progress as any[])?.length || 0) === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p>{t('app.no_progress_data')}</p>
                      <p className="text-sm">{t('app.no_progress_data')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-slate-600">Progress Chart</p>
                      <p className="text-sm text-slate-500">Visual progress tracking coming soon</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grading Rubric */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Grading Rubric</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-green-600 fill-current" />
                          <Star className="w-4 h-4 text-green-600 fill-current" />
                          <Star className="w-4 h-4 text-green-600 fill-current" />
                          <Star className="w-4 h-4 text-green-600 fill-current" />
                          <Star className="w-4 h-4 text-green-600 fill-current" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-800">Excellent (90-100%)</h4>
                          <p className="text-sm text-green-700">Complete understanding, clear explanations, all work shown</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-blue-600 fill-current" />
                          <Star className="w-4 h-4 text-blue-600 fill-current" />
                          <Star className="w-4 h-4 text-blue-600 fill-current" />
                          <Star className="w-4 h-4 text-blue-600 fill-current" />
                          <Star className="w-4 h-4 text-blue-200" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800">Good (80-89%)</h4>
                          <p className="text-sm text-blue-700">Good understanding, minor errors, mostly complete work</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-600 fill-current" />
                          <Star className="w-4 h-4 text-yellow-600 fill-current" />
                          <Star className="w-4 h-4 text-yellow-600 fill-current" />
                          <Star className="w-4 h-4 text-yellow-200" />
                          <Star className="w-4 h-4 text-yellow-200" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-yellow-800">Satisfactory (70-79%)</h4>
                          <p className="text-sm text-yellow-700">Basic understanding, some errors, incomplete work</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-red-600 fill-current" />
                          <Star className="w-4 h-4 text-red-600 fill-current" />
                          <Star className="w-4 h-4 text-red-200" />
                          <Star className="w-4 h-4 text-red-200" />
                          <Star className="w-4 h-4 text-red-200" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-800">Needs Improvement (Below 70%)</h4>
                          <p className="text-sm text-red-700">Limited understanding, major errors, significant gaps</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Assessment Criteria:</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>• <strong>Mathematical Accuracy:</strong> Correct calculations and final answers</li>
                      <li>• <strong>Problem-Solving Process:</strong> Clear steps and logical reasoning</li>
                      <li>• <strong>Work Shown:</strong> All calculations and work displayed clearly</li>
                      <li>• <strong>Understanding:</strong> Evidence of conceptual comprehension</li>
                      <li>• <strong>Presentation:</strong> Neat, organized, and easy to follow</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">{t('app.schedule_session')}</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{t('app.terms')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availabilityLoading ? (
                  <div className="h-64 bg-slate-200 animate-pulse rounded"></div>
                ) : ((availability as any[])?.length || 0) === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p>{t('app.no_availability')}</p>
                      <p className="text-sm">{t('app.schedule_session_desc')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-600 mb-4">Available time slots for tutoring sessions:</p>
                    <div className="grid gap-3">
                      {(availability as any[])?.map((slot: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {new Date(slot.date).toLocaleDateString('en-US', { 
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-slate-600">
                                {slot.startTime} - {slot.endTime}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-transform"
                            onClick={() => bookSlotMutation.mutate({ slotId: slot.id })}
                            disabled={bookSlotMutation.isPending}
                          >
                            {bookSlotMutation.isPending ? 'Booking...' : t('app.book_session_btn')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default StudentApp;
