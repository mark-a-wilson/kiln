import { useState, useEffect, useContext } from "react";
import "./App.css";
import Presenter from "./Presenter";
import "@carbon/styles/css/styles.css";
import { AuthenticationContext } from "./App";
import { useNavigate } from 'react-router-dom';
import { API } from "./utils/api";
import LoadingOverlay from "./common/LoadingOverlay";


const EditFormPage: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<object>({});
  const keycloak = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const [isEditPageLoading, setIsEditPageLoading] = useState(false);

  useEffect(() => {

    const queryParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(queryParams.entries()) as Record<string,string>;


    if (params) {

      handleLoadTemplate(params);

      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState(
        { formParams: params },   
        document.title,
        cleanUrl
      );
    }


  }, []);

  const handleLoadTemplate = async (params: { [key: string]: string | null }) => {
    setIsEditPageLoading(true);
    try {
      const loadDataEndpoint = API.loadICMData;

      const token = keycloak?.token ?? null;

      const body: Record<string, any> = { ...params };

      if (token) {
        body.token = token;
      } else {
        const usernameMatch = document.cookie.match(/(?:^|;\s*)username=([^;]+)/);
        const username = usernameMatch ? decodeURIComponent(usernameMatch[1]).trim() : null;

        if (username && username.length > 0) {
          body.username = username;
        }
      }

      const response = await fetch(loadDataEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Parse error response        
        throw new Error(errorData.error || "Something went wrong");
      }

      const result = await response.json();
      setJsonContent(result);

    } catch (error) {
      navigate("/error", { state: { message: error instanceof Error ? error.message : String(error) } }); // Pass error
      console.error("Failed to generate template:", error);
    }
    finally {
      setIsEditPageLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={isEditPageLoading} message="Please wait while the form is being loaded." />
      <Presenter data={jsonContent} mode="edit" />
    </>
  );
};

export default EditFormPage;