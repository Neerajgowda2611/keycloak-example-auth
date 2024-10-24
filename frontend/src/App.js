import useAuth from './hooks/useAuth';
import DataDisplay from './components/DataDisplay';

function App() {
  const { isAuthenticated, isLoading, login, logout, keycloak } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button
          onClick={login}
          className="bg-blue-500 text-white px-6 py-2 rounded"
        >
          Login with Keycloak
        </button>
      </div>
    );
  }

  return <DataDisplay keycloak={keycloak} onLogout={logout} />;
}

export default App;