
import Keycloak, {
    KeycloakInstance,
    KeycloakInitOptions,
    //KeycloakLoginOptions,
} from 'keycloak-js';
//const redirectUri = window.location.href || (import.meta.env.VITE_SSO_REDIRECT_URI as string);
// const loginOptions: KeycloakLoginOptions = {
//     redirectUri,
//     idpHint: '',
// };
// Keycloak instance using environment variables
const _kc: KeycloakInstance = new Keycloak({
    url: import.meta.env.VITE_SSO_AUTH_SERVER_URL as string,
    realm: import.meta.env.VITE_SSO_REALM as string,
    clientId: import.meta.env.VITE_SSO_CLIENT_ID as string,
});

// 🔹 Initialize Keycloak and return the instance if authenticated.
export const initializeKeycloak = async (): Promise<KeycloakInstance | void> => {
    try {
        console.log("Initializing Keycloak...");
        _kc.onTokenExpired = async () => {
            try {
                console.log('Token expired. Refreshing...');
                await _kc.updateToken(30);
            } catch (err) {
                console.error('Failed to refresh token:', err);
            }
        };
        const initOptions: KeycloakInitOptions = {
            pkceMethod: 'S256',
            checkLoginIframe: false,
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            enableLogging: true,
        };
        if (sessionStorage.getItem("ssoFailed")) {
            console.warn("SSO previously failed, skipping re-authentication.");
            return;
        }
        const auth: boolean = await _kc.init(initOptions);
        console.log("Authentication status:", auth);
        console.log("Checking session cookies:", document.cookie);
        console.log("Keycloak auth status:", _kc.authenticated);
        console.log("Keycloak token:", _kc.token ? "Token exists" : "No token");
        console.log("Keycloak refresh token:", _kc.refreshToken ? "Refresh token exists" : "No refresh token");
        if (!auth) {
            console.warn("No active session found. Marking SSO as failed.");
            sessionStorage.setItem("ssoFailed", "true");
            return;
        }
        return _kc;
    } catch (err) {
        console.error("Keycloak initialization error:", err);
        sessionStorage.setItem("ssoFailed", "true"); // Stop further retries
    }
};

// Custom logout function to trigger logout via Siteminder.
export const logout = (): void => {
    const ssoAuthServer = import.meta.env.VITE_SSO_AUTH_SERVER_URL as string;
    const ssoRealm = import.meta.env.VITE_SSO_REALM as string;
    const ssoRedirectUri = import.meta.env.VITE_SSO_REDIRECT_URI as string;
    const ssoClientId = import.meta.env.VITE_SSO_CLIENT_ID as string;
    const retUrl = `${ssoAuthServer}/realms/${ssoRealm}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(ssoRedirectUri)}&client_id=${ssoClientId}`;
    window.location.href = `https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl=${encodeURIComponent(retUrl)}`;
};
