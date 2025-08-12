import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Calculator, BookOpen, TrendingUp, Calendar, MessageSquare, User, Settings, LogOut, Bell, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';

type Language = 'en' | 'hr';

const translations = {
  en: {
    dashboard: "Dashboard",
    welcome: "Welcome back",
    homework: "Homework",
    progress: "Progress",
    messages: "Messages",
    schedule: "Schedule",
    pending: "Pending",
    completed: "Completed",
    dueToday: "Due Today",
    overdue: "Overdue",
    viewAll: "View All",
    noHomework: "No homework assigned yet",
    noMessages: "No new messages",
    upcomingSession: "Upcoming Session",
    nextSession: "Next session with Luka",
    today: "Today",
    thisWeek: "This Week",
    recentActivity: "Recent Activity",
    mathLevel: "Math Level",
    currentGrade: "Current Grade",
    completionRate: "Completion Rate",
    logout: "Logout",
    readyForMath: "Ready to tackle some math?"
  },
  hr: {
    dashboard: "Aplikacija",
    welcome: "Dobrodošli natrag",
    homework: "Domaća zadaća",
    progress: "Napredak",
    messages: "Poruke", 
    schedule: "Termini",
    pending: "Na čekanju",
    completed: "Završeno",
    dueToday: "Dospijeva danas",
    overdue: "Zakasnilo",
    viewAll: "Pogledaj sve",
    noHomework: "Još nema dodijeljene domaće zadaće",
    noMessages: "Nema novih poruka",
    upcomingSession: "Nadolazeća sesija",
    nextSession: "Sljedeća sesija s Lukom",
    today: "Danas",
    thisWeek: "Ovaj tjedan",
    recentActivity: "Nedavna aktivnost",
    mathLevel: "Razina matematike",
    currentGrade: "Trenutna ocjena",
    completionRate: "Stopa završetka",
    logout: "Odjavi se",
    readyForMath: "Spremni za matematiku?"
  }
};

export default function PWADashboard() {
  const [language, setLanguage] = useState<Language>('en');
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

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

  const { data: homework = [] } = useQuery({
    queryKey: ['/api/homework', (user as any)?.id],
    enabled: !!(user as any)?.id
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/messages', (user as any)?.id],
    enabled: !!(user as any)?.id
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['/api/tutoring-sessions', (user as any)?.id],
    enabled: !!(user as any)?.id
  });

  const t = translations[language];

  const pendingHomework = (homework as any[]).filter((hw: any) => hw.status === 'pending');
  const completedHomework = (homework as any[]).filter((hw: any) => hw.status === 'completed');
  const todayHomework = (homework as any[]).filter((hw: any) => {
    const dueDate = new Date(hw.dueDate);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });

  const unreadMessages = (messages as any[]).filter((msg: any) => !msg.read);
  const nextSession = (sessions as any[]).find((session: any) => new Date(session.date) > new Date());

  const handleLogout = () => {
    localStorage.removeItem('pwa-language');
    window.location.href = '/api/logout';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{t.dashboard} - LukaMath Student App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-slate-800">LukaMath</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {unreadMessages.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadMessages.length}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            {t.welcome}, {(user as any)?.name?.split(' ')[0] || 'Student'}!
          </h2>
          <p className="text-slate-600">
            {t.readyForMath}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{pendingHomework.length}</div>
              <div className="text-sm text-slate-600">{t.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{completedHomework.length}</div>
              <div className="text-sm text-slate-600">{t.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Homework */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t.dueToday}</CardTitle>
              <Link href={`/pwa/homework?lang=${language}`}>
                <Button variant="ghost" size="sm">
                  {t.viewAll}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {todayHomework.length === 0 ? (
              <div className="text-center py-4">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">{t.noHomework}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayHomework.slice(0, 3).map((hw: any) => (
                  <div key={hw.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{hw.title}</h4>
                      <p className="text-sm text-slate-600">{hw.subject}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Session */}
        {nextSession && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {t.upcomingSession}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{t.nextSession}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(nextSession.date).toLocaleDateString()} at {new Date(nextSession.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-600">{nextSession.subject}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t.progress}</CardTitle>
              <Link href={`/pwa/progress?lang=${language}`}>
                <Button variant="ghost" size="sm">
                  {t.viewAll}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t.completionRate}</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t.currentGrade}</span>
                <span className="font-semibold text-green-600">B+</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href={`/pwa/homework?lang=${language}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-slate-800">{t.homework}</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={`/pwa/progress?lang=${language}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-medium text-slate-800">{t.progress}</p>
              </CardContent>
            </Card>
          </Link>
        </div>
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
            
            <Link href={`/pwa/homework?lang=${language}`}>
              <Button variant="ghost" className="h-16 flex-col space-y-1 rounded-none">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs">{t.homework}</span>
              </Button>
            </Link>
            
            <Link href={`/pwa/progress?lang=${language}`}>
              <Button variant="ghost" className="h-16 flex-col space-y-1 rounded-none">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs">{t.progress}</span>
              </Button>
            </Link>
            
            <Button variant="ghost" className="h-16 flex-col space-y-1 rounded-none">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">{t.messages}</span>
              {unreadMessages.length > 0 && (
                <Badge className="absolute top-2 right-2 h-4 w-4 rounded-full p-0 text-xs">
                  {unreadMessages.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Bottom padding for fixed navigation */}
      <div className="h-16"></div>
    </div>
  );
}
