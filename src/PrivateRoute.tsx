import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "./App";

interface Props {
    children: JSX.Element;
}

export function PrivateRoute({ children }: Props) {
    const keycloak = useContext(AuthenticationContext);
    const [localAuth, setLocalAuth] = useState<any>(null);
    const [initiatedLogin, setInitiatedLogin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usernameMatch = document.cookie.match(/(?:^|;\s*)username=([^;]+)/);
        const username = usernameMatch ? decodeURIComponent(usernameMatch[1]).trim() : null;

        if (username && username.length > 0) {
            // Skip Keycloak and use local auth fallback
            setLocalAuth({ authenticated: true });
            setLoading(false);
        } else if (keycloak && !keycloak.authenticated && !initiatedLogin) {
            if (!window.location.search.includes("code=")) {
                setInitiatedLogin(true); // prevent repeated attempts
                keycloak.login({
                    redirectUri: window.location.href,
                    idpHint: "idir",
                });
            } else {
                console.warn("Returned from Keycloak but still unauthenticated. Awaiting resolution.");
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [keycloak, initiatedLogin]);

    if (loading) return <div>Loading authentication...</div>;

    if (localAuth?.authenticated || keycloak?.authenticated) {
        return children;
    }

    return <div>Redirecting to login...</div>;
}
