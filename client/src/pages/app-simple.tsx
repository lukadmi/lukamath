import React from "react";
import { useAuth } from "@/hooks/useAuthNew";
import { useLanguage } from "@/hooks/useLanguage";

function StudentAppSimple() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Authentication Required</h2>
          <p className="text-slate-600 mb-6">Please log in to access the student portal.</p>
          <a href="/api/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Student Portal - {(user as any)?.firstName || "Student"}
        </h1>
        <p className="text-slate-600">
          Welcome to your student portal. The full features are being loaded...
        </p>
      </div>
    </div>
  );
}

export default StudentAppSimple;
