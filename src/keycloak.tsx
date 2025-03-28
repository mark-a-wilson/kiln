import Keycloak, {
    KeycloakInstance,
    KeycloakInitOptions,
    KeycloakLoginOptions
} from 'keycloak-js';

const redirectUri = window.location.href || (import.meta.env.VITE_SSO_REDIRECT_URI as string);

const loginOptions: KeycloakLoginOptions = {
    redirectUri,
    idpHint: 'idir',
};

// Keycloak instance using environment variables
const _kc: KeycloakInstance = new Keycloak({
    url: import.meta.env.VITE_SSO_AUTH_SERVER_URL as string,
    realm: import.meta.env.VITE_SSO_REALM as string,
    clientId: import.meta.env.VITE_SSO_CLIENT_ID as string,
});

// Initialize Keycloak and return the instance if authenticated.
export const initializeKeycloak = async (): Promise<KeycloakInstance | void> => {
    try {
        // Set the token expiration handler.
        _kc.onTokenExpired = () => {
            // Optionally, specify a minimum validity (in seconds) to refresh.
            _kc.updateToken(5).catch((err) => console.error('Failed to update token:', err));
        };

        const initOptions: KeycloakInitOptions = {
            pkceMethod: 'S256',
            checkLoginIframe: false,
            onLoad: 'check-sso',
            silentCheckSsoFallback: false,
            silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
        };

        console.log("Initializing Keycloak...");
        const auth: boolean = await _kc.init(initOptions);
        console.log("Authentication status:", auth); // Debugging step

        if (auth) {
            console.log("Keycloak already authenticated.");
            return _kc;
        } else {
            //await silentLogin();
            _kc.login(loginOptions);
        }
    } catch (err) {
        console.error(err);
    }
};

/*const silentLogin = async () => {
    try {
        await _kc.login({
            prompt: 'none',  // Silent authentication (no UI)
            redirectUri: window.location.href, // Ensure the redirect goes back to the same page
        });
    } catch (err) {
        console.error("Silent authentication failed:", err);
    }
};*/

// Custom logout function to trigger logout via Siteminder.
export const logout = (): void => {
    const ssoAuthServer = import.meta.env.VITE_SSO_AUTH_SERVER_URL as string;
    const ssoRealm = import.meta.env.VITE_SSO_REALM as string;
    const ssoRedirectUri = import.meta.env.VITE_SSO_REDIRECT_URI as string;
    const ssoClientId = import.meta.env.VITE_SSO_CLIENT_ID as string;

    const retUrl = `${ssoAuthServer}/realms/${ssoRealm} /protocol/openid - connect / logout ? post_logout_redirect_uri = ${ssoRedirectUri}& client_id=${ssoClientId} `;

    window.location.href = `https://logon7.gov.bc.ca/clp-cgi/logoff.cgi?retnow=1&returl=${encodeURIComponent(retUrl)}`;
};