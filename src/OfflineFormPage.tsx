import { useState, useEffect } from "react";
import "./App.css";
import Presenter from "./Presenter";
import "@carbon/styles/css/styles.css";
import {
  //Form,
  //Button,
  InlineNotification,
  FileUploader,
  //FileUploaderDropContainer
  //TextArea
} from "carbon-components-react";
import { read } from "fs";
//import { stringify } from "querystring";
//import { Heading} from "@carbon/react";


const OfflineFormPage: React.FC = () => {
  const [present, setPresent] = useState(false);
  const [jsonContent, setJsonContent] = useState<object>({});
  const [content, setContent] = useState('');
  const [error, setError] = useState(""); // State to track the error message

  // Listen for messages from Template Repository and KLAMM
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const trustedOrigins = [
        import.meta.env.VITE_TEMPLATE_REPO_URL, //Template Repository URL
        import.meta.env.VITE_KLAMM_URL, //KLAMM URL
      ]


      // Verify the message origin
      if (!trustedOrigins.includes(event.origin)) {
        console.warn("Received message from untrusted origin:", event.origin);
        return;
      }

      // Check the message type and update content
      if (event.data && event.data.type === "LOAD_JSON") {
        setContent(event.data.data); // Populate the textarea with the received JSON

        try {
          const fullJSON = {
            data: {},
            form_definition: JSON.parse(event.data.data),
            metadata: {
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              version: "1.0.0",
            },
          };
          setJsonContent(fullJSON);
          setPresent(true);
        } catch (e) {
          console.error("Invalid JSON received:", e);
          setError("Invalid JSON format. Please correct it.");
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const onUploadChange = (event: any) => {
    var file = event.target.files[0];
    const reader = new FileReader();
    if (file){
      reader.onloadend = ()=> {
        if (typeof reader.result === 'string')
        {
          console.log ("Reder Result", reader.result);
          setContent(reader.result);
        }
      }
      reader.readAsText(file);

    }
    console.log("upload change ", file, content);
        return;
  }
  /*const handleSubmit = (event: any) => {
    event.preventDefault();
    console.log("in submit");

    setError(""); // Reset error message
    if (!content.trim()) {
      setError("Content cannot be empty. Please enter valid JSON.");
      return; // Do not proceed further
    }


    try {
      //convert the json to be saved data format before sending to Presenter
      const fullJSON = {
        data: {},
        form_definition: JSON.parse(content) || {}, // Providing default empty object if missing
        metadata: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: "1.0.0", // Add any other metadata
        }
      }
      setJsonContent(fullJSON);
      setPresent(true);
    } catch (e) {
      setError("Invalid JSON format. Please correct it.");
    }
  };*/
  const handleGoBack = () => {
    setPresent(false); // Return to the form page
  };

  return present ? (
    <Presenter data={jsonContent} mode="preview" goBack={handleGoBack} />
  ) : (
    <>

      <div style={{ margin: '20px' }}>
        <h3 style={{ marginBottom: "20px" }}>
          Preview Your JSON
        </h3>
        <FileUploader
        labelText="Drag and drop files here or click to upload" 
        multiple={false} 
        accept={['application/json', 'application/ffdry']} 
        disabled={false} 
        buttonKind="primary"
        buttonLabel="Add files"
        filenameStatus="edit"
        iconDescription="Clear file"
        name="formUpload" 
        tabIndex={0} 
        onChange={(e)=>onUploadChange(e)}

        />

        <InlineNotification
            kind="error"
            statusIconDescription="error"
            subtitle={error}
            title="File Status 1"

        />
      </div>
    </>
  )

};

export default OfflineFormPage;