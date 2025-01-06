import "./App.css";
import NewFormPage from "./NewFormPage";
import EditFormPage from "./EditFormPage";
import ViewFormPage from "./ViewFormPage";
import PreviewFormPage from "./PreviewFormPage";
import "@carbon/styles/css/styles.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App: React.FC = () => {  
  return (
    <Router>
      <Routes>
        {/* Route for new */}
        <Route path="/new" element={<NewFormPage />} />

        {/* Renderer page */}
        <Route path="/edit" element={<EditFormPage />} />

        {/* View-only Renderer page*/}
        <Route path="/view" element={<ViewFormPage />} />
        <Route path="/preview" element={<PreviewFormPage />} />
      </Routes>
    </Router>
  );
};

export default App;
