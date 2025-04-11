import { useState, useEffect, useContext } from "react";
import "./App.css";
import Presenter from "./Presenter";
import "@carbon/styles/css/styles.css";
import { AuthenticationContext } from "./App";
import { useNavigate } from 'react-router-dom';
import { API } from "./utils/api";
import LoadingOverlay from "./common/LoadingOverlay"; 

const NewFormPage: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<object>({});
  const keycloak = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const [isNewPageLoading, setIsNewPageLoading] = useState(false);

  useEffect(() => {

    const queryParams = new URLSearchParams(window.location.search);
    const params: { [key: string]: string | null } = {};

    // Iterate over all query parameters and store them in the params object
    queryParams.forEach((value, key) => {
      params[key] = value;
    });

    if (params) {

      handleGenerateTemplate(params);
    }


  }, []);

  const handleGenerateTemplate = async (params: { [key: string]: string | null }) => {
    setIsNewPageLoading(true);

    try {
      const generateDataEndpoint = API.generate;//import.meta.env.VITE_COMM_API_GENERATE_ENDPOINT_URL;
      console.log(generateDataEndpoint);

      const token = keycloak.token;
      console.log("KEYCLOAK", keycloak);

      const response = await fetch(generateDataEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...params,
          token,
        }),
      });
      console.log("RESPONSE", response);
      if (!response.ok) {
        const errorData = await response.json(); // Parse error response        
        throw new Error(errorData.error || "Something went wrong");
        
      } else {
        const result = await response.json();
        setJsonContent(result.save_data);
      }

    } catch (error) {      
      navigate("/error", { state: { message:  error instanceof Error ? error.message : String(error) } }); // Pass error
      console.error("Failed to generate template:", error);
    }
    finally {
      setIsNewPageLoading(false);
    }
  };

  return (
    <>    
    <LoadingOverlay isLoading={isNewPageLoading} message="Please wait while the form is being loaded." />
    <Presenter data={jsonContent} mode="edit" />
    </>
);
};

export default NewFormPage;