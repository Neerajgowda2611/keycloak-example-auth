import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL || 'https://keycloak.cialabs.org',
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'myrealm',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'myclient1',
};

let keycloakInstance = null; // Singleton pattern for Keycloak instance

export const initKeycloak = () => {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig); // Only create if it doesn't exist
  }

  return keycloakInstance.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  });
};

// Function to get the keycloak instance
export const keycloak = () => keycloakInstance;
