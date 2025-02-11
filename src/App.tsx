import "./App.css";
import NewFormPage from "./NewFormPage";
import EditFormPage from "./EditFormPage";
import ViewFormPage from "./ViewFormPage";
import PreviewFormPage from "./PreviewFormPage";
import "@carbon/styles/css/styles.css";

import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { initializeKeycloak } from "./keycloak";
import { PrivateRoute } from "./PrivateRoute";

export const AuthenticationContext = createContext<any>(null);

const App: React.FC = () => {
  const [keycloak, setKeycloak] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    //Initialize Keycloak session
    const initKeycloak = async () => {

      const _keycloak = await initializeKeycloak();

      if (_keycloak?.authenticated) {
        setKeycloak(_keycloak);
      }
      setLoading(false);
    };
    initKeycloak();
  }, []);

  //Loading page when waiting for authentication
  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthenticationContext.Provider value={keycloak}>
      <Router>
        <Routes>
          {/* Route for new */}
          <Route path="/new" element={<PrivateRoute><NewFormPage /></PrivateRoute>} />

          {/* Renderer page*/}
          <Route path="/edit" element={<PrivateRoute><EditFormPage /></PrivateRoute>} />

          {/* View-only Renderer page */}
          <Route path="/view" element={<PrivateRoute><ViewFormPage /></PrivateRoute>} />
          <Route path="/preview" element={<PrivateRoute><PreviewFormPage /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthenticationContext.Provider>
  );
};

export default App;
