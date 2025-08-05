import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LanguageContext, type Language, translations } from "@/hooks/useLanguage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Send
} from "lucide-react";
import { Link } from "wouter";

// Language Provider Component
function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

function StudentAppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, language, setLanguage } = useContext(LanguageContext)!;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("homework");
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const queryClient = useQueryClient();

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
      const response = await apiRequest("POST", "/api/questions", data);
      return response.json();
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
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onQuestionSubmit = (data: InsertQuestion) => {
    questionMutation.mutate(data);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
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
              <span className="ml-4 text-slate-500">Student Portal</span>
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
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-1" />
                    Home
                  </Button>
                </Link>
                <a href="/api/logout">
                  <Button variant="ghost" size="sm">
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {(user as any)?.firstName || "Student"}!
          </h1>
          <p className="text-slate-600">
            Track your progress, submit homework, and ask questions.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="homework" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Homework</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Q&A</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Progress</span>
            </TabsTrigger>
          </TabsList>

          {/* Homework Tab */}
          <TabsContent value="homework" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Your Homework</h2>
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
            ) : homework.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="w-12 h-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No homework yet</h3>
                  <p className="text-slate-600 text-center">
                    Your tutor will assign homework that will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {homework.map((hw: Homework) => (
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
                          {hw.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">Subject: {hw.subject}</p>
                      {hw.dueDate && (
                        <p className="text-sm text-slate-600">
                          Due: {new Date(hw.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 mb-4">{hw.description}</p>
                      {hw.feedback && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900 mb-1">Feedback:</p>
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
              <h2 className="text-xl font-semibold text-slate-900">Questions & Answers</h2>
              <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Ask Question
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
                            <FormLabel>Subject</FormLabel>
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
                            <FormLabel>Question Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief description of your question" {...field} />
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
                            <FormLabel>Question Details</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your question in detail..."
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
                          Cancel
                        </Button>
                        <Button type="submit" disabled={questionMutation.isPending}>
                          {questionMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Submit Question
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
            ) : questions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No questions yet</h3>
                  <p className="text-slate-600 text-center mb-6">
                    Start by asking your first question to get personalized help.
                  </p>
                  <Button onClick={() => setQuestionDialogOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Ask Your First Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question: Question) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{question.subject}</CardTitle>
                        <Badge variant={question.isAnswered ? "default" : "secondary"}>
                          {question.isAnswered ? "Answered" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        Asked on {new Date(question.createdAt).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Your Question:</h4>
                        <p className="text-slate-700">{question.content}</p>
                      </div>
                      {question.isAnswered && question.answer && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">Answer:</h4>
                          <p className="text-green-800">{question.answer}</p>
                          {question.answeredAt && (
                            <p className="text-sm text-green-600 mt-2">
                              Answered on {new Date(question.answeredAt).toLocaleDateString()}
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
            <h2 className="text-xl font-semibold text-slate-900">Your Progress</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Homework Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total Assignments:</span>
                      <span className="font-semibold">{homework.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Completed:</span>
                      <span className="font-semibold text-green-600">
                        {homework.filter((hw: Homework) => hw.status === "completed").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">In Progress:</span>
                      <span className="font-semibold text-yellow-600">
                        {homework.filter((hw: Homework) => hw.status === "in_progress").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Pending:</span>
                      <span className="font-semibold text-slate-600">
                        {homework.filter((hw: Homework) => hw.status === "pending").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Q&A Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total Questions:</span>
                      <span className="font-semibold">{questions.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Answered:</span>
                      <span className="font-semibold text-green-600">
                        {questions.filter((q: Question) => q.isAnswered).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Pending:</span>
                      <span className="font-semibold text-yellow-600">
                        {questions.filter((q: Question) => !q.isAnswered).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function StudentApp() {
  return (
    <LanguageProvider>
      <StudentAppContent />
    </LanguageProvider>
  );
}