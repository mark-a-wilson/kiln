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
//import { read } from "fs";
//import { stringify } from "querystring";
//import { Heading} from "@carbon/react";


const  OfflineFormPage = () => {
  const [present, setPresent] = useState(false);
  const [jsonContent, setJsonContent] = useState<object>({});
  //const [content, setContent] = useState('');
  const [error, setError] = useState(""); // State to track the error message

  // Listen for messages from Template Repository and KLAMM
  useEffect(() => {
    
  /*window.addEventListener('load', processLoadQueue);
  return ()=>{
    window.removeEventListener('load', processLoadQueue);
  }*/

  }, []);
  const uploadFile = async (file: File) =>  
  {
    return new Promise<string>((resolve, reject) =>{
      const reader = new FileReader();
      if (file){
        reader.onload = (e)=> {
          if (e.target!= null){
            if (typeof e.target.result === 'string')
            {
              resolve(e.target.result);
            }
          }
          reject(e);
        }
        reader.readAsText(file);

      }
    })
  }
  const onUploadChange = async (event: any) => {
    var file = event.target.files[0];
    var result = await uploadFile(file);
    console.log("upload change ", result);
    processFileResult(result);
  }
  
  const processFileResult = (result: string) => {

    setError(""); // Reset error message
    if (!result.trim()) {
      setError("Content cannot be empty. Please enter valid JSON.");
      return; // Do not proceed further
    }

    try {
      //convert the json to be saved data format before sending to Presenter
      const fullJSON = JSON.parse(result);
      
      setJsonContent(fullJSON);
      setPresent(true);
    } catch (e) {
      setError("Invalid JSON format. Please correct it.");
    }
  };
  
  return present ? (
    <Presenter data={jsonContent} mode="offline"  />
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
            title="File Status 2"

        />
      </div>
    </>
  )

};

export default OfflineFormPage;