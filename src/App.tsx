import "./App.css";
import NewFormPage from "./NewFormPage";
import EditFormPage from "./EditFormPage";
import ViewFormPage from "./ViewFormPage";
import PreviewFormPage from "./PreviewFormPage";
import PrintFormPage from "./PrintFormPage";
import UnauthorizedPage from "./UnauthorizedPage";
import "@carbon/styles/css/styles.css";
import React from "react";
import { Routes, Route } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Routes>
      {/* All routes are now public */}
      <Route path="/preview" element={<PreviewFormPage />} />
      <Route path="/printToPDF" element={<PrintFormPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/new" element={<NewFormPage />} />
      <Route path="/edit" element={<EditFormPage />} />
      <Route path="/view" element={<ViewFormPage />} />
    </Routes>
  );
};

export default App;
import "./App.css";
import NewFormPage from "./NewFormPage";
import EditFormPage from "./EditFormPage";
import ViewFormPage from "./ViewFormPage";
import PreviewFormPage from "./PreviewFormPage";
import PrintFormPage from "./PrintFormPage";
import UnauthorizedPage from "./UnauthorizedPage";
import "@carbon/styles/css/styles.css";
import React from "react";
import { Routes, Route } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Routes>
      {/* All routes are now public */}
      <Route path="/preview" element={<PreviewFormPage />} />
      <Route path="/printToPDF" element={<PrintFormPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/new" element={<NewFormPage />} />
      <Route path="/edit" element={<EditFormPage />} />
      <Route path="/view" element={<ViewFormPage />} />
    </Routes>
  );
};

export default App;
