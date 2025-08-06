import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LanguageProvider } from "@/contexts/LanguageProvider";
import Home from "@/pages/home";
import Blog from "@/pages/blog";
import AppFeatures from "@/pages/app-features";
import StudentApp from "@/pages/app";
import AdminDashboard from "@/pages/admin";
import AdminExport from "@/pages/admin-export";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={Home}/>
        <Route path="/blog" component={Blog}/>
        <Route path="/app-features" component={AppFeatures}/>
        <Route path="/app" component={StudentApp}/>
        <Route path="/admin" component={AdminDashboard}/>
        <Route path="/admin/export" component={AdminExport}/>
        <Route path="/register" component={Register}/>
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
