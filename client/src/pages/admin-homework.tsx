import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ObjectUploader } from '@/components/ObjectUploader';
import { Upload, FileText, Clock, User, GraduationCap, Download, CheckCircle, XCircle, Plus } from 'lucide-react';
import type { UploadResult } from '@uppy/core';

const homeworkSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  instructions: z.string().optional(),
  subject: z.enum(['middle', 'high-school', 'university', 'sat-act']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  dueDate: z.string().optional(),
});

type HomeworkData = z.infer<typeof homeworkSchema>;

export default function AdminHomework() {
  const [selectedHomework, setSelectedHomework] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<HomeworkData>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      studentId: '',
      title: '',
      description: '',
      instructions: '',
      subject: 'middle' as const,
      difficulty: 'medium' as const,
      dueDate: '',
    },
  });

  // Fetch data
  const { data: students = [] } = useQuery({
    queryKey: ['/api/admin/students'],
  });

  const { data: homework = [] } = useQuery({
    queryKey: ['/api/admin/homework'],
  });

  const { data: homeworkFiles = [] } = useQuery({
    queryKey: ['/api/homework/files', selectedHomework],
    enabled: !!selectedHomework,
  });

  // Mutations
  const createHomeworkMutation = useMutation({
    mutationFn: async (data: HomeworkData) => {
      const response = await fetch('/api/homework', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to create homework');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/homework'] });
      form.reset();
      toast({
        title: 'Success',
        description: 'Homework assignment created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create homework assignment',
        variant: 'destructive',
      });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({ homeworkId, fileName, fileUrl, fileType }: {
      homeworkId: string;
      fileName: string;
      fileUrl: string;
      fileType: string;
    }) => {
      const response = await fetch('/api/homework/files', {
        method: 'POST',
        body: JSON.stringify({
          homeworkId,
          fileName,
          fileUrl,
          fileType,
          purpose: 'assignment'
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to upload file metadata');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homework/files'] });
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    },
  });

  const getUploadParameters = async () => {
    const response = await fetch('/api/homework/upload-url', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to get upload URL');
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handleFileUpload = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (!selectedHomework) {
      toast({
        title: 'Error',
        description: 'Please select a homework assignment first',
        variant: 'destructive',
      });
      return;
    }

    if (result.successful) {
      result.successful.forEach((file) => {
        const fileName = file.name || 'unknown';
        const fileUrl = (file as any).uploadURL || '';
        const fileType = fileName.split('.').pop() || 'unknown';

        uploadFileMutation.mutate({
          homeworkId: selectedHomework,
          fileName,
          fileUrl,
          fileType,
        });
      });
    }
  };

  const onSubmit = (data: HomeworkData) => {
    createHomeworkMutation.mutate(data);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Homework Management</h1>
          <p className="text-gray-600">Create assignments and manage student files</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create New Homework */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Create New Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student *</Label>
                  <Select
                    value={form.watch('studentId')}
                    onValueChange={(value) => form.setValue('studentId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {(students as any[]).map((student: any) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.studentId && (
                    <p className="text-red-500 text-sm">{form.formState.errors.studentId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="e.g., Quadratic Equations Practice"
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Brief description of the assignment..."
                    className="min-h-[80px]"
                  />
                  {form.formState.errors.description && (
                    <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    {...form.register('instructions')}
                    placeholder="Detailed instructions for the student..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Select
                      value={form.watch('subject')}
                      onValueChange={(value) => form.setValue('subject', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="middle">Middle School Math</SelectItem>
                        <SelectItem value="high-school">High School Math</SelectItem>
                        <SelectItem value="university">University Math</SelectItem>
                        <SelectItem value="sat-act">SAT/ACT Prep</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty *</Label>
                    <Select
                      value={form.watch('difficulty')}
                      onValueChange={(value) => form.setValue('difficulty', value as 'easy' | 'medium' | 'hard')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    {...form.register('dueDate')}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createHomeworkMutation.isPending}
                  className="w-full hover:scale-105 transition-transform"
                >
                  {createHomeworkMutation.isPending ? 'Creating...' : 'Create Assignment'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Homework List & File Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Existing Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                {(homework as any[]).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No assignments created yet</p>
                ) : (
                  (homework as any[]).map((hw: any) => (
                    <div
                      key={hw.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedHomework === hw.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedHomework(selectedHomework === hw.id ? null : hw.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{hw.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{hw.description}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge className={getDifficultyColor(hw.difficulty)}>
                              {hw.difficulty}
                            </Badge>
                            <Badge className={getStatusColor(hw.status)}>
                              {hw.status.replace('_', ' ')}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-500">
                              <User className="w-4 h-4 mr-1" />
                              {hw.studentEmail}
                            </div>
                          </div>
                          {hw.dueDate && (
                            <div className="flex items-center text-sm text-gray-500 mt-2">
                              <Clock className="w-4 h-4 mr-1" />
                              Due: {format(new Date(hw.dueDate), 'MMM dd, yyyy HH:mm')}
                            </div>
                          )}
                        </div>
                        {hw.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      {/* File Management for Selected Homework */}
                      {selectedHomework === hw.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">Assignment Files</h5>
                            <ObjectUploader
                              maxNumberOfFiles={5}
                              maxFileSize={10485760}
                              onGetUploadParameters={getUploadParameters}
                              onComplete={handleFileUpload}
                              buttonClassName="hover:scale-105 transition-transform"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Files
                            </ObjectUploader>
                          </div>

                          <div className="space-y-2">
                            {(homeworkFiles as any[]).length === 0 ? (
                              <p className="text-gray-500 text-sm">No files uploaded yet</p>
                            ) : (
                              (homeworkFiles as any[]).map((file: any) => (
                                <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                    <span className="text-sm font-medium">{file.fileName}</span>
                                    <span className="text-xs text-gray-500 ml-2">({file.fileType})</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => window.open(file.fileUrl, '_blank')}
                                    className="hover:scale-105 transition-transform"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}