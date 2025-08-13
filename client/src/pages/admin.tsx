import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Home,
  LogOut,
  Shield,
  TrendingUp,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Paperclip,
  X
} from "lucide-react";

// Form schemas
const homeworkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  instructions: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  dueDate: z.string().optional(),
  studentId: z.string().min(1, "Student is required"),
});

const availabilitySchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  notes: z.string().optional(),
});

function AdminDashboard() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [homeworkDialogOpen, setHomeworkDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);

  // Data queries with proper typing
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/admin/students"],
  }) as { data: any[]; isLoading: boolean };

  const { data: allHomework = [], isLoading: homeworkLoading } = useQuery({
    queryKey: ["/api/admin/homework"],
  }) as { data: any[]; isLoading: boolean };

  const { data: allQuestions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/admin/questions"],
  }) as { data: any[]; isLoading: boolean };

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/admin/contacts"],
  }) as { data: any[]; isLoading: boolean };

  const { data: availability = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ["/api/availability"],
  }) as { data: any[]; isLoading: boolean };

  // Forms
  const homeworkForm = useForm({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
      subject: "",
      difficulty: "medium" as const,
      dueDate: "",
      studentId: "",
    },
  });

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const availabilityForm = useForm({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      date: "",
      startTime: "",
      endTime: "",
      notes: "",
    },
  });

  // Mutations
  const createHomeworkMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create the homework
      const homework = await apiRequest("POST", "/api/homework", data);

      // Then upload any attached files
      if (attachedFiles.length > 0) {
        const formData = new FormData();
        attachedFiles.forEach(file => {
          formData.append('files', file);
        });
        formData.append('homeworkId', (homework as any).id);
        formData.append('purpose', 'assignment');

        await fetch("/api/homework/files", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
      }

      return homework;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/homework"] });
      setHomeworkDialogOpen(false);
      homeworkForm.reset();
      setAttachedFiles([]);
    },
  });

  const createAvailabilityMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/availability", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      setAvailabilityDialogOpen(false);
      availabilityForm.reset();
    },
  });

  const answerQuestionMutation = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: string }) =>
      apiRequest("PATCH", `/api/questions/${questionId}/answer`, { answer }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/questions"] });
    },
  });

  const stats = {
    totalStudents: students?.length || 0,
    pendingHomework: allHomework?.filter((hw: any) => hw.status === "pending")?.length || 0,
    unansweredQuestions: allQuestions?.filter((q: any) => !q.isAnswered)?.length || 0,
    newContacts: contacts?.filter((c: any) =>
      new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )?.length || 0,
  };

  // Check if user is admin - after all hooks are defined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || (user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Access Denied</h2>
          <p className="text-slate-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <Link href="/">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
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
                  <Shield className="w-8 h-8 mr-2" />
                  LukaMath Admin
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>{(user as any)?.firstName || (user as any)?.email || "Admin"}</span>
              </div>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-1" />
                  Main Site
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
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600">
            Manage students, assignments, questions, and scheduling.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Students</span>
            </TabsTrigger>
            <TabsTrigger value="homework" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Homework</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Q&A</span>
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Scheduling</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Homework</CardTitle>
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingHomework}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unanswered Questions</CardTitle>
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.unansweredQuestions}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Contacts</CardTitle>
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.newContacts}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-slate-200 animate-pulse rounded"></div>
                    ))}
                  </div>
                ) : (contacts?.length || 0) === 0 ? (
                  <p className="text-slate-500">No contact submissions yet.</p>
                ) : (
                  <div className="space-y-4">
                    {contacts?.slice(0, 5)?.map((contact: any) => (
                      <div key={contact.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-slate-900">{contact.name}</h4>
                            <span className="text-sm text-slate-500">
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{contact.email}</p>
                          <p className="text-sm text-slate-700 mt-1">{contact.subject}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Students</CardTitle>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-slate-200 animate-pulse rounded"></div>
                    ))}
                  </div>
                ) : (students?.length || 0) === 0 ? (
                  <p className="text-slate-500">No students registered yet.</p>
                ) : (
                  <div className="space-y-4">
                    {students?.map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">
                              {student.firstName} {student.lastName}
                            </h4>
                            <p className="text-sm text-slate-600">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-sm text-slate-500">
                          Joined {new Date(student.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Homework Tab */}
          <TabsContent value="homework" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Homework Management</h2>
              <Dialog open={homeworkDialogOpen} onOpenChange={setHomeworkDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Homework Assignment</DialogTitle>
                  </DialogHeader>
                  <Form {...homeworkForm}>
                    <form
                      onSubmit={homeworkForm.handleSubmit((data) => 
                        createHomeworkMutation.mutate(data)
                      )}
                      className="space-y-4"
                    >
                      <FormField
                        control={homeworkForm.control}
                        name="studentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a student" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {students?.map((student: any) => (
                                  <SelectItem key={student.id} value={student.id}>
                                    {student.firstName} {student.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={homeworkForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Assignment title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={homeworkForm.control}
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
                        control={homeworkForm.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={homeworkForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Assignment description..."
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={homeworkForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date (Optional)</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* File Attachments */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Attachments (Optional)</label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('file-input')?.click()}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Paperclip className="w-4 h-4 mr-2" />
                            Attach Files
                          </Button>
                          <input
                            id="file-input"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.txt"
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setAttachedFiles(prev => [...prev, ...files]);
                            }}
                          />
                        </div>
                        {attachedFiles.length > 0 && (
                          <div className="space-y-1">
                            {attachedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                                <span className="text-slate-700 truncate">{file.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                                  className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setHomeworkDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createHomeworkMutation.isPending}>
                          {createHomeworkMutation.isPending ? "Creating..." : "Create Assignment"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Homework List */}
            <Card>
              <CardContent className="p-0">
                {homeworkLoading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-slate-200 animate-pulse rounded"></div>
                    ))}
                  </div>
                ) : allHomework.length === 0 ? (
                  <div className="p-6">
                    <p className="text-slate-500">No assignments created yet.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {allHomework.map((hw: any) => (
                      <div key={hw.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-slate-900">{hw.title}</h3>
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
                            <p className="text-sm text-slate-600 mb-2">{hw.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <span>Subject: {hw.subject}</span>
                              <span>Difficulty: {hw.difficulty}</span>
                              {hw.dueDate && (
                                <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Student Questions</h2>
            
            {questionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="h-20 bg-slate-200 animate-pulse rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : allQuestions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No questions yet</h3>
                  <p className="text-slate-600 text-center">
                    Student questions will appear here when they ask for help.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {allQuestions.map((question: any) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{question.subject}</CardTitle>
                          <p className="text-sm text-slate-500">
                            Asked by {question.studentName} on {new Date(question.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={question.isAnswered ? "default" : "secondary"}>
                          {question.isAnswered ? "Answered" : "Pending"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Question:</h4>
                        <p className="text-slate-700">{question.content}</p>
                      </div>
                      {question.isAnswered && question.answer ? (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">Your Answer:</h4>
                          <p className="text-green-800">{question.answer}</p>
                        </div>
                      ) : (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <Textarea 
                            placeholder="Type your answer here..."
                            className="mb-2"
                            id={`answer-${question.id}`}
                          />
                          <Button 
                            size="sm"
                            onClick={() => {
                              const textarea = document.getElementById(`answer-${question.id}`) as HTMLTextAreaElement;
                              if (textarea?.value.trim()) {
                                answerQuestionMutation.mutate({
                                  questionId: question.id,
                                  answer: textarea.value.trim()
                                });
                              }
                            }}
                            disabled={answerQuestionMutation.isPending}
                          >
                            {answerQuestionMutation.isPending ? "Submitting..." : "Submit Answer"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Availability Management</h2>
              <Dialog open={availabilityDialogOpen} onOpenChange={setAvailabilityDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Availability
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Available Time Slot</DialogTitle>
                  </DialogHeader>
                  <Form {...availabilityForm}>
                    <form
                      onSubmit={availabilityForm.handleSubmit((data) => 
                        createAvailabilityMutation.mutate(data)
                      )}
                      className="space-y-4"
                    >
                      <FormField
                        control={availabilityForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={availabilityForm.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={availabilityForm.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={availabilityForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Morning session" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setAvailabilityDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createAvailabilityMutation.isPending}>
                          {createAvailabilityMutation.isPending ? "Adding..." : "Add Slot"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Available Time Slots</CardTitle>
              </CardHeader>
              <CardContent>
                {availabilityLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-slate-200 animate-pulse rounded"></div>
                    ))}
                  </div>
                ) : availability.length === 0 ? (
                  <p className="text-slate-500">No availability slots created yet.</p>
                ) : (
                  <div className="space-y-4">
                    {availability.map((slot: any) => (
                      <div key={slot.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-blue-600" />
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
                              {slot.notes && ` • ${slot.notes}`}
                            </p>
                          </div>
                        </div>
                        <Badge variant={slot.isAvailable ? "default" : "secondary"}>
                          {slot.isAvailable ? "Available" : "Booked"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );

  // Handle loading and authentication states AFTER all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">Please log in to access the admin dashboard.</p>
          <a href="/api/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </div>
      </div>
    );
  }

}

export default AdminDashboard;
