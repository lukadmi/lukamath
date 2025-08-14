import React, { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  BookOpen, 
  Upload, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  User,
  Home,
  LogOut,
  Globe,
  FileText,
  Trash2,
  Star,
  Award
} from "lucide-react";
import { Link } from "wouter";

function StudentApp() {
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
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
  const { data: homework = [] } = useQuery({
    queryKey: ["/api/homework/student", (user as any)?.id],
    enabled: !!user && !!(user as any).id,
    retry: false,
  });

  // Student homework submissions query
  const { data: studentSubmissions = {} } = useQuery({
    queryKey: ["/api/homework/student-submissions", (user as any)?.id],
    queryFn: async () => {
      if (!homework || homework.length === 0) return {};
      
      const submissionsPromises = homework.map(async (hw: any) => {
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

  const handleUploadClick = (homework: any) => {
    console.log("Submit Homework button clicked!", homework);
    setSelectedHomework(homework);
    setUploadDialogOpen(true);
  };

  const onFileUpload = (data: { file: File; notes?: string }) => {
    if (!selectedHomework) return;
    uploadFileMutation.mutate({
      homeworkId: selectedHomework.id,
      file: data.file,
      notes: data.notes
    });
  };

  // Show login if not authenticated
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "hr" : "en")}
                className="text-slate-600 hover:text-blue-600"
              >
                <Globe className="w-4 h-4 mr-1" />
                {language === "en" ? "HR" : "EN"}
              </Button>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('lukamath_auth_token');
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
            Welcome back, {(user as any)?.firstName || "Student"}!
          </h1>
          <p className="text-slate-600 mb-4">
            Track your homework progress and manage your learning journey.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">Your Homework</h2>
          </div>

          {(homework?.length || 0) === 0 ? (
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
              {homework?.map((hw: any) => (
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
                        {hw.status === "completed" ? "Completed" :
                         hw.status === "in_progress" ? "In Progress" :
                         "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">Subject: {hw.subject}</p>
                    {hw.dueDate && (
                      <p className="text-sm text-slate-600">
                        Due Date: {new Date(hw.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 mb-4">{hw.description}</p>

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

                    {/* Submit Homework Button - THE CORE FIX */}
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
                        <p className="text-sm font-semibold text-blue-900 mb-1">Feedback:</p>
                        <p className="text-sm text-blue-800">{hw.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="mt-12 space-y-6">
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
                    <span className="font-semibold">{homework?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Completed:</span>
                    <span className="font-semibold text-green-600">
                      {homework?.filter((hw: any) => hw.status === "completed")?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Pending:</span>
                    <span className="font-semibold text-slate-600">
                      {homework?.filter((hw: any) => hw.status === "pending")?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Grading Rubric</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4 text-green-600 fill-current" />
                      ))}
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800">Excellent (90-100%)</h4>
                      <p className="text-sm text-green-700">Complete understanding</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-1">
                      {[1,2,3,4].map(i => (
                        <Star key={i} className="w-4 h-4 text-blue-600 fill-current" />
                      ))}
                      <Star className="w-4 h-4 text-blue-200" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800">Good (80-89%)</h4>
                      <p className="text-sm text-blue-700">Good understanding</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
      </main>
    </div>
  );
}

export default StudentApp;
