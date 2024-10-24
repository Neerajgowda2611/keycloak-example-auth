import { initKeycloak,keycloak } from "../config/keycloak";
import { useState, useEffect } from 'react'; // Import useState and useEffect


const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      initKeycloak()
        .then((authenticated) => {
          setIsAuthenticated(authenticated);
          setIsLoading(false);
          if (authenticated) {
            // Print the access token
            console.log('Access Token:',keycloak().token); // Ensure this is logged correctly
          }
        })
        .catch((error) => {
          console.error('Failed to initialize Keycloak:', error);
          setIsLoading(false);
        });
    }, []);
  
    const login = () => {
      keycloak().login(); // Always use the singleton instance
    };
  
    const logout = () => {
      keycloak().logout(); // Always use the singleton instance
    };
  
    return {
      isAuthenticated,
      isLoading,
      login,
      logout,
      keycloak: keycloak() // Return the instance for other uses if needed
    };
  };
  
  export default useAuth;
  