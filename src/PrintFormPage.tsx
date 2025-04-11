import { useState, useEffect } from "react";
import "./App.css";
import Presenter from "./Presenter";
import "@carbon/styles/css/styles.css";


const PrintFormPage: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<object>({});


  useEffect(() => {

    const queryParams = new URLSearchParams(window.location.search);
    const params: { [key: string]: string | null } = {};

    // Iterate over all query parameters and store them in the params object
    queryParams.forEach((value, key) => {
      params[key] = value;
    });

    if (params) {

      handleLoadSavedJson(params);
    }


  }, []);

  const handleLoadSavedJson = async (params: { [key: string]: string | null }) => {

    try {
      const loadSavedJsonEndpoint = "/api/loadSavedJson";//import.meta.env.VITE_COMM_API_LOADSAVEDJSON_ENDPOINT_URL;
      console.log(loadSavedJsonEndpoint);

      const response = await fetch(loadSavedJsonEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...params

        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(result);
      setJsonContent(result);

    } catch (error) {
      console.error("Failed to generate template:", error);
    }
  };

  return <Presenter data={jsonContent} mode="preview" />;
};

export default PrintFormPage;