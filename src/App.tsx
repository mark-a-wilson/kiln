
import "./App.css";
import NewFormPage from "./NewFormPage";
import EditFormPage from "./EditFormPage";
import ViewFormPage from "./ViewFormPage";
import PreviewFormPage from "./PreviewFormPage";
import PrintFormPage from "./PrintFormPage";
import UnauthorizedPage from "./UnauthorizedPage";
import "@carbon/styles/css/styles.css";
import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { initializeKeycloak } from "./keycloak";
import { PrivateRoute } from "./PrivateRoute";
export const AuthenticationContext = createContext<any>(null);
const App: React.FC = () => {
  const [keycloak, setKeycloak] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);
  const location = useLocation();
  // Public Routes
  const publicRoutes = ["/preview", "/unauthorized", "/printToPDF"];
  useEffect(() => {
    const initKeycloak = async () => {
      try {
        console.log("Initializing Keycloak...");
        const _keycloak = await initializeKeycloak();
        if (_keycloak?.authenticated) {
          console.log("User authenticated");
          setKeycloak(_keycloak);
        } else {
          console.warn("Keycloak authentication failed");
          setAuthFailed(true);
        }
      } catch (error) {
        console.error("Keycloak initialization error:", error);
        setAuthFailed(true);
      } finally {
        setLoading(false);
      }
    };
    if (!keycloak && !authFailed && !publicRoutes.includes(location.pathname)) {
      initKeycloak();
    } else {
      setLoading(false);
    }
  }, [location.pathname]);
  if (loading) {
    return <div>Loading authentication...</div>;
  }
  if (authFailed) {
    return <UnauthorizedPage />; // Shows unauthorized page instead of looping
  }
  return (
    <AuthenticationContext.Provider value={keycloak}>
      <Routes>
        {/* Public Routes */}
        <Route path="/preview" element={<PreviewFormPage />} />
        <Route path="/printToPDF" element={<PrintFormPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        {/* Protected Routes */}
        <Route path="/new" element={<PrivateRoute><NewFormPage /></PrivateRoute>} />
        <Route path="/edit" element={<PrivateRoute><EditFormPage /></PrivateRoute>} />
        <Route path="/view" element={<PrivateRoute><ViewFormPage /></PrivateRoute>} />
      </Routes>
    </AuthenticationContext.Provider>
  );
};
const WrappedApp = () => (
  <Router>
    <App />
  </Router>
);
export default WrappedApp;
