import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL || 'https://keycloak.cialabs.org',
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'your_realm',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'your_client_id',
};

let keycloakInstance = null;

export const initKeycloak = () => {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  
  // Disable automatic token handling
  return keycloakInstance.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    flow: 'standard', // Use standard flow instead of implicit
  });
};

export const loginWithKeycloak = () => {
  if (!keycloakInstance) {
    initKeycloak();
  }
  
  // Generate random state for security
  const state = Math.random().toString(36).substring(7);
  sessionStorage.setItem('oauth_state', state);
  
  const redirectUri = `${window.location.origin}/callback`;
  
  // Manually construct authorization URL
  const authUrl = new URL(`${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth`);
  authUrl.searchParams.append('client_id', keycloakConfig.clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'openid profile');
  
  window.location.href = authUrl.toString();
};

export const keycloak = () => keycloakInstance;
