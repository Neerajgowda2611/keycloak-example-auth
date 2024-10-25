import { useState, useEffect } from 'react';
import { loginWithKeycloak } from '../config/keycloak';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('access_token');
      const authStatus = localStorage.getItem('isAuthenticated');
      
      if (token && authStatus === 'true') {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          if (tokenData.exp * 1000 > Date.now()) {
            setIsAuthenticated(true);
          } else {
            localStorage.clear();
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.clear();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = () => {
    loginWithKeycloak();
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    
    const logoutUrl = new URL(`${process.env.REACT_APP_KEYCLOAK_URL}/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/protocol/openid-connect/logout`);
    logoutUrl.searchParams.append('redirect_uri', window.location.origin);
    window.location.href = logoutUrl.toString();
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
};

export default useAuth;