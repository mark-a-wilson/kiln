import { useContext } from "react";
import { AuthenticationContext } from "./App";

interface Props {
    children: JSX.Element;
}

export function PrivateRoute({ children }: Props) {
    const keycloak = useContext(AuthenticationContext);

    // If keycloak is still loading
    if (keycloak === null) {
        return <div>Loading authentication...</div>;
    }

    // If keycloak is not authenticated, show an unauthorized message
    if (!keycloak?.authenticated) {
        return <div>You are not authorized to view this page.</div>;
    }

    // Otherwise, render the protected component.
    return children;
}
