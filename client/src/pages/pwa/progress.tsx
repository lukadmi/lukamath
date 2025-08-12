import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Calculator, BookOpen, TrendingUp, MessageSquare, ArrowLeft, Award, BarChart, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';

type Language = 'en' | 'hr';

const translations = {
  en: {
    progress: "Progress",
    dashboard: "Dashboard",
    homework: "Homework",
    messages: "Messages",
    overview: "Overview",
    grades: "Grades",
    subjects: "Subjects",
    currentGrade: "Current Grade",
    completionRate: "Completion Rate",
    averageGrade: "Average Grade",
    homeworkCompleted: "Homework Completed",
    sessionsAttended: "Sessions Attended",
    improvementTrend: "Improvement Trend",
    gradeHistory: "Grade History",
    subjectPerformance: "Subject Performance",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    thisWeek: "This Week",
    excellent: "Excellent",
    good: "Good",
    needsWork: "Needs Work",
    algebra: "Algebra",
    geometry: "Geometry",
    calculus: "Calculus",
    statistics: "Statistics",
    recentAchievements: "Recent Achievements",
    goalProgress: "Goal Progress",
    masteredTopics: "Mastered Topics",
    strugglingAreas: "Areas to Improve",
    perfectScore: "Perfect Score!",
    algebrQuizResult: "Got 100% on Algebra Quiz #5",
    streakMaster: "Streak Master",
    newBadge: "New",
    homeworkStreak: "7 days of completed homework"
  },
  hr: {
    progress: "Napredak",
    dashboard: "Aplikacija",
    homework: "Domaća zadaća",
    messages: "Poruke",
    overview: "Pregled",
    grades: "Ocjene",
    subjects: "Predmeti",
    currentGrade: "Trenutna ocjena",
    completionRate: "Stopa završetka",
    averageGrade: "Prosjek ocjena",
    homeworkCompleted: "Završenih domaćih zadaća",
    sessionsAttended: "Prisustvovanih sesija",
    improvementTrend: "Trend poboljšanja",
    gradeHistory: "Povijest ocjena",
    subjectPerformance: "Uspjeh po predmetima",
    thisMonth: "Ovaj mjesec",
    lastMonth: "Prošli mjesec",
    thisWeek: "Ovaj tjedan",
    excellent: "Odličan",
    good: "Dobar",
    needsWork: "Treba porad",
    algebra: "Algebra",
    geometry: "Geometrija",
    calculus: "Funkcije",
    statistics: "Statistika",
    recentAchievements: "Nedavna postignuća",
    goalProgress: "Napredak prema cilju",
    masteredTopics: "Savladane teme",
    strugglingAreas: "Područja za poboljšanje",
    perfectScore: "Savršen rezultat!",
    algebrQuizResult: "Dobili ste 100% na kvizu iz algebre #5",
    streakMaster: "Majstor nizova",
    newBadge: "Novo",
    homeworkStreak: "7 dana završenih domaćih zadaća"
  }
};

// Mock data - in real app this would come from API
const gradeData = [
  { month: 'Sep', grade: 78 },
  { month: 'Oct', grade: 82 },
  { month: 'Nov', grade: 85 },
  { month: 'Dec', grade: 88 },
  { month: 'Jan', grade: 90 }
];

const subjectData = [
  { subject: 'Algebra', grade: 92, progress: 95 },
  { subject: 'Geometry', grade: 88, progress: 80 },
  { subject: 'Calculus', grade: 85, progress: 75 },
  { subject: 'Statistics', grade: 90, progress: 85 }
];

export default function PWAProgress() {
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

  const { data: progressData } = useQuery({
    queryKey: ['/api/progress', (user as any)?.id],
    enabled: !!(user as any)?.id
  });

  const t = translations[language];

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-emerald-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (grade: number) => {
    if (grade >= 90) return t.excellent;
    if (grade >= 80) return t.good;
    return t.needsWork;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{t.progress} - LukaMath Student App</title>
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
            <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
            <h1 className="text-xl font-bold text-slate-800">{t.progress}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">A-</div>
              <div className="text-sm text-slate-600">{t.currentGrade}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">89%</div>
              <div className="text-sm text-slate-600">{t.completionRate}</div>
            </CardContent>
          </Card>
        </div>

        {/* Grade Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              {t.gradeHistory}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="grade" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Target className="w-5 h-5 mr-2" />
              {t.subjectPerformance}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectData.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t[subject.subject.toLowerCase() as keyof typeof t] || subject.subject}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold ${getGradeColor(subject.grade)}`}>
                      {subject.grade}%
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getGradeColor(subject.grade)}`}
                    >
                      {getPerformanceLabel(subject.grade)}
                    </Badge>
                  </div>
                </div>
                <Progress value={subject.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Award className="w-5 h-5 mr-2" />
              {t.recentAchievements}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">
                  {t.perfectScore}
                </p>
                <p className="text-sm text-slate-600">
                  {t.algebrQuizResult}
                </p>
              </div>
              <Badge className="bg-emerald-600">
                {t.newBadge}
              </Badge>
            </div>

            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">
                  {t.streakMaster}
                </p>
                <p className="text-sm text-slate-600">
                  {t.homeworkStreak}
                </p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800">
                  {language === 'en' ? 'Topic Mastery' : 'Savladano gradivo'}
                </p>
                <p className="text-sm text-slate-600">
                  {language === 'en' ? 'Completed Quadratic Equations' : 'Završene kvadratne jednadžbe'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.thisMonth}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{t.homeworkCompleted}</span>
              <span className="font-semibold">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{t.sessionsAttended}</span>
              <span className="font-semibold">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{t.averageGrade}</span>
              <span className="font-semibold text-emerald-600">89%</span>
            </div>
          </CardContent>
        </Card>
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
            
            <Button variant="ghost" className="h-16 flex-col space-y-1 rounded-none bg-blue-50">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-blue-600">{t.progress}</span>
            </Button>
            
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
