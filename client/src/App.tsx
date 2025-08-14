import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LanguageProvider } from "@/contexts/LanguageProvider";
import { AuthProvider } from "@/hooks/useAuthNew";
import { useEffect, lazy, Suspense } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { HelmetProvider } from 'react-helmet-async';

// Lazy load components for better performance - your original LukaMath pages
const Home = lazy(() => import("@/pages/home"));
const Blog = lazy(() => import("@/pages/blog"));
const AppFeatures = lazy(() => import("@/pages/app-features"));
import StudentApp from "@/pages/app-minimal";
const AdminDashboard = lazy(() => import("@/pages/admin"));
const AdminExport = lazy(() => import("@/pages/admin-export"));
const Register = lazy(() => import("@/pages/register"));
const RegisterNew = lazy(() => import("@/pages/register-new"));
const LoginNew = lazy(() => import("@/pages/login-new"));
const NotFound = lazy(() => import("@/pages/not-found"));
const PWAIndex = lazy(() => import("@/pages/pwa/index"));
const PWAAuth = lazy(() => import("@/pages/pwa/auth"));
const PWADashboard = lazy(() => import("@/pages/pwa/dashboard"));
const PWAHomework = lazy(() => import("@/pages/pwa/homework"));
const PWAProgress = lazy(() => import("@/pages/pwa/progress"));

// Loading component for your LukaMath brand
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading LukaMath...</p>
        <p className="text-sm text-gray-500 mt-2">Professional Math Tutoring</p>
      </div>
    </div>
  );
}

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          {/* Your original LukaMath routes */}
          <Route path="/" component={Home}/>
          <Route path="/blog" component={Blog}/>
          <Route path="/app-features" component={AppFeatures}/>
          <Route path="/app" component={StudentApp}/>
          <Route path="/admin" component={AdminDashboard}/>
          <Route path="/admin/export" component={AdminExport}/>
          <Route path="/register" component={Register}/>
          <Route path="/register-new" component={RegisterNew}/>
          <Route path="/login" component={LoginNew}/>
          <Route path="/pwa" component={PWAIndex}/>
          <Route path="/pwa/auth" component={PWAAuth}/>
          <Route path="/pwa/dashboard" component={PWADashboard}/>
          <Route path="/pwa/homework" component={PWAHomework}/>
          <Route path="/pwa/progress" component={PWAProgress}/>
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  // Initialize Google Analytics and performance optimizations
  useEffect(() => {
    console.log("🎓 LukaMath App Initializing...");
    
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }

    // Preload critical resources
    import('@/lib/preload').then(({ preloadCriticalResources, registerServiceWorker }) => {
      preloadCriticalResources();
      registerServiceWorker();
    }).catch(err => {
      console.warn('Preload failed:', err);
    });
    
    console.log("✅ LukaMath App Ready");
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
