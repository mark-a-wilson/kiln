import { useState, useEffect, useContext } from "react";
import "./App.css";
import Presenter from "./Presenter";
import "@carbon/styles/css/styles.css";
import { AuthenticationContext } from "./App";
import { useNavigate } from 'react-router-dom';
import { API } from "./utils/api";
import LoadingOverlay from "./common/LoadingOverlay";


const ViewFormPage: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<object>({});
  const keycloak = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const [isViewPageLoading, setIsViewPageLoading] = useState(false);


  useEffect(() => {

    const queryParams = new URLSearchParams(window.location.search);
    const params: { [key: string]: string | null } = {};

    // Iterate over all query parameters and store them in the params object
    queryParams.forEach((value, key) => {
      params[key] = value;
    });

    if (params) {

      handleLoadTemplate(params);
    }


  }, []);

  const handleLoadTemplate = async (params: { [key: string]: string | null }) => {
    setIsViewPageLoading(true);
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
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      setJsonContent(result);

    } catch (error) {
      navigate("/error", { state: { message: error instanceof Error ? error.message : String(error) } }); // Pass error
      console.error("Failed to generate template:", error);
    }
    finally {
      setIsViewPageLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={isViewPageLoading} message="Please wait while the form is being loaded." />
      <Presenter data={jsonContent} mode="view" />
    </>
  );
};

export default ViewFormPage;