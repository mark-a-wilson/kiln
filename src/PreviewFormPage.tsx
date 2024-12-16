import { useState } from "react";
import "./App.css";
import Presenter from "./Presenter";
import "@carbon/styles/css/styles.css";
import {  
  TextArea,
  Form,
  Button,  
} from "carbon-components-react";
//import { Heading} from "@carbon/react";


const PreviewFormPage: React.FC = () => {
  const [present, setPresent] = useState(false);
  const [jsonContent, setJsonContent] = useState<object>({});
  const [content, setContent] = useState('');
  const [error, setError] = useState(""); // State to track the error message
  

const handleSubmit = (event: any) => {
    event.preventDefault();
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
  };
  const handleGoBack = () => {
    setPresent(false); // Return to the form page
  };

  return present ? (
    <Presenter data={jsonContent} mode="preview" goBack={handleGoBack}/>
  ) : (
    <>
      
      <div style={{ margin: '20px' }}>           
            <h3 style={{ marginBottom: "20px" }}>
            Preview Your JSON
            </h3>
            <Form onSubmit={handleSubmit}>
                <TextArea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ marginBottom: '10px', padding: '10px', fontSize: '16px' }}
                    cols={50}
                    helperText="Please enter your json for the form definition"
                    id="jsonData"
                    invalid={!!error} // Highlight the TextArea if there's an error
                    invalidText={error} // Show the error message below the TextArea
                    labelText="Form Template JSON"
                    placeholder="Enter your form json"
                    rows={15}
                />
                <br />
                
                <Button
                  kind="secondary"
                  tabIndex={0}
                  type="submit"
                >
                 Preview
                </Button>
            </Form>
        </div>
    </>
  )
  
};

export default PreviewFormPage;