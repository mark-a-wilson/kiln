import { useState, useEffect } from "react";
import "./App.css";
import Presenter from "./Presenter";
import "@carbon/styles/css/styles.css";
import { API } from "./utils/api";

const PrintFormPage: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<object>({});


  useEffect(() => {

    const queryParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(queryParams.entries()) as Record<string,string>;


    if (params) {

      handleLoadSavedJson(params);

      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState(
        { formParams: params },   
        document.title,
        cleanUrl
      );
    }


  }, []);

  const handleLoadSavedJson = async (params: { [key: string]: string | null }) => {

    try {

      const loadSavedJsonEndpoint = API.loadSavedJson;

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
      setJsonContent(result);

    } catch (error) {
      console.error("Failed to generate template:", error);
    }
  };

  return <Presenter data={jsonContent} mode="preview" />;
};

export default PrintFormPage;