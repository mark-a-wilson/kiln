import { test, expect } from "@playwright/test";

test("should have input with id firstName", async ({ page }) => {    
  const mockJson = {
    "save_data":{
      "form_definition": {
    "formid": 123,
    "title": 'Mocked Title',
    "description": 'This is a mocked description.',
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
   await page.route('**/generate', async (route) => {   
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockJson),
      });   
  });
  await page.goto(`/new?formId=123`);  
  await expect(page.locator('input#firstName')).toBeVisible();
});
