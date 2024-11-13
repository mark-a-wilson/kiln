import { useState, useEffect } from "react";
import "./App.css";
import Presenter from "./Presenter";
import "@carbon/styles/css/styles.css";

const NewFormPage: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<object>({});  

  useEffect(() => {
    
    const queryParams = new URLSearchParams(window.location.search);
    const params: { [key: string]: string | null } = {};

        // Iterate over all query parameters and store them in the params object
    queryParams.forEach((value, key) => {
      params[key] = value;
    });
    
    if(params) {
      
      handleGenerateTemplate(params);
    }
    
  
  }, []);

  const handleGenerateTemplate = async (params: { [key: string]: string | null }) => {  
    
    try {
      const generateDataEndpoint = import.meta.env
        .VITE_COMM_API_GENERATE_ENDPOINT_URL;
        console.log(generateDataEndpoint);
      const response = await fetch(generateDataEndpoint, {
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
      setJsonContent(result.save_data);
     
    } catch (error) {
      console.error("Failed to generate template:", error);
    }
  };

  return <Presenter data={jsonContent} />;
};

export default NewFormPage;