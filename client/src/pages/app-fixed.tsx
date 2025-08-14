import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuthNew";
import { useLanguage } from "@/hooks/useLanguage";
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
import { Link } from "wouter";

// Import recharts more carefully
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

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
          const files = await apiRequest("GET", `/api/admin/homework/${hw.id}/files`);
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
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Simple Homework Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>{t('app.homework')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                {homework?.length || 0} assignments
              </p>
            </CardContent>
          </Card>

          {/* Simple Questions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>{t('app.questions')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                {questions?.length || 0} questions
              </p>
            </CardContent>
          </Card>

          {/* Simple Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>{t('app.progress')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Progress tracking
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default StudentApp;
