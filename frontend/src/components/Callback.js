import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const savedState = sessionStorage.getItem('oauth_state');

      if (!code || state !== savedState) {
        console.error('Invalid callback parameters');
        navigate('/');
        return;
      }

      try {
        // Exchange the code for tokens
        const response = await fetch('http://localhost:8000/exchange-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            redirect_uri: `${window.location.origin}/callback`,
          }),
        });

        if (!response.ok) {
          throw new Error('Token exchange failed');
        }

        const tokens = await response.json();
        
        // Store tokens and auth state
        localStorage.setItem('access_token', tokens.access_token);
        if (tokens.refresh_token) {
          localStorage.setItem('refresh_token', tokens.refresh_token);
        }
        localStorage.setItem('isAuthenticated', 'true');
        
        // Clear the state
        sessionStorage.removeItem('oauth_state');
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-xl mb-4">Completing authentication...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
};

export default Callback;