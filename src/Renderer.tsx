import "./App.css";
import React, { useState, useEffect } from "react";
import {
    TextInput,
    Dropdown,
    Checkbox,
    Toggle,
    DatePicker,
    DatePickerInput,
    Row,
    Column,
    TextArea,
    Button,
    NumberInput, 
    Link,
    FileUploader,
    RadioButton, 
    RadioButtonGroup,
    Select,
    SelectItem,
} from "carbon-components-react";
import DynamicTable from "./DynamicTable";
import { parseISO, format } from "date-fns";
import { Heading, FlexGrid } from "@carbon/react";
interface Item {
    type: string;
    label?: string;
    placeholder?: string;
    id: string;
    codeContext?: { name: string };
    header?: string;
    offText?: string;
    onText?: string;
    size?: string;
    listItems?: { value: string; text: string }[];
    groupItems?: { fields: Item[] }[];
    repeater?: boolean;
    style?: { marginBottom?: string, fontSize?: string };
    labelText: string;
    helperText?: string;
    value?: string;
    filenameStatus?:string;
    labelDescription?:string;
    initialRows?:string;
    initialColumns?:string;
    initialHeaderNames?:string;

}

interface Template {
    version: string;
    ministry_id: string;
    id: string;
    lastModified: string;
    title: string;
    data: {
        items: Item[];
    };
}

interface SavedFieldData {
    [key: string]: FieldValue | GroupFieldValueItem[]; // The key can either point to a single field value or an array of group items
}

type FieldValue = string | boolean | number | { [key: string]: any }; // The value can be of various types, including nested objects

interface GroupFieldValueItem {
    [key: string]: FieldValue; // Each group item is a map of field IDs to field values
}


interface SavedData {
    data:SavedFieldData,
    form_definition:Template,
    metadata:{}

}

type GroupState = { [key: string]: string }[]; // New type definition

const componentMapping: { [key: string]: React.ElementType } = {
    "text-input": TextInput,
    dropdown: Dropdown,
    checkbox: Checkbox,
    toggle: Toggle,
    "date-picker": DatePicker,
    "text-area": TextArea,
    "button":Button,
    "number-input":NumberInput,   
    "text-info": Heading,
    "link":Link,
    "file":FileUploader,
    "table":DynamicTable,
    "group":FlexGrid,
    "radio":RadioButtonGroup,
    "select":Select
};

interface RendererProps {
    data: any;
}


const generateUniqueId = (groupId: string | number, groupIndex: number, fieldId: string) => `${groupId}-${groupIndex}-${fieldId}`;

const Renderer: React.FC<RendererProps> = ({ data }) => { 
    const [formStates, setFormStates] = useState<{ [key: string]: string }>({});    
    const [groupStates, setGroupStates] = useState<{ [key: string]: GroupState }>({});

    const [formData, setFormData] = useState<Template>(JSON.parse(JSON.stringify(data.form_definition)));    


    if (!data.form_definition) {
        return <div>Invalid Form</div>;
    }

    useEffect(() => {
       
        const initialFormStates: { [key: string]: string } = {};
        const initialGroupStates: { [key: string]: GroupState } = {}; // Changed type here

        formData?.data?.items.forEach((item) => {
            if (item.type === "group") {
                initialGroupStates[item.id] = item.groupItems?.map((groupItem, groupIndex) => {
                    const groupState: { [key: string]: string } = {};
                    groupItem.fields.forEach((field) => {
                        const fieldId = generateUniqueId(item.id, groupIndex, field.id);
                        field.id = fieldId;                      
                        groupState[field.id] = "";
                    });
                    return groupState;
                }) || [];
            } else {              
                initialFormStates[item.id] = "";                 
            }
        });
            setFormStates(initialFormStates);
            setGroupStates(initialGroupStates);            

            // Populate values from dataBindings
            Object.keys(data.data).forEach((key:string) => {
                const value = data.data[key];
                if (Array.isArray(value)) {
                    // If the value is an array, it corresponds to a group
                    if (initialGroupStates[key]) {
                        value.forEach((groupItem, groupIndex) => {                               
                                // Assign the values from dataBindings to the correct field in the group
                                if (initialGroupStates[key][groupIndex]) {
                                    Object.keys(groupItem).forEach((fieldKey) => {
                                        initialGroupStates[key][groupIndex][fieldKey] = groupItem[fieldKey];
                                    });
                                } else {
                                    handleAddGroupItem(key,groupItem);                                       
                                }
                            
                        });
                    }
                } else {
                    // Non-group fields
                    initialFormStates[key] = value;
                }
            });                
           
        }, []);

    const handleInputChange = (fieldId: string, value: any, groupId: string | null = null, groupIndex: number | null = null) => {
        if (groupId !== null && groupIndex !== null) {
            setGroupStates((prevState) => ({
                ...prevState,
                [groupId]: prevState[groupId].map((item, index) =>
                    index === groupIndex ? { ...item, [fieldId]: value } : item
                ),
            }));
        } else {
            setFormStates((prevState) => ({
                ...prevState,
                [fieldId]: value,
            }));
        }
    };
    
    const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        window.open(event.currentTarget.href, '_blank', 'noopener,noreferrer');
    };
  

    const handleDropdownChange = (groupId: string | null, groupIndex: number | null, fieldId: string) => (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (groupId !== null && groupIndex !== null) {
            setGroupStates((prevState) => ({
                ...prevState,
                [groupId]: prevState[groupId].map((item, index) =>
                    index === groupIndex ? { ...item, [fieldId]: event.target.value } : item
                ),
            }));
        } else {
            setFormStates((prevState) => ({
                ...prevState,
                [fieldId]: event.target.value,
            }));
        }
    };

  
    const handleAddGroupItem = (groupId: string, initialData: { [key: string]: any } | null = null) => {
        setFormData((prevState) => {
          const newFormData = { ...prevState };
          const group = newFormData?.data.items.find((item) => item.id === groupId);
    
          if (group && group.groupItems) {
            const groupIndex = group.groupItems.length;
    
            // Create a deep copy of the first group item and modify its IDs
            const newGroupItem = JSON.parse(JSON.stringify(group.groupItems[0]));
            newGroupItem.fields.forEach((field: Item) => {
              const newFieldId = generateUniqueId(groupId,groupIndex,field.id.split("-").slice(2).join("-"));
              field.id = newFieldId;
            });    
            group.groupItems.push(newGroupItem);
          }
    
          return newFormData;
        });
    
        setGroupStates((prevGroupStates) => {
          const newState = { ...prevGroupStates };        
          const newGroupItemState: { [key: string]: string } = {};
          const group = formData?.data.items.find((item) => item.id === groupId);
          const groupIndex = newState[groupId]?.length || 0;           
          const firstGroupItem = group?.groupItems?.[0];        
    
          firstGroupItem?.fields.forEach((field: Item) => {
            const newFieldId = generateUniqueId(groupId, groupIndex, field.id.split('-').slice(2).join('-'));           
            newGroupItemState[newFieldId] = initialData && initialData[newFieldId] ? initialData[newFieldId]
                : ""; // Use initialData if available
          });
    
          return {
            ...newState,
            [groupId]: [...(prevGroupStates[groupId] || []), newGroupItemState],
          };
        });        
    };
  

    const handleRemoveGroupItem = (groupId: string, groupItemIndex: number) => {
    
        setFormData((prevState) => {
            const newFormData = { ...prevState };
            const group = newFormData?.data.items.find(item => item.id === groupId);
          
                group?.groupItems?.splice(groupItemIndex, 1);

              // Update IDs for remaining group items
                group?.groupItems?.forEach((groupItem, newIndex) => {
                    groupItem.fields.forEach((field: Item) => {                      
                        field.id = generateUniqueId(groupId, newIndex, field.id.split('-').slice(2).join('-'));
                    });
                });         

            return newFormData;
        });

        setGroupStates((prevGroupStates) => {        
            const newState = { ...prevGroupStates };
            const updatedGroup = newState[groupId].filter((_, index) => index !== groupItemIndex);

          // Reindex the remaining items correctly
            const reindexedGroup = updatedGroup.map((groupItem, newIndex) => {
              const newGroupItem: { [key: string]: string } = {};
              Object.keys(groupItem).forEach(key => {
                  const newKey = generateUniqueId(groupId, newIndex, key.split('-').slice(2).join('-'));
                  newGroupItem[newKey] = groupItem[key];
              });
              return newGroupItem;
            });         
            return {
              ...newState,
              [groupId]: reindexedGroup,
            };
        });
    };

   

    const renderComponent = (item: Item, groupId: string | null = null, groupIndex: number | null = null) => {
        const Component = componentMapping[item.type];
        if (!Component) return null;

        //const codeContext = item.codeContext ;
        //const name = codeContext?.name || item.id;
        //const fieldId = groupId ? generateUniqueId(groupId,groupIndex,name) : `${name}-${item.id}`;
    
        const fieldId = item.id;

        //const toggleLabelId = `toggle-${fieldId}-label`;
        //const toggleId = `toggle-${fieldId}`;
        switch (item.type) {
            case "text-input":
                return (
                <Component
                    key={fieldId}
                    id={fieldId}
                    labelText={item.label}
                    placeholder={item.placeholder}
                    name={fieldId}
                    value={groupId ? (groupStates[groupId]?.[groupIndex!]?.[fieldId] || "") : (formStates[fieldId] || "")}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(fieldId, e.target.value, groupId, groupIndex)}
                    style={{ marginBottom: "15px" }}
                />
                );
            case "dropdown":
                const items = item.listItems?.map(({ value, text }) => ({ value, label: text })) || [];
                const itemToString = (item: any) => (item ? item.label : "");
                
                // Retrieve the currently selected value based on the group state or form state
                const selectedValue = groupId 
                    ? groupStates[groupId]?.[groupIndex!]?.[fieldId]
                    : formStates[fieldId];
                
                // Find the corresponding item from the list
                const selectedItem = items.find(option => option.value === selectedValue);

                return (
                    <Component
                        key={fieldId}
                        id={fieldId}
                        titleText={item.label}
                        label={item.placeholder}
                        items={items}
                        itemToString={itemToString}
                        selectedItem={selectedItem}
                        onChange={({ selectedItem }: { selectedItem: any }) => 
                            handleInputChange(fieldId, selectedItem.value, groupId, groupIndex)
                        }
                        style={{ marginBottom: "15px" }}
                    />
                );
            case "checkbox":
                return (
                    <div style={{ marginBottom: "15px" }}>
                        <Component
                            key={fieldId}
                            id={fieldId}
                            labelText={item.label}
                            name={fieldId}
                            checked={groupId ? (groupStates[groupId]?.[groupIndex!]?.[fieldId] || false) : (formStates[fieldId] || false)}
                            onChange={( { checked }: { checked: boolean }) => handleInputChange(fieldId, String(checked), groupId, groupIndex)}
                        />
                    </div>
                );
            case "toggle":
                return (
                    <div key={fieldId} style={{ marginBottom: "15px" }}>
                        <div id={`${fieldId}-label`}>{item.header}</div>
                        <Component
                            id={fieldId}
                            aria-labelledby={`${fieldId}-label`}
                            labelA={item.offText}
                            labelB={item.onText}
                            size={item.size}
                            toggled={groupId ? (groupStates[groupId]?.[groupIndex!]?.[fieldId] || false) : (formStates[fieldId] || false)}
                            onToggle={(checked: boolean) => handleInputChange(fieldId, String(checked), groupId, groupIndex)}
                        />
                    </div>
                );
            case "date-picker":
                const selectedDate = groupId ? (groupStates[groupId]?.[groupIndex!]?.[fieldId] ? parseISO(groupStates[groupId][groupIndex!][fieldId]) : undefined) : (formStates[fieldId] ? parseISO(formStates[fieldId]) : undefined);
                return (
                    <Component
                        key={fieldId}
                        datePickerType="single"
                        value={selectedDate ? [selectedDate] : []}
                        onChange={(dates: Date[]) => handleInputChange(fieldId, format(dates[0], "yyyy-MM-dd"), groupId, groupIndex)}
                        style={{ marginBottom: "15px" }}
                    >
                        <DatePickerInput
                            id={fieldId}
                            placeholder={item.placeholder}
                            labelText={item.labelText}
                            value={selectedDate ? format(selectedDate, "MM/dd/yyyy") : ""}
                        />
                    </Component>
                );
            case "text-area":
                return (
                    <Component
                        key={fieldId}
                        id={fieldId}
                        labelText={item.label}
                        placeholder={item.placeholder}
                        helperText={item.helperText}
                        name={fieldId}
                        value={groupId ? (groupStates[groupId]?.[groupIndex!]?.[fieldId] || "") : (formStates[fieldId] || "")}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(fieldId, e.target.value, groupId, groupIndex)}
                        rows={4}
                        style={{ marginBottom: "15px" }}
                    />
                );
            case "button":
                return (
                    <Component
                        key={fieldId}
                        id={fieldId}
                        name={fieldId}
                        size="md"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleInputChange(fieldId, e.currentTarget.value, groupId, groupIndex)}
                        style={{ marginBottom: "15px" }}
                    >
                        {item.label}
                    </Component>
                );
            case "number-input":
                return (
                    <Component
                        helperText={item.helperText}
                        invalidText="Number is not valid"
                        key={fieldId}
                        id={fieldId}
                        label={item.label}
                        name={fieldId}
                        min={0}
                        max={250}
                        value={groupId ? (groupStates[groupId]?.[groupIndex!]?.[fieldId] || 0) : (formStates[fieldId] || 0)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(fieldId, e.target.value, groupId, groupIndex)}
                        style={{ marginBottom: "15px" }}
                    />
                );
            case "text-info":
                return (
                    <Component
                        key={fieldId}
                        id={fieldId}
                        style={{ marginBottom: item.style?.marginBottom, fontSize: item.style?.fontSize }}
                    >
                        {item.label}
                    </Component>
                );
            case "link":
                return (
                    <Component
                        id={fieldId}
                        href={item.value}
                        onClick={handleLinkClick}
                    >
                        {item.label}
                    </Component>
                );
            case "file":
                return (
                    <div className="cds--file__container">
                        <Component
                            id={fieldId}
                            labelTitle={item.labelText}
                            labelDescription={item.labelDescription}
                            buttonLabel={item.labelText}
                            buttonKind="primary"
                            size={item.size}
                            filenameStatus={item.filenameStatus}
                            accept={['.jpg', '.png']}
                            multiple={true}
                            disabled={false}
                            iconDescription="Delete file"
                            name=""
                        />
                    </div>
                );
            case "table":
                return (
                    <Component
                        id={fieldId}
                        tableTitle={item.labelText}
                        initialRows={item.initialRows}
                        initialColumns={item.initialColumns}
                        initialHeaderNames={item.initialHeaderNames}
                    />
                );
            case "radio":
                const radioOptions = item.listItems?.map(({ value, text }) => ({ value: value, label: text })) || [];
                return (
                    <Component
                        legendText={item.label}
                        id={fieldId}
                        name={fieldId}
                        onChange={(value: string) => handleInputChange(fieldId, value, groupId, groupIndex)}
                        valueSelected={groupId ? groupStates[groupId]?.[groupIndex!]?.[fieldId] : formStates[fieldId]}
                    >
                        {radioOptions.map((option, index) => (
                            <RadioButton
                                key={index}
                                labelText={option.label}
                                value={option.value}
                                id={`${fieldId}-${index}`}
                            />
                        ))}
                    </Component>
                );
            case "select":
                const itemsForSelect = item.listItems || [];
                return (
                    <Select
                        id={fieldId}
                        name={fieldId}
                        labelText={item.label}
                        value={groupId ? groupStates[groupId]?.[groupIndex!]?.[fieldId] : formStates[fieldId]}
                        onChange={handleDropdownChange(groupId, groupIndex, fieldId)}
                    >
                        {itemsForSelect.map(itemForSelect => (
                            <SelectItem key={itemForSelect.value} value={itemForSelect.value} text={itemForSelect.text} />
                        ))}
                    </Select>
                );
            case "group":
                return (
                    <div key={item.id} className="group-container">
                        <h2>{item.label}</h2>
                        {item.groupItems?.map((groupItem, groupIndex) => (
                            <div key={`${item.id}-${groupIndex}`} className="group-container">
                                {groupItem.fields.map((groupField) => (
                                    <Row key={groupField.id}>
                                        <Column>{renderComponent(groupField, item.id, groupIndex)}</Column>
                                    </Row>
                                ))}
                                {item.groupItems && item.groupItems.length > 1 && (
                                    <Button
                                        kind="danger"
                                        onClick={() => handleRemoveGroupItem(item.id, groupIndex)}
                                    >
                                        Remove {item.label}
                                    </Button>
                                )}
                            </div>
                        ))}
                        {item.repeater && (<Button
                            kind="primary"
                            onClick={() => handleAddGroupItem(item.id)}
                        >
                            Add {item.label}
                        </Button>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const createSavedData =() => {
        const saveFieldData: SavedFieldData =  { ...formStates };
        Object.keys(groupStates).forEach((groupId) => {
            saveFieldData[groupId] = groupStates[groupId];
        });
        //SavedData
        data.metadata.updated_date= new Date().toLocaleDateString() + '';
        const savedData: SavedData = {
            "data":saveFieldData,
            "form_definition":data.form_definition,
            "metadata":data.metadata
        }
        console.log("Saved Data:", JSON. stringify(savedData));
        return savedData;
    }

    const saveDataToApi = async() => {        

         try{
            const saveDataEndpoint = import.meta.env.VITE_COMM_API_SAVEDATA_ENDPOINT_URL;            
            const response = await fetch(saveDataEndpoint,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON. stringify(createSavedData()),
            });
            if(response.ok) {
                const result = await response.json();
                console.log("Result",result);
                return "success";
            }else {
                console.error('Error:', response.statusText);
                return "failed";
            }
         }
         catch(error){
            console.error('Error:',error);
            return "failed";
         }
         
    }
    const handleSave = async () => {        
        const returnMessage = saveDataToApi();

        if (await returnMessage ==="success" ){
            window.alert("Form Saved Successfully!!!");
        } else {
            window.alert("Error saving form. Please try again !!!");
        }
       
    };

    const handleSaveAndClose = async() => {
        const returnMessage = saveDataToApi();
        if (await returnMessage ==="success" ){
            window.opener = null;
            window.open('', '_self');
            window.close();
        } else {
            window.alert("Error saving form. Please try again !!!");
        }        
    };

  return (
    <div>        
        <div className="fixed-save-buttons">
            <Button onClick={handleSave} kind="primary">
            Save 
            </Button>
            <Button  onClick={handleSaveAndClose} kind="secondary">
            Save & Close
            </Button>
      </div>
        <div className="content-wrapper" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {formData.ministry_id && (
        <img
          src={`/ministries/${formData.ministry_id}.png`}
          width="350px"
          alt="ministry logo"
        />
      )}
      <Heading style={{ marginBottom: "20px", fontSize: "24px" }}>
        {formData.title}
      </Heading>
      <FlexGrid>
        {formData.data.items.map((item, index) => (
          <Row key={item.id}>
            <Column>{renderComponent(item, item.type === "group" ? item.id : null, index)}</Column>
          </Row>
        ))}
      </FlexGrid>      
    </div>
    </div>
  );
};

export default Renderer;
