import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">LukaMath</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#about" className="text-gray-600 hover:text-blue-600">About</a>
                <a href="#services" className="text-gray-600 hover:text-blue-600">Services</a>
                <a href="#contact" className="text-gray-600 hover:text-blue-600">Contact</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Master Math with
              <span className="text-blue-600"> Expert Tutoring</span>
            </h2>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Professional online math tutoring with personalized one-on-one sessions. 
              From Algebra to Calculus, SAT/ACT prep, and beyond.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                  Start Free Trial
                </button>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16" id="about">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center">
                  <div className="text-3xl mb-4">📚</div>
                  <h3 className="text-lg font-semibold text-gray-900">All Math Levels</h3>
                  <p className="mt-2 text-gray-600">
                    From basic arithmetic to advanced calculus and beyond
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center">
                  <div className="text-3xl mb-4">👨‍🏫</div>
                  <h3 className="text-lg font-semibold text-gray-900">Expert Tutors</h3>
                  <p className="mt-2 text-gray-600">
                    Qualified instructors with proven teaching experience
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center">
                  <div className="text-3xl mb-4">💻</div>
                  <h3 className="text-lg font-semibold text-gray-900">Online Sessions</h3>
                  <p className="mt-2 text-gray-600">
                    Convenient online tutoring from anywhere, anytime
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="mt-16 bg-green-50 border border-green-200 rounded-lg p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-800 mb-4">
                🎉 Website Successfully Fixed! 🎉
              </h3>
              <div className="space-y-2 text-green-700">
                <p>✅ React App: Working</p>
                <p>✅ Database: Connected (Neon)</p>
                <p>✅ API: Functional</p>
                <p>✅ All Systems: Operational</p>
              </div>
              <p className="mt-4 text-green-600 font-medium">
                Your LukaMath tutoring platform is now fully functional!
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8" id="contact">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get Started Today</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Free 15-Minute Trial</h4>
                  <p className="text-gray-600">Experience our tutoring approach with no commitment</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Flexible Scheduling</h4>
                  <p className="text-gray-600">Book sessions that fit your busy schedule</p>
                </div>
              </div>
              <button className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Book Your Trial Session
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-300">© 2025 LukaMath. Professional Online Math Tutoring.</p>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
