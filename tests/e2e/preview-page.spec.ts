import { test, expect } from "@playwright/test";

test.skip('should fill preview text area and click preview', async ({ page }) => {   
  const mockJson = {
    "version":"0.0.1",
    "ministry_id":"2",
    "id":"a26a4e62-c345-4049-9f87-d68d5ff51226",
    "lastModified":"2024-08-07T17:21:44+00:00",
    "title":"Case form",
    "form_id":"123",
    "readOnly":false,   
   "dataSources": [
         {
             "name": "case",
             "type": "post",
             "endpoint": "url",
             "params": {
                 "ViewMode": "Organization"
             },
              "headers": {
                 "Content-Type": "application/json"
             },
             "body": {
                 "SiebMsg_CaseReq": {
                     "MessageId": "",
                     "MessageType": "Integration Object",
                     "IntObjectName": "ICMFormInboundReqIO",
                     "IntObjectFormat": "Siebel Hierarchical",
                     "ListOfICMFormInboundReqIO": {
                         "EntityDetails": {
                             "Entity Id": "@@caseId@@",
                             "Attachment Id": "@@attachmentId@@"
                         }
                     }
                 }
             },
             "host": "url"
         }
       ],
    "data":{
       "items":[
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
             "databindings":{
         "source":"case",
         "path":"$.SiebMsg_Res.['ListOfICM Benefit Plan External IO'].['DT Form Instance'][*].['Case Name']"
         
       }
          },
          {
             "type":"text-input",
             "label":"Case ID",
             "id":"case_id_1",
             "fieldId":"1",
             "codeContext":{
                "name":"case_id"
             },
             "placeholder":"Enter your case id",
             "helperText":"First Name as it appears on official documents",
             "inputType":"text",            
             "databindings":{
         "source":"case",
         "path":"$.SiebMsg_Res.['ListOfICM Benefit Plan External IO'].['DT Form Instance'][*].['Case Id']"
         
       }
          },
      {
             "type":"text-input",
             "label":"Case Worker Name",
             "id":"case_wname_2",
             "fieldId":"1",
             "codeContext":{
                "name":"case_wname"
             },
             "placeholder":"Enter your Case Worker name",
             "helperText":"First Name as it appears on official documents",
             "inputType":"text",            
             "databindings":{
         "source":"case",
         "path":"$.SiebMsg_Res.['ListOfICM Benefit Plan External IO'].['DT Form Instance'][*].['Case Worker Full Name']"
         
       }
          },
       
          {
             "type":"date-picker",
             "label":"Date of Birth",
             "id":"date_of_birth_2",
             "fieldId":"3",
             "codeContext":{
                "name":"date_of_birth"
             },
             "labelText":"Date of Birth",
             "placeholder":"yyyy-MM-dd",
             "mask":"Y-m-d",
             "validation":[
                {
                   "type":"required",
                   "value":true,
                   "errorMessage":"Date of birth should be submitted"
                },
                {
                   "type":"maxDate",
                   "value":"2024-09-01",
                   "errorMessage":"Date should be less than September 1st 2024 due to legislation"
                },
                {
                   "type":"minDate",
                   "value":"2000-01-01",
                   "errorMessage":"Date should be greater than January 1st 2000 due to legislations"
                },
                {
                   "type":"javascript",
                   "value":"{ const birthDate = new Date(value); const today = new Date(); const age = today.getFullYear() - birthDate.getFullYear(); const monthDiff = today.getMonth() - birthDate.getMonth(); const dayDiff = today.getDate() - birthDate.getDate(); if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) { age--; } return age >= 18; }",
                   "errorMessage":"You must be at least 18 years old."
                }
             ]
          },
          {
             "type":"dropdown",
             "label":"Status",
             "id":"status_3",
             "fieldId":4,
             "codeContext":{
                "name":"status"
             },
             "placeholder":"Select your Status",
             "isMulti":false,
             "isInline":false,
             "selectionFeedback":"top-after-reopen",
             "direction":"bottom",
             "size":"md",
             "helperText":"Choose one from the list",
             "listItems":[
                {
                   "value":"Open",
                   "text":"Open"
                },
                {
                   "value":"In progress",
                   "text":"In progress"
                },
                {
                   "value":"Closed",
                   "text":"Closed"
                },
                {
                   "value":"Unknown",
                   "text":"Unknown"
                }
             ],
             "validation":[
                {
                   "type":"required",
                   "value":true,
                   "errorMessage":"Status is required."
                }
             ],
       "databindings":{
         "source":"case",
         "path":"$.SiebMsg_Res.['ListOfICM Benefit Plan External IO'].['DT Form Instance'][*].['ListOfHLS Case'].['HLS Case'][*].Status"				
       }
          },
          {
             "type":"group",
             "label":"Sales Assessment",
             "id":"group2_3",
             "groupId":"2",
             "repeater":true,
       "databindings":{
         "source":"case",
         "path":"$.SiebMsg_Res.['ListOfICM Benefit Plan External IO'].['DT Form Instance'][*].['ListOfHLS Case'].['HLS Case'][*].['ListOfSales Assessment'].['Sales Assessment'][*]."				
       },
             
             "codeContext":{
                "name":"group2"
             },
             "groupItems":[
                {
                   "fields":[
                      {
                         "type":"text-input",
                         "label":"Template Name",
                         "id":"template_name_1",
                         "fieldId":"1",
                         "codeContext":{
                            "name":"template_name"
                         },
                         "placeholder":"Enter template Name",
                         "helperText":"Template Name as it appears on official documents",
                         "inputType":"text",
             "databindings":{
               "source":"case",
               "path":"Template_Name"				
             }
                      },
                      {
                         "type":"text-input",
                         "label":"Assessment Score",
                         "id":"assessment_score_2",
                         "fieldId":"1",
                         "codeContext":{
                            "name":"assessment_score"
                         },
                         "placeholder":"Enter Assessment Score",
                         "helperText":"Assessment Score as it appears on official documents",
                         "inputType":"text",
             "databindings":{
               "source":"case",
               "path":"Assessment Score"				
             }                        
                      },
                      {
                         "type":"text-input",
                         "label":"ID",
                         "id":"id_3",
                         "fieldId":"1",
                         "codeContext":{
                            "name":"id"
                         },
                         "placeholder":"Enter ID",
                         "helperText":"ID as it appears on official documents",
                         "inputType":"text",
                         "databindings":{
               "source":"case",
               "path":"Id"				
             } 
                      }                     
                      
                   ]
                }
             ]
          }
         
       ]
    }
 };
 
  await page.goto(`/preview`);
  const textArea = page.locator('#jsonData'); // Replace with the actual selector
  await textArea.fill(JSON.stringify(mockJson));

  const submitButton = page.locator('button[type="submit"]'); // Replace with the actual selector
  await submitButton.click();
  
  const input = page.locator('#case_name_1');
await expect(input).toBeVisible({ timeout: 10000 }); // Waits for the element to become visible
});
