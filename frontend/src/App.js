import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import DataDisplay from './components/DataDisplay';
import Callback from './components/Callback';

function App() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl mb-4">Loading...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <div className="min-h-screen flex items-center justify-center">
                <button
                  onClick={login}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
                >
                  Login with Keycloak
                </button>
              </div>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route path="/callback" element={<Callback />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <DataDisplay onLogout={logout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;