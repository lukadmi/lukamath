import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Calculator, BookOpen, TrendingUp, MessageSquare, ArrowLeft, Clock, CheckCircle, AlertCircle, Calendar, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

type Language = 'en' | 'hr';

const translations = {
  en: {
    homework: "Homework",
    pending: "Pending", 
    completed: "Completed",
    overdue: "Overdue",
    dueDate: "Due Date",
    subject: "Subject",
    instructions: "Instructions",
    attachments: "Attachments",
    submit: "Submit",
    submitted: "Submitted",
    grade: "Grade",
    feedback: "Feedback",
    viewDetails: "View Details",
    markComplete: "Mark as Complete",
    downloadFile: "Download File",
    uploadFile: "Upload File",
    noHomework: "No homework found",
    submitSuccess: "Homework submitted successfully!",
    today: "Today",
    tomorrow: "Tomorrow",
    thisWeek: "This week",
    pastDue: "Past due",
    dashboard: "Dashboard",
    progress: "Progress",
    messages: "Messages",
    submittedForReview: "Your homework has been submitted for review.",
    submitError: "Failed to submit homework. Please try again.",
    error: "Error",
    submittedOn: "Submitted on"
  },
  hr: {
    homework: "Domaća zadaća",
    pending: "Na čekanju",
    completed: "Završeno", 
    overdue: "Zakasnilo",
    dueDate: "Datum dospijeća",
    subject: "Predmet",
    instructions: "Upute",
    attachments: "Prilozi",
    submit: "Predaj",
    submitted: "Predano",
    grade: "Ocjena",
    feedback: "Povratne informacije",
    viewDetails: "Pogledaj detalje",
    markComplete: "Označi kao završeno",
    downloadFile: "Preuzmi datoteku",
    uploadFile: "Učitaj datoteku",
    noHomework: "Nema domaće zadaće",
    submitSuccess: "Domaća zadaća je uspješno predana!",
    today: "Danas",
    tomorrow: "Sutra",
    thisWeek: "Ovaj tjedan",
    pastDue: "Zakasnilo",
    dashboard: "Aplikacija",
    progress: "Napredak", 
    messages: "Poruke",
    submittedForReview: "Vaša domaća zadaća je predana na pregled.",
    submitError: "Greška pri predavanju domaće zadaće. Molimo pokušajte ponovo.",
    error: "Greška",
    submittedOn: "Predano"
  }
};

export default function PWAHomework() {
  const [language, setLanguage] = useState<Language>('en');
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/pwa/auth');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') as Language;
    const storedLang = localStorage.getItem('pwa-language') as Language;
    setLanguage(langParam || storedLang || 'en');
  }, [isAuthenticated, setLocation]);

  const { data: homework = [], isLoading } = useQuery({
    queryKey: ['/api/homework', (user as any)?.id],
    enabled: !!(user as any)?.id
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { homeworkId: string; submission: string }) => {
      return await apiRequest('POST', '/api/homework/submit', data);
    },
    onSuccess: () => {
      toast({
        title: t.submitSuccess,
        description: t.submittedForReview
      });
      queryClient.invalidateQueries({ queryKey: ['/api/homework'] });
      setSelectedHomework(null);
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.submitError,
        variant: "destructive"
      });
    }
  });

  const t = translations[language];

  const pendingHomework = (homework as any[]).filter((hw: any) => hw.status === 'pending');
  const completedHomework = (homework as any[]).filter((hw: any) => hw.status === 'completed');
  const overdueHomework = (homework as any[]).filter((hw: any) => {
    const dueDate = new Date(hw.dueDate);
    const today = new Date();
    return dueDate < today && hw.status === 'pending';
  });

  const getDateLabel = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (due.toDateString() === today.toDateString()) return t.today;
    if (due.toDateString() === tomorrow.toDateString()) return t.tomorrow;
    if (due < today) return t.pastDue;
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return t.thisWeek;
    return due.toLocaleDateString();
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'completed') return 'bg-emerald-100 text-emerald-800';
    if (new Date(dueDate) < new Date()) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusIcon = (status: string, dueDate: string) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (new Date(dueDate) < new Date()) return <AlertCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const handleSubmit = (homeworkId: string) => {
    // In a real app, this would open a submission form
    submitMutation.mutate({
      homeworkId,
      submission: "Student submission content"
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{t.homework} - LukaMath Student App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href={`/pwa/dashboard?lang=${language}`}>
              <Button variant="ghost" size="sm" className="mr-3">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <BookOpen className="w-6 h-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-slate-800">{t.homework}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="text-xs">
              {t.pending} ({pendingHomework.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              {t.completed} ({completedHomework.length})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs">
              {t.overdue} ({overdueHomework.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {pendingHomework.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">{t.noHomework}</p>
                </div>
              ) : (
                pendingHomework.map((hw: any) => (
                  <Card key={hw.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-slate-800">{hw.title}</CardTitle>
                          <p className="text-sm text-slate-600 mt-1">{hw.subject}</p>
                        </div>
                        <Badge className={getStatusColor(hw.status, hw.dueDate)}>
                          {getStatusIcon(hw.status, hw.dueDate)}
                          <span className="ml-1">{getDateLabel(hw.dueDate)}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 mb-4">{hw.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-slate-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(hw.dueDate).toLocaleDateString()}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleSubmit(hw.id)}
                          disabled={submitMutation.isPending}
                        >
                          {submitMutation.isPending ? 'Submitting...' : t.submit}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="space-y-4">
              {completedHomework.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">{t.noHomework}</p>
                </div>
              ) : (
                completedHomework.map((hw: any) => (
                  <Card key={hw.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-slate-800">{hw.title}</CardTitle>
                          <p className="text-sm text-slate-600 mt-1">{hw.subject}</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t.completed}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 mb-4">{hw.description}</p>
                      {hw.grade && (
                        <div className="bg-emerald-50 p-3 rounded-lg mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-emerald-800">{t.grade}:</span>
                            <span className="text-lg font-bold text-emerald-600">{hw.grade}</span>
                          </div>
                          {hw.feedback && (
                            <p className="text-sm text-emerald-700 mt-2">{hw.feedback}</p>
                          )}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {t.submittedOn} {new Date(hw.submittedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="overdue" className="mt-6">
            <div className="space-y-4">
              {overdueHomework.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">{t.noHomework}</p>
                </div>
              ) : (
                overdueHomework.map((hw: any) => (
                  <Card key={hw.id} className="border-red-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-slate-800">{hw.title}</CardTitle>
                          <p className="text-sm text-slate-600 mt-1">{hw.subject}</p>
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {t.overdue}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 mb-4">{hw.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-red-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {language === 'en' ? 'Was due' : 'Trebalo do'} {new Date(hw.dueDate).toLocaleDateString()}
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleSubmit(hw.id)}
                          disabled={submitMutation.isPending}
                        >
                          {submitMutation.isPending ? 'Submitting...' : t.submit}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-1">
            <Link href={`/pwa/dashboard?lang=${language}`}>
              <Button variant="ghost" className="h-16 flex-col space-y-1 rounded-none">
                <Calculator className="w-5 h-5" />
                <span className="text-xs">{t.dashboard}</span>
              </Button>
            </Link>
            
            <Button variant="ghost" className="h-16 flex-col space-y-1 rounded-none bg-blue-50">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-blue-600">{t.homework}</span>
            </Button>
            
            <Link href={`/pwa/progress?lang=${language}`}>
              <Button variant="ghost" className="h-16 flex-col space-y-1 rounded-none">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs">{t.progress}</span>
              </Button>
            </Link>
            
            <Button variant="ghost" className="h-16 flex-col space-y-1 rounded-none">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">{t.messages}</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Bottom padding for fixed navigation */}
      <div className="h-16"></div>
    </div>
  );
}
