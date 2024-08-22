import { useState, useEffect } from "react";
import "./App.css";
import Presenter from "./Presenter";
import "@carbon/styles/css/styles.css";

const App: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<object>({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get("data");
    if (data) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(data));
        setJsonContent(decodedData);
      } catch (error) {
        console.error("Failed to parse data from URL:", error);
      }
    }
  }, []);

  return <Presenter data={jsonContent} />;
};

export default App;
