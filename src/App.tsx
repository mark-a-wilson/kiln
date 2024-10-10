import { useState, useEffect } from "react";
import "./App.css";
import Presenter from "./Presenter";
import "@carbon/styles/css/styles.css";

const App: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<object>({});
  

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const formIdParam = urlParams.get("formId");
    const caseIdParam = urlParams.get("caseId");
    if(formIdParam && caseIdParam) {
      //setFormId(formIdParam);
      //setCaseId(caseIdParam);
      console.log("caseIdParam>>",caseIdParam);
      console.log("formIdParam>>",formIdParam);
      handleGenerateTemplate(caseIdParam,formIdParam);
    }
    
   /*  if (data) {
      try {
        console.log("formId>>",formId);
        console.log("data>>",data);
        const decodedData = JSON.parse(decodeURIComponent(data));
        setJsonContent(decodedData);
      } catch (error) {
        console.error("Failed to parse data from URL:", error);
      }
    } */
  }, []);

  const handleGenerateTemplate = async (caseIdParam:string,formIdParam:string) => {    

    console.log("caseId>>",caseIdParam);
    console.log("formId>>",formIdParam);
    try {
      const response = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          case_id: caseIdParam,
          template_id: formIdParam,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();

      /* const updatedAttachments = [...attachments];
      updatedAttachments[index] = {
        ...attachment,
        saveData: result.save_data || {},
        state: "in-progress",
      }; */

      //setAttachments(updatedAttachments);
      console.log("result.save_data>>",result.save_data);
      //const decodedData = JSON.parse(result.save_data || {});
      setJsonContent(result.save_data);
      //setJsonContent(result.save_data || {});
    } catch (error) {
      console.error("Failed to generate template:", error);
    }
  };

  return <Presenter data={jsonContent} />;
};

export default App;
