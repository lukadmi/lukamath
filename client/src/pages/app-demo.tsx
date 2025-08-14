import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [submissions, setSubmissions] = useState<any>({});

  // Mock homework data
  const homework = [
    {
      id: "1",
      title: "Linear Equations Practice",
      subject: "Algebra",
      status: "pending",
      dueDate: "2024-01-20",
      description: "Practice solving linear equations with multiple variables. Complete exercises 1-15 from chapter 3.",
      feedback: null
    },
    {
      id: "2", 
      title: "Quadratic Functions",
      subject: "Algebra", 
      status: "completed",
      dueDate: "2024-01-15",
      description: "Graph quadratic functions and find their roots.",
      feedback: "Great work! Your graphing technique has improved significantly."
    }
  ];

  const handleUploadClick = (e: React.MouseEvent, hw: any) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Submit Homework button clicked for:", hw.title);
    setSelectedHomework(hw);
    setUploadDialogOpen(true);
  };

  const handleFileUpload = () => {
    if (!selectedFile || !selectedHomework) return;
    
    // Mock upload - add to submissions
    const newSubmission = {
      id: Date.now().toString(),
      originalName: selectedFile.name,
      notes: notes,
      uploadedAt: new Date().toISOString()
    };
    
    setSubmissions(prev => ({
      ...prev,
      [selectedHomework.id]: [...(prev[selectedHomework.id] || []), newSubmission]
    }));
    
    // Reset form
    setSelectedFile(null);
    setNotes("");
    setUploadDialogOpen(false);
    setSelectedHomework(null);
    
    alert(`File "${selectedFile.name}" uploaded successfully!`);
  };

  const handleDeleteSubmission = (homeworkId: string, submissionId: string) => {
    setSubmissions(prev => ({
      ...prev,
      [homeworkId]: prev[homeworkId]?.filter((sub: any) => sub.id !== submissionId) || []
    }));
    alert("Submission deleted successfully!");
  };

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
              <span className="ml-4 text-slate-500">Student Portal - Demo</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-slate-600">
                <Globe className="w-4 h-4 mr-1" />
                EN
              </Button>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span>Luka Test Student</span>
              </div>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, Luka!
          </h1>
          <p className="text-slate-600 mb-4">
            Track your homework progress and manage your learning journey.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">Your Homework</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {homework.map((hw) => (
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
                  <p className="text-sm text-slate-600">
                    Due Date: {new Date(hw.dueDate).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 mb-4">{hw.description}</p>

                  {/* Student Submissions */}
                  {submissions[hw.id] && submissions[hw.id].length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-slate-900 mb-2">Your Submissions:</p>
                      <div className="space-y-1">
                        {submissions[hw.id].map((submission: any) => (
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
                                onClick={() => alert("File download would start here")}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteSubmission(hw.id, submission.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Homework Button - THE FIXED VERSION */}
                  <div className="mb-4">
                    <Button
                      size="sm"
                      onClick={(e) => handleUploadClick(e, hw)}
                      className="bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all"
                      type="button"
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
                    <span className="font-semibold">{homework.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Completed:</span>
                    <span className="font-semibold text-green-600">
                      {homework.filter(hw => hw.status === "completed").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Pending:</span>
                    <span className="font-semibold text-slate-600">
                      {homework.filter(hw => hw.status === "pending").length}
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
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Upload File</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Max file size: 50MB. Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG</p>
              </div>
              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes about your submission..."
                  className="min-h-[80px] mt-1"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleFileUpload}
                  disabled={!selectedFile}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

export default StudentApp;
