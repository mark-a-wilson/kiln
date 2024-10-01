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
import InputMask from "react-input-mask";
import { CurrencyInput } from "react-currency-mask";
import {  
  generateUniqueId, 
  handleLinkClick,
  validateField,
  isFieldRequired,
} from "./utils/helpers"; // Import from the helpers file
interface Item {
  type: string;
  label?: string;
  placeholder?: string;
  id: string;
  mask?: string;
  codeContext?: { name: string };
  header?: string;
  offText?: string;
  onText?: string;
  size?: string;
  listItems?: { value: string; text: string }[];
  groupItems?: { fields: Item[] }[];
  repeater?: boolean;
  style?: { marginBottom?: string; fontSize?: string };
  labelText: string;
  helperText?: string;
  value?: string;
  filenameStatus?: string;
  labelDescription?: string;
  initialRows?: string;
  initialColumns?: string;
  initialHeaderNames?: string;
  condition?:string;
  calculatedValue?:string;
  validation?: {
    type: string;
    value: string | number | boolean;
    errorMessage: string;
  }[];
  saveOnSubmit?:boolean;
  readOnly?:boolean;
  

}

interface Template {
  version: string;
  ministry_id: string;
  id: string;
  lastModified: string;
  title: string;
  readOnly?:boolean;
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
  data: SavedFieldData;
  form_definition: Template;
  metadata: {};
}

type GroupState = { [key: string]: string }[]; // New type definition

const componentMapping: { [key: string]: React.ElementType } = {
  "text-input": TextInput,
  dropdown: Dropdown,
  checkbox: Checkbox,
  toggle: Toggle,
  "date-picker": DatePicker,
  "text-area": TextArea,
  button: Button,
  "number-input": NumberInput,
  "text-info": Heading,
  link: Link,
  file: FileUploader,
  table: DynamicTable,
  group: FlexGrid,
  radio: RadioButtonGroup,
  select: Select,
  "currency-input":TextInput,
};

interface RendererProps {
  data: any;
}



const Renderer: React.FC<RendererProps> = ({ data }) => {
  const [formStates, setFormStates] = useState<{ [key: string]: string }>({});
  const [groupStates, setGroupStates] = useState<{ [key: string]: GroupState }>(
    {}
  );
  const [formData, setFormData] = useState<Template>(
    JSON.parse(JSON.stringify(data.form_definition))
  );
  const [formErrors, setFormErrors] = useState<{
    [key: string]: string | null;
  }>({});

  if (!data.form_definition) {
    return <div>Invalid Form</div>;
  }

  useEffect(() => {
    const initialFormStates: { [key: string]: string } = {};
    const initialGroupStates: { [key: string]: GroupState } = {}; // Changed type here

    formData?.data?.items.forEach((item) => {
      if (item.type === "group") {
        initialGroupStates[item.id] =
          item.groupItems?.map((groupItem, groupIndex) => {
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
    Object.keys(data.data).forEach((key: string) => {
      const value = data.data[key];
      if (Array.isArray(value)) {
        // If the value is an array, it corresponds to a group
        if (initialGroupStates[key]) {
          value.forEach((groupItem, groupIndex) => {
            // Assign the values from dataBindings to the correct field in the group
            if (initialGroupStates[key][groupIndex]) {
              Object.keys(groupItem).forEach((fieldKey) => {
                initialGroupStates[key][groupIndex][fieldKey] =
                  groupItem[fieldKey];
              });
            } else {
              handleAddGroupItem(key, groupItem);
            }
          });
        }
      } else {
        // Non-group fields
        initialFormStates[key] = value;
      }
    });
  }, []);

  

  const handleInputChange = (
    fieldId: string,
    value: any,
    groupId: string | null = null,
    groupIndex: number | null = null
  ) => {
    let validationError: string | null = null;

    if (groupId !== null && groupIndex !== null) {
      const groupItem = formData?.data?.items.find(
        (item) => item.id === groupId
      )?.groupItems?.[groupIndex];
      const field = groupItem?.fields.find((field) => field.id === fieldId);
      validationError = validateField(field, value);
      setGroupStates((prevState) => ({
        ...prevState,
        [groupId]: prevState[groupId].map((item, index) =>
          index === groupIndex ? { ...item, [fieldId]: value } : item
        ),
      }));
    } else {
      const field = formData?.data?.items.find((item) => item.id === fieldId);
      validationError = validateField(field, value);
      setFormStates((prevState) => ({
        ...prevState,
        [fieldId]: value,
      }));
    }
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [fieldId]: validationError,
    }));
  };
 

  const handleAddGroupItem = (
    groupId: string,
    initialData: { [key: string]: any } | null = null
  ) => {
    setFormData((prevState) => {
      const newFormData = { ...prevState };
      const group = newFormData?.data.items.find((item) => item.id === groupId);

      if (group && group.groupItems) {
        const groupIndex = group.groupItems.length;

        // Create a deep copy of the first group item and modify its IDs
        const newGroupItem = JSON.parse(JSON.stringify(group.groupItems[0]));
        newGroupItem.fields.forEach((field: Item) => {
          const newFieldId = generateUniqueId(
            groupId,
            groupIndex,
            field.id.split("-").slice(2).join("-")
          );
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
        const newFieldId = generateUniqueId(
          groupId,
          groupIndex,
          field.id.split("-").slice(2).join("-")
        );
        newGroupItemState[newFieldId] =
          initialData && initialData[newFieldId] ? initialData[newFieldId] : ""; // Use initialData if available
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
      const group = newFormData?.data.items.find((item) => item.id === groupId);

      group?.groupItems?.splice(groupItemIndex, 1);

      // Update IDs for remaining group items
      group?.groupItems?.forEach((groupItem, newIndex) => {
        groupItem.fields.forEach((field: Item) => {
          field.id = generateUniqueId(
            groupId,
            newIndex,
            field.id.split("-").slice(2).join("-")
          );
        });
      });

      return newFormData;
    });

    setGroupStates((prevGroupStates) => {
      const newState = { ...prevGroupStates };
      const updatedGroup = newState[groupId].filter(
        (_, index) => index !== groupItemIndex
      );

      // Reindex the remaining items correctly
      const reindexedGroup = updatedGroup.map((groupItem, newIndex) => {
        const newGroupItem: { [key: string]: string } = {};
        Object.keys(groupItem).forEach((key) => {
          const newKey = generateUniqueId(
            groupId,
            newIndex,
            key.split("-").slice(2).join("-")
          );
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

  const shouldFieldBeIncludedForSaving = (item: Item ,groupId: string | null = null,
    groupIndex: number | null = null) : boolean => {

      if (isFieldVisible(item, groupId, groupIndex) || item.saveOnSubmit) {
        return true; // Field is not visible based on condition
      }

      return false;
  }

  const isFieldVisible = (item: Item ,groupId: string | null = null,
    groupIndex: number | null = null) : boolean => {
    
      if (!item.condition) {
        return true; // No condition means always visible
      }
      try {
        // If the field is in a group, pass groupStates and groupIndex
        if (groupId !== null && groupIndex !== null) {
          const conditionFunction = new Function(
            "formStates",            
            "groupStates",
            "groupId",
            "groupIndex",
            item.condition
          );         
          
          return conditionFunction(formStates, groupStates,groupId, groupIndex);
        } else {
          // For non-group fields, evaluate using formStates
          const conditionFunction = new Function(
            "formStates",
            item.condition
          );
          console.log("conditionFunction",conditionFunction);
          return conditionFunction(formStates);
        }
      } catch (error) {
        console.error("Error evaluating condition script:", error);
        return true; // Default to visible if the script fails
      }
      return true;
  }

  const executeCalculatedValue = (item: Item ,groupId: string | null = null,
    groupIndex: number | null = null)   => {
    
      let calculatedFieldValue ="";
      if (!item.calculatedValue) {
        return calculatedFieldValue; // No calculation means empty
      }
      try {       
        // If the field is in a group, pass groupStates and groupIndex
        //if (groupId !== null && groupIndex !== null) {
          const calculationFunction = new Function(
            "formStates",            
            "groupStates",
            "groupId",
            "groupIndex",
            item.calculatedValue
          );         
          //const calculationFunction = new Function("formStates", calculationScript);
          //return calculationFunction(formStates);

          calculatedFieldValue = calculationFunction(formStates, groupStates,groupId, groupIndex);
       /*  //} else {
          // For non-group fields, evaluate using formStates
          const calculationFunction = new Function(
            "formStates",
            item.calculatedValue
          );
          console.log("calculationFunction",calculationFunction);
          calculatedFieldValue =  calculationFunction(formStates);
        } */
          let currentValue ;
        console.log("calculatedFieldValue",calculatedFieldValue);
         if (groupId !== null && groupIndex !== null) {
          currentValue=  groupStates[groupId]?.[groupIndex]?.[item.id];
        
         }else {
          currentValue = formStates[item.id];
         }
        if (calculatedFieldValue !== currentValue) {
          handleInputChange(item.id, calculatedFieldValue, groupId, groupIndex);
         
        }
        //handleInputChange(item.id, calculatedFieldValue, groupId, groupIndex);

      } catch (error) {
        console.error("Error evaluating calculationFunction script:", error);
        return calculatedFieldValue; // Default to empty if the script fails
      }
      return calculatedFieldValue;
  }

  const renderComponent = (
    item: Item,
    groupId: string | null = null,
    groupIndex: number | null = null
  ) => {
    const Component = componentMapping[item.type];
    if (!Component) return null;

    if (item.calculatedValue) {
      executeCalculatedValue(item, groupId, groupIndex);
      
    } 

    if (!isFieldVisible(item, groupId, groupIndex)) {
      return null; // Field is not visible based on condition
    }

    const fieldId = item.id;
    const error = formErrors[fieldId];
    const isRequired = isFieldRequired(item.validation || []);
    const label = (
      <span>
        {item.label}
        {isRequired && <span className="required-asterisk"> *</span>}
      </span>
    );
    
     
    switch (item.type) {
      case "text-input":               
        return (
          <InputMask
            mask={item.mask || ''}
            value={
              groupId
                ? groupStates[groupId]?.[groupIndex!]?.[fieldId] || ""
                : formStates[fieldId] || ""
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange(fieldId, e.target.value, groupId, groupIndex)
              
            }
            readOnly={formData.readOnly || item.readOnly || !!item.calculatedValue}
          >  
              <Component               
                key={fieldId}
                id={fieldId}
                labelText={label}
                placeholder={item.placeholder}
                name={fieldId}
                style={{ marginBottom: "15px" }}                
                invalid={!!error}
                invalidText={error || ""}
              />            
          </InputMask>
        );
        case "currency-input":               
        return (
          <CurrencyInput           
            value={
              groupId
                ? groupStates[groupId]?.[groupIndex!]?.[fieldId] || ""
                : formStates[fieldId] || ""
            }
            onChangeValue={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange(fieldId, e.target.value, groupId, groupIndex)
            }
            currency="CAD"
            
            locale ="en-CA"
            autoReset
            InputElement={
            
              <Component               
                key={fieldId}
                id={fieldId}
                labelText={label}
                placeholder={item.placeholder}
                name={fieldId}
                style={{ marginBottom: "15px" }}
                invalid={!!error}
                invalidText={error || ""}
              />}
              >            
          </CurrencyInput>
        );  
      case "dropdown":
        const items =
          item.listItems?.map(({ value, text }) => ({ value, label: text })) ||
          [];
        const itemToString = (item: any) => (item ? item.label : "");

        // Retrieve the currently selected value based on the group state or form state
        const selectedValue = groupId
          ? groupStates[groupId]?.[groupIndex!]?.[fieldId]
          : formStates[fieldId];

        // Find the corresponding item from the list
        const selectedItem = items.find(
          (option) => option.value === selectedValue
        );

        return (
          <Component
            key={fieldId}
            id={fieldId}
            titleText={label}
            label={item.placeholder}
            items={items}
            itemToString={itemToString}
            selectedItem={selectedItem}
            onChange={({ selectedItem }: { selectedItem: any }) =>
              handleInputChange(
                fieldId,
                selectedItem.value,
                groupId,
                groupIndex
              )
            }
            style={{ marginBottom: "15px" }}
            readOnly={formData.readOnly || item.readOnly || !!item.calculatedValue}
            invalid={!!error}
            invalidText={error || ""}
          />
        );
      case "checkbox":
        return (
          <div style={{ marginBottom: "15px" }}>
            <Component
              key={fieldId}
              id={fieldId}
              labelText={label}
              name={fieldId}
              checked={
                groupId
                  ? groupStates[groupId]?.[groupIndex!]?.[fieldId] || false
                  : formStates[fieldId] || false
              }              
              onChange={({ checked }: { checked: boolean }) =>
                handleInputChange(fieldId, String(checked), groupId, groupIndex)
              }
              readOnly={formData.readOnly || item.readOnly || !!item.calculatedValue}
              invalid={!!error}
              invalidText={error || ""}
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
              toggled={
                groupId
                  ? groupStates[groupId]?.[groupIndex!]?.[fieldId] || false
                  : formStates[fieldId] || false
              }
              onToggle={(checked: boolean) =>
                handleInputChange(fieldId, checked, groupId, groupIndex)
              }
              readOnly={formData.readOnly || item.readOnly || !!item.calculatedValue}
              invalid={!!error}
              invalidText={error || ""}
            />
          </div>
        );
      case "date-picker":
        const selectedDate = groupId
          ? groupStates[groupId]?.[groupIndex!]?.[fieldId]
            ? parseISO(groupStates[groupId][groupIndex!][fieldId])
            : undefined
          : formStates[fieldId]
          ? parseISO(formStates[fieldId])
          : undefined;
        const dateFormat = item.mask || "Y-m-d";
        const internalDateFormat = "yyyy-MM-dd"; // Use this format to store internally
        return (
          <Component
            key={fieldId}
            datePickerType="single"
            value={selectedDate ? [selectedDate] : []}
            onChange={(dates: Date[]) => {
              if (dates.length === 0) {
                handleInputChange(fieldId, "", groupId, groupIndex);
              } else {
                // Save internal format for storage
                const internalFormattedDate = format(
                  dates[0],
                  internalDateFormat
                );
                // Save display format for rendering
                //const displayFormattedDate = format(dates[0], dateFormat);

                handleInputChange(
                  fieldId,
                  internalFormattedDate,
                  groupId,
                  groupIndex
                );
              }
            }}
            style={{ marginBottom: "15px" }}
            dateFormat={dateFormat}
            readOnly={formData.readOnly || item.readOnly || !!item.calculatedValue}
            invalid={!!error}
            invalidText={error || ""}
          >
            <DatePickerInput
              id={fieldId}
              placeholder={item.placeholder}
              labelText={label}
              readOnly={formData.readOnly || item.readOnly || !!item.calculatedValue}
              invalid={!!error}
              invalidText={error || ""}
            />
          </Component>
        );
      case "text-area":
        return (
          <Component
            key={fieldId}
            id={fieldId}
            labelText={label}
            placeholder={item.placeholder}
            helperText={item.helperText}
            name={fieldId}
            value={
              groupId
                ? groupStates[groupId]?.[groupIndex!]?.[fieldId] || ""
                : formStates[fieldId] || ""
            }
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleInputChange(fieldId, e.target.value, groupId, groupIndex)
            }
            rows={4}
            style={{ marginBottom: "15px" }}
            readOnly={formData.readOnly || item.readOnly || !!item.calculatedValue}
            invalid={!!error}
            invalidText={error || ""}
          />
        );
      case "button":
        return (
          <Component
            key={fieldId}
            id={fieldId}
            name={fieldId}
            size="md"            
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              handleInputChange(
                fieldId,
                e.currentTarget.value,
                groupId,
                groupIndex
              )
            }
            style={{ marginBottom: "15px" }}
          >
            {item.label}
          </Component>
        );
      case "number-input":
        return (
          <Component
            helperText={item.helperText}
            key={fieldId}
            id={fieldId}
            label={label}
            labelText={label}
            name={fieldId}
            hideSteppers="true"
            value={
              groupId
                ? groupStates[groupId]?.[groupIndex!]?.[fieldId] || 0
                : formStates[fieldId] || 0
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange(fieldId, e.target.value, groupId, groupIndex)
            }
            onClick={(e: React.MouseEvent<HTMLInputElement>) =>
              handleInputChange(
                fieldId,
                e.currentTarget.value,
                groupId,
                groupIndex
              )
            }
            invalid={!!error}
            invalidText={error || ""}
          />
        );
      case "text-info":
        return (
          <Component
            key={fieldId}
            id={fieldId}
            style={{
              marginBottom: item.style?.marginBottom,
              fontSize: item.style?.fontSize,
            }}
          >
            {item.label}
          </Component>
        );
      case "link":
        return (
          <Component id={fieldId} href={item.value} onClick={handleLinkClick}>
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
              accept={[".jpg", ".png"]}
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
        const radioOptions =
          item.listItems?.map(({ value, text }) => ({
            value: value,
            label: text,
          })) || [];
        return (
          <Component
            legendText={label}
            id={fieldId}
            name={fieldId}
            onChange={(value: string) =>
              handleInputChange(fieldId, value, groupId, groupIndex)
            }
            valueSelected={
              groupId
                ? groupStates[groupId]?.[groupIndex!]?.[fieldId]
                : formStates[fieldId]
            }
            readOnly={formData.readOnly || item.readOnly || !!item.calculatedValue}
            invalid={!!error}
            invalidText={error || ""}
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
            labelText={label}
            value={
              groupId
                ? groupStates[groupId]?.[groupIndex!]?.[fieldId]
                : formStates[fieldId]
            }
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleInputChange(fieldId, e.target.value, groupId, groupIndex)
            }
          >
            {itemsForSelect.map((itemForSelect) => (
              <SelectItem
                key={itemForSelect.value}
                value={itemForSelect.value}
                text={itemForSelect.text}
              />
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
                    <Column>
                      {renderComponent(groupField, item.id, groupIndex)}
                    </Column>
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
            {item.repeater && (
              <Button
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

  const createSavedData = () => {
    console.log("in createSavedData");
   /*  const saveFieldData: SavedFieldData = { ...formStates };
    Object.keys(groupStates).forEach((groupId) => {
      saveFieldData[groupId] = groupStates[groupId];
    }); */

    const saveFieldData: SavedFieldData = {};
    //save date based on visibility

     // For non-group fields
  formData.data.items.forEach((item) => {
    if (item.type !== "group" && shouldFieldBeIncludedForSaving(item)) {
      if (formStates[item.id] !== undefined) {
        saveFieldData[item.id] = formStates[item.id];
      }
    }
  });

  // For group fields
  formData.data.items.forEach((groupItem) => {
    if (groupItem.type === "group" && shouldFieldBeIncludedForSaving(groupItem)) {
      const visibleGroupItems = groupStates[groupItem.id]?.map((groupItemState, groupIndex) => {
        const filteredGroupItem: { [key: string]: FieldValue } = {};

        groupItem.groupItems?.[groupIndex]?.fields.forEach((field) => {
          if (shouldFieldBeIncludedForSaving(field, groupItem.id, groupIndex) && groupItemState[field.id] !== undefined) {
            filteredGroupItem[field.id] = groupItemState[field.id];
          }
        });

        return Object.keys(filteredGroupItem).length > 0 ? filteredGroupItem : null;
      });

      // Filter out any null values (groups where no fields were visible)
      const cleanedGroupItems = visibleGroupItems.filter((group) => group !== null);

      if (cleanedGroupItems.length > 0) {
        saveFieldData[groupItem.id] = cleanedGroupItems;
      }
    }
  });
    //save data based in visibility ends

    //SavedData
    data.metadata.updated_date = new Date().toLocaleDateString() + "";
    const savedData: SavedData = {
      data: saveFieldData,
      form_definition: data.form_definition,
      metadata: data.metadata,
    };
    console.log("Saved Data",JSON.stringify(savedData));
    return savedData;
  };

  const saveDataToApi = async () => {
    try {
      const saveDataEndpoint = import.meta.env
        .VITE_COMM_API_SAVEDATA_ENDPOINT_URL;
      const response = await fetch(saveDataEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createSavedData()),
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Result", result);
        return "success";
      } else {
        console.error("Error:", response.statusText);
        return "failed";
      }
    } catch (error) {
      console.error("Error:", error);
      return "failed";
    }
  };

  const validateAllFields = (): boolean => {
    const errors: { [key: string]: string | null } = {};
    let isValid = true;

    formData?.data?.items.forEach((item) => {
      if (item.type === "group" && item.groupItems) {
        if (isFieldVisible(item, null, null)) { // See if group is visible
          item.groupItems.forEach((groupItem, groupIndex) => {
            groupItem.fields.forEach((fieldInGroup) => {
              if (isFieldVisible(fieldInGroup, item.id, groupIndex)) {  // See if the filed in group is visible          
            
                const fieldIdInGroup = fieldInGroup.id;
                const fieldValueInGroup =
                  groupStates[item.id][groupIndex][fieldIdInGroup];
                const validationError = validateField(
                  fieldInGroup,
                  fieldValueInGroup
                );
                if (validationError) {
                  errors[fieldIdInGroup] = validationError;
                  isValid = false;
                }
              }
            });
          });
        }
      } else {
        const fieldId = item.id;
        const value = formStates[fieldId] || "";
        if (isFieldVisible(item, null, null)) {  // See if fields not in group is visible
          const validationError = validateField(item, value);
          if (validationError) {
            errors[fieldId] = validationError;
            isValid = false;
          }
      }
      }
    });

    setFormErrors(errors);
    console.log("errors>>>",errors);
    return isValid;
  };
  const handleSave = async () => {
    if (validateAllFields()) {
      const returnMessage = saveDataToApi();
      if ((await returnMessage) === "success") {
        window.alert("Form Saved Successfully!!!");
      } else {
        window.alert("Error saving form. Please try again !!!");
      }
    } else {
      window.alert("Please clear the errors in the form before saving !!!");
    }
  };

  const handleSaveAndClose = async () => {
    if (validateAllFields()) {
      const returnMessage = saveDataToApi();
      if ((await returnMessage) === "success") {
        window.opener = null;
        window.open("", "_self");
        window.close();
      } else {
        window.alert("Error saving form. Please try again !!!");
      }
    } else {
      window.alert("Please clear the errors in the form before saving !!!");
    }
  };

  return (
    <div>
      <div className="fixed-save-buttons">
        <Button onClick={handleSave} kind="primary">
          Save
        </Button>
        <Button onClick={handleSaveAndClose} kind="secondary">
          Save & Close
        </Button>
      </div>
      <div
        className="content-wrapper"
        style={{ maxWidth: "1000px", margin: "0 auto" }}
      >
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
              <Column>
                {renderComponent(
                  item,
                  item.type === "group" ? item.id : null,
                  index
                )}
              </Column>
            </Row>
          ))}
        </FlexGrid>
      </div>
    </div>
  );
};

export default Renderer;
