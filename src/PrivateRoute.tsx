import { useContext, useEffect, useState } from "react";
import { AuthenticationContext } from "./App";

interface Props {
    children: JSX.Element;
}

export function PrivateRoute({ children }: Props) {
    const keycloak = useContext(AuthenticationContext);
    const [initiatedLogin, setInitiatedLogin] = useState(false);

    useEffect(() => {
        if (keycloak && !keycloak.authenticated && !initiatedLogin) {
            if (!window.location.search.includes("code=")) {
                setInitiatedLogin(true); // prevent repeated attempts
                keycloak.login({
                    redirectUri: window.location.href,
                    idpHint: "idir",
                });
            } else {
                console.warn("Returned from Keycloak but still unauthenticated. Awaiting resolution.");
            }
        }
    }, [keycloak, initiatedLogin]);

    if (!keycloak) return <div>Loading authentication...</div>;
    if (!keycloak.authenticated) return <div>Redirecting to login...</div>;

    // Otherwise, render the protected component.
    return children;
}
