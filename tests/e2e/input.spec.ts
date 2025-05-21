import { test, expect } from "@playwright/test";

test.skip("should have input with id firstName", async ({ page }) => {    
  const mockJson = {
    "save_data":{
      "form_definition": {
    "formid": 123,
    "title": 'Mocked Title',
    "description": 'This is a mocked description.',
    "version":"0.0.1",
   "ministry_id":"2",
   "id":"806ddd14-709c-46b0-8675-e06cc0fd9557",
   "lastModified":"2024-08-07T17:21:44+00:00",   
   "readOnly":false, 
   "dataSources": [],  
    "data":{
      "items":[
	{
            "type":"text-input",
            "label":"First Name",
            "id":"firstName",
            "fieldId":"1",
            "codeContext":{
               "name":"message_id"
            },
            "placeholder":"Enter your Message ID",
            "helperText":"Message ID as it appears on official documents",
            "inputType":"text",           
            
         },
	{
            "type":"text-input",
            "label":"Case Name",
            "id":"case_name_1",
            "fieldId":"1",
            "codeContext":{
               "name":"case_name"
            },
            "placeholder":"Enter your case name",
            "helperText":"First Name as it appears on official documents",
            "inputType":"text",            
           
         },
      ] 
        }
      }
    }
  };
   // Intercept the API request and respond with mock JSON
   const generateDataEndpoint = "http://localhost:3000/generate";
   await page.route(generateDataEndpoint, async route => {   
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockJson),
      });   
  });  

  await page.goto(`/new?formId=123`);  

  const input = page.locator('#firstName');
  
await expect(input).toBeVisible({ timeout: 10000 }); // Waits for the element to become visible
});
