import React from "react";

function TestApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Student Portal - Test</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => alert('Button clicked!')}
          >
            Submit Homework (Test)
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestApp;
