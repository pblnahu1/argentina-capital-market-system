import { MarketDataView } from './components/MarketDataView';
import { InstructionForm } from './components/InstructionForm';
import { InstructionTracker } from './components/InstructionTracker';
import { AuthForm } from './components/AuthForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LogOut } from 'lucide-react';

function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Argentine Capital Market System
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <MarketDataView />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InstructionForm />
            <InstructionTracker />
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthForm />;
}

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWrapper;