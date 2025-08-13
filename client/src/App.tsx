import { useEffect } from "react";

// Lazy load components for better performance
const Home = lazy(() => import("@/pages/home"));
const Blog = lazy(() => import("@/pages/blog"));
const AppFeatures = lazy(() => import("@/pages/app-features"));
const StudentApp = lazy(() => import("@/pages/app"));
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

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
  console.log("App component rendering...");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">LukaMath</h1>
          <p className="text-gray-700 text-lg">
            Testing with QueryClient only...
          </p>
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">
              If you can see this message, React + QueryClient is working!
            </p>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
