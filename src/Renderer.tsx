import "./App.css";
import "./print.css";
import '@carbon/styles/css/styles.css';
import "./page.scss";
//import { Previewer } from "pagedjs";
//import { PagedPolyfill } from "pagedjs";
//import { PagedPolyfill, Previewer } from "pagedjs";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthenticationContext } from "./App";
import {
  TextInput,
  Dropdown,
  Checkbox,
  Toggle,
  DatePicker,
  DatePickerInput,
  Row,
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
import { parseISO, format as formatDate, parse } from "date-fns";
import { FlexGrid } from "@carbon/react";
import { Add, Subtract } from '@carbon/icons-react';
import InputMask from "react-input-mask";
import { CurrencyInput } from "react-currency-mask";
import {
  generateUniqueId,
  handleLinkClick,
  validateField,
  isFieldRequired,

} from "./utils/helpers"; // Import from the helpers file
//import Paged from 'pagedjs';
//import  { Previewer } from 'pagedjs';
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
  repeaterItemLabel?: string;
  validation?: {
    type: string;
    value: string | number | boolean;
    errorMessage: string;
  }[];
  //saveOnSubmit?:boolean;
  //readOnly?:boolean;
  conditions?: {
    type: string;
    value: string;
  }[];
  customStyle?: {
    webColumns: string;
    printColumns: string;
    pageBreak: string;
  }


}

interface Template {
  version: string;
  ministry_id: string;
  id: string;
  lastModified: string;
  title: string;
  readOnly?: boolean;
  form_id: string;
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
  "date": DatePicker,
  "text-area": TextArea,
  button: Button,
  "number-input": NumberInput,
  "text-info": "div",
  link: Link,
  file: FileUploader,
  table: DynamicTable,
  group: FlexGrid,
  radio: RadioButtonGroup,
  select: Select,
  "currency-input": TextInput,
};

interface RendererProps {
  data: any,
  mode: string;
  goBack?: () => void; // Add a goBack prop
}



const Renderer: React.FC<RendererProps> = ({ data, mode, goBack }) => {
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

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const keycloak = useContext(AuthenticationContext);

  useEffect(() => {
    const initialFormStates: { [key: string]: string } = {};
    const initialGroupStates: { [key: string]: GroupState } = {}; // Changed type here


    const formId = formData.form_id || "Unknown Form ID";

    // Generate the creation date dynamically
    const creationDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });


    // Set these values as attributes on the <body> tag
    document.documentElement.setAttribute("data-form-id", formId);
    document.documentElement.setAttribute("data-date", creationDate);
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

  const shouldFieldBeIncludedForSaving = (item: Item, groupId: string | null = null,
    groupIndex: number | null = null): boolean => {

    if (isFieldVisible(item, groupId, groupIndex) || doesFieldHasCondition("saveOnSubmit", item, groupId, groupIndex)) {
      return true; // Field is not visible based on condition
    }

    return false;
  }

  const isFieldVisible = (item: Item, groupId: string | null = null,
    groupIndex: number | null = null): boolean => {

    if (!item.conditions || item.conditions.length === 0) {
      return true; // Default to visible if there are no conditions
    }

    const visibilityCondition = item.conditions.find(condition => condition.type === 'visibility');

    if (visibilityCondition) {
      try {
        // If the field is in a group, pass groupStates and groupIndex
        if (groupId !== null && groupIndex !== null) {
          const conditionFunction = new Function(
            "formStates",
            "groupStates",
            "groupId",
            "groupIndex",
            visibilityCondition.value
          );

          return conditionFunction(formStates, groupStates, groupId, groupIndex);
        } else {
          // For non-group fields, evaluate using formStates
          const conditionFunction = new Function(
            "formStates",
            "groupStates",
            visibilityCondition.value
          );
          return conditionFunction(formStates, groupStates);
        }
      } catch (error) {
        console.error("Error evaluating condition script:", error);
        return true; // Default to visible if the script fails
      }
    } else {
      return true;
    }

  }

  const executeCalculatedValueAndSetIfExists = (item: Item, groupId: string | null = null,
    groupIndex: number | null = null): boolean => {

    if (!item.conditions || item.conditions.length === 0) {
      return false; // Default to false if there are no conditions
    }

    const calculatedValCondition = item.conditions.find(condition => condition.type === 'calculatedValue');

    if (calculatedValCondition) {
      try {
        let calculatedFieldValue = "";

        const calculationFunction = new Function(
          "formStates",
          "groupStates",
          "groupId",
          "groupIndex",
          calculatedValCondition.value
        );


        calculatedFieldValue = calculationFunction(formStates, groupStates, groupId, groupIndex);

        let currentValue;

        if (groupId !== null && groupIndex !== null) {
          currentValue = groupStates[groupId]?.[groupIndex]?.[item.id];
        } else {
          currentValue = formStates[item.id];
        }
        if (calculatedFieldValue !== currentValue) {
          setFieldValue(item.id, calculatedFieldValue, groupId, groupIndex);

        }
        return true;

      } catch (error) {

        return false; // Default to false if the script fails
      }
    }


    return false;
  }

  const doesFieldHasCondition = (type: string, item: Item, groupId: string | null = null,
    groupIndex: number | null = null): boolean => {

    if (!item.conditions || item.conditions.length === 0) {
      return false; // Default to false if there are no conditions
    }
    const typeCondition = item.conditions.find((condition) => condition.type === type);
    if (typeCondition) {
      try {


        const typeConditionFunction = new Function(
          "formStates",
          "groupStates",
          "groupId",
          "groupIndex",
          typeCondition.value
        );
        return typeConditionFunction(formStates, groupStates, groupId, groupIndex);
      } catch (error) {
        return false; // Default to false if the script fails
      }
    }
    return false;
  }

  const setFieldValue = (fieldId: string,
    value: any,
    groupId: string | null = null,
    groupIndex: number | null = null) => {
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


  const renderComponent = (
    item: Item,
    groupId: string | null = null,
    groupIndex: number | null = null
  ) => {
    const Component = componentMapping[item.type];
    if (!Component) return null;

    const calcValExists = executeCalculatedValueAndSetIfExists(item, groupId, groupIndex);


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
          <><InputMask
            className="field-container no-print"



            mask={item.mask || ''}
            value={
              groupId
                ? groupStates[groupId]?.[groupIndex!]?.[fieldId] || ""
                : formStates[fieldId] || ""
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange(fieldId, e.target.value, groupId, groupIndex)

            }

            readOnly={formData.readOnly || doesFieldHasCondition("readOnly", item, groupId, groupIndex) || calcValExists || mode == "view"}

          >
            <Component
              className="field-container"
              key={fieldId}
              id={fieldId}
              labelText={label}
              placeholder={item.placeholder}
              helperText={item.helperText}
              name={fieldId}
              style={{ marginBottom: "5px" }}
              invalid={!!error}
              invalidText={error || ""}

            />
          </InputMask>
            <div className="hidden-on-screen cds--text-input-wrapper">
              <div className="cds--text-input__label-wrapper">
                <label className="cds--label" dir="auto"><span>{label}</span> </label>
              </div>
              <div className="cds--text-input__field-outer-wrapper">
                <div className="cds--text-input__field-wrapper">
                  {
                    groupId
                      ? groupStates[groupId]?.[groupIndex!]?.[fieldId] || ""
                      : formStates[fieldId] || ""
                  }
                </div>
              </div>

              <div className="cds--form__helper-text" dir="auto">{item.helperText}</div>
            </div>
          </>
        );
      case "currency-input":
        return (
          <CurrencyInput
            value={
              groupId
                ? groupStates[groupId]?.[groupIndex!]?.[fieldId] || ""
                : formStates[fieldId] || ""
            }
            /* onChangeValue={(e: React.ChangeEvent<HTMLInputElement>) =>{
              console.log("Input Value:", e.target.value);
              handleInputChange(fieldId, e.target.value.replace(/^\$/, ''), groupId, groupIndex)
            }
          } */
            onChangeValue={(event, originalValue, maskedValue) => {
              console.log(event, originalValue, maskedValue);
              handleInputChange(fieldId, originalValue, groupId, groupIndex)
            }}
            currency="CAD"

            locale="en-CA"
            autoReset={false}
            InputElement={

              <Component
                className="field-container"
                key={fieldId}
                id={fieldId}
                labelText={label}
                placeholder={item.placeholder}
                name={fieldId}
                style={{ marginBottom: "5px" }}
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
          <>
            <Component
              key={fieldId}
              id={fieldId}
              titleText={label}
              className="field-container no-print"
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
              style={{ marginBottom: "5px" }}
              readOnly={formData.readOnly || doesFieldHasCondition("readOnly", item, groupId, groupIndex) || calcValExists || mode == "view"}
              invalid={!!error}
              invalidText={error || ""}

            />
            <div className="hidden-on-screen cds--text-input-wrapper">
              <div className="cds--text-input__label-wrapper">
                <label className="cds--label" dir="auto"><span>{label}</span> </label>
              </div>
              <div className="cds--text-input__field-outer-wrapper">
                <div className="cds--text-input__field-wrapper">
                  {
                    selectedItem?.label
                  }
                </div>
              </div>

              <div className="cds--form__helper-text" dir="auto">{item.helperText}</div>
            </div>
          </>
        );
      case "checkbox":
        return (
          <div style={{ marginBottom: "5px" }}>
            <Component
              className="field-container"
              key={fieldId}
              id={fieldId}
              labelText={item.label}

              checked={
                groupId
                  ? groupStates[groupId]?.[groupIndex!]?.[fieldId] ?? false
                  : formStates[fieldId] ?? false
              }
              /* onChange={(checked: boolean) => {
                console.log("checked",checked);
                handleInputChange(fieldId, String(checked), groupId, groupIndex)
              }
            } */
              onChange={(event: { checked: boolean }) => {
                console.log("checked", event.checked);
                handleInputChange(fieldId, String(event?.checked ?? false), groupId, groupIndex)
              }
              }
              readOnly={formData.readOnly || doesFieldHasCondition("readOnly", item, groupId, groupIndex) || calcValExists || mode == "view"}
              invalid={!!error}
              invalidText={error || ""}
            />
          </div>
        );
      case "toggle":
        return (
          <div key={fieldId} style={{ marginBottom: "25px" }}>

            <Component
              className="field-container"
              id={fieldId}
              labelText={item.label}
              labelA={item.offText || "No"}
              labelB={item.onText || "Yes"}
              size={item.size}
              toggled={
                groupId
                  ? groupStates[groupId]?.[groupIndex!]?.[fieldId] || false
                  : formStates[fieldId] || false
              }
              onToggle={(checked: boolean) =>
                handleInputChange(fieldId, checked, groupId, groupIndex)
              }
              readOnly={formData.readOnly || doesFieldHasCondition("readOnly", item, groupId, groupIndex) || calcValExists || mode == "view"}
              invalid={!!error}
              invalidText={error || ""}
            />
          </div>
        );
      case "date":
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
          <>
            <Component
              className="field-container no-print"
              key={fieldId}
              datePickerType="single"
              value={selectedDate ? [selectedDate] : []}
              onChange={(dates: Date[]) => {
                if (dates.length === 0) {
                  handleInputChange(fieldId, "", groupId, groupIndex);
                } else {
                  // Save internal format for storage
                  const internalFormattedDate = formatDate(
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
              style={{ marginBottom: "5px" }}
              dateFormat={dateFormat}
              readOnly={formData.readOnly || doesFieldHasCondition("readOnly", item, groupId, groupIndex) || calcValExists || mode == "view"}
              invalid={!!error}
              invalidText={error || ""}

            >
              <DatePickerInput
                id={fieldId}
                placeholder={item.placeholder}
                labelText={label}
                readOnly={formData.readOnly || doesFieldHasCondition("readOnly", item, groupId, groupIndex) || calcValExists || mode == "view"}
                invalid={!!error}
                invalidText={error || ""}
                helperText={item.helperText}

              />
            </Component>
            <div className="hidden-on-screen cds--text-input-wrapper">
              <div className="cds--text-input__label-wrapper">
                <label className="cds--label" dir="auto"><span>{label}</span> </label>
              </div>
              <div className="cds--text-input__field-outer-wrapper">
                <div className="cds--text-input__field-wrapper">
                  {
                    groupId
                      ? groupStates[groupId]?.[groupIndex!]?.[fieldId] || ""
                      : formStates[fieldId] || ""
                  }
                </div>
              </div>

              <div className="cds--form__helper-text" dir="auto">{item.helperText}</div>
            </div>
          </>
        );
      case "text-area":
        return (
          <Component
            key={fieldId}
            className="field-container"
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
            style={{ marginBottom: "5px" }}
            readOnly={formData.readOnly || doesFieldHasCondition("readOnly", item, groupId, groupIndex) || calcValExists || mode == "view"}
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
            style={{ marginBottom: "5px" }}
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
        const textInfo = item.value || "";
        return (

          <Component
            className="text-block field-container"
            key={fieldId}
            id={fieldId}
            dangerouslySetInnerHTML={{ __html: parseDynamicText(textInfo) }}
          />

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
          <div key={fieldId} style={{ marginBottom: "5px" }}>
            <Component
              className="field-container"
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
              readOnly={formData.readOnly || doesFieldHasCondition("readOnly", item, groupId, groupIndex) || calcValExists || mode == "view"}
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
            </Component></div>
        );

      case "select":
        const itemsForSelect = item.listItems || [];
        return (
          <>
            <Select
              className="field-container no-print"
              id={fieldId}
              name={fieldId}
              labelText={label}
              helperText={item.helperText}
              value={
                groupId
                  ? groupStates[groupId]?.[groupIndex!]?.[fieldId]
                  : formStates[fieldId]
              }
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleInputChange(fieldId, e.target.value, groupId, groupIndex)
              }

              invalid={!!error}
              invalidText={error || ""}
            >
              <SelectItem value="" text="" />
              {itemsForSelect.map((itemForSelect) => (
                <SelectItem
                  key={itemForSelect.value}
                  value={itemForSelect.value}
                  text={itemForSelect.text}
                />
              ))}
            </Select>
            <div className="hidden-on-screen cds--text-input-wrapper">
              <div className="cds--text-input__label-wrapper">
                <label className="cds--label" dir="auto"><span>{label}</span> </label>
              </div>
              <div className="cds--text-input__field-outer-wrapper">
                <div className="cds--text-input__field-wrapper">
                  {
                    groupId
                      ? groupStates[groupId]?.[groupIndex!]?.[fieldId] || ""
                      : formStates[fieldId] || ""
                  }
                </div>
              </div>

              <div className="cds--form__helper-text" dir="auto">{item.helperText}</div>
            </div>
          </>
        );
      case "group":
        return (
          <div key={item.id} className="group-container">
            <div className="group-header">{item.label}</div>
            {item.groupItems?.map((groupItem, groupIndex) => (
              <div key={`${item.id}-${groupIndex}`} className="group-item-container">
                {item.repeater && (<div className="group-item-header">{item.repeaterItemLabel || item.label} {groupIndex + 1}</div>)}
                <div
                  className="group-fields-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "15px",
                  }}
                >
                  {groupItem.fields.map((groupField) => (
                    <div
                      key={groupField.id}
                      style={{
                        gridColumn: `span ${groupField.customStyle?.webColumns || 4}`,
                        marginBottom: "5px",
                      }}
                      data-print-columns={groupField.customStyle?.printColumns || 4}
                    >
                      {renderComponent(groupField, item.id, groupIndex)}
                    </div>
                  ))}
                </div>
                {item.groupItems && item.groupItems.length > 1 && (mode == "edit" || goBack) && formData.readOnly != true && (
                  <Button
                    kind="ghost"
                    onClick={() => handleRemoveGroupItem(item.id, groupIndex)}
                    renderIcon={Subtract}
                    className="no-print"
                  >
                    Remove {item.label} {groupIndex + 1}
                  </Button>
                )}
              </div>
            ))}
            {item.repeater && (mode == "edit" || goBack) && formData.readOnly != true && (
              <Button
                kind="ghost"
                onClick={() => handleAddGroupItem(item.id)}
                renderIcon={Add}
                className="no-print"
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
    console.log("Saved Data", JSON.stringify(savedData));
    return savedData;
  };


  const saveDataToICMApi = async () => {
    try {
      const saveDataICMEndpoint = import.meta.env.VITE_COMM_API_SAVEDATA_ICM_ENDPOINT_URL;
      const queryParams = new URLSearchParams(window.location.search);
      const params: { [key: string]: string | null } = {};
      const token = keycloak.token;
      queryParams.forEach((value, key) => {
        params[key] = value;
      });
      const savedJson = {
        "attachmentId": params["attachmentId"],
        "OfficeName": params["OfficeName"],
        token,
        "savedForm": JSON.stringify(createSavedData())
      };

      const response = await fetch(saveDataICMEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(savedJson),
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Result ", result);
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
    return isValid;
  };
  const unlockICMFinalFlags = async () => {
    try {
      const unlockICMFinalEdpoint = import.meta.env.VITE_COMM_API_UNLOCK_ICM_FORM_URL;
      const queryParams = new URLSearchParams(window.location.search);
      const params: { [key: string]: string | null } = {};
      const token = keycloak.token;
      queryParams.forEach((value, key) => {
        params[key] = value;
      });

      const response = await fetch(unlockICMFinalEdpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...params,
          token,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Result ", result);
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

  const handleSave = async () => {
    if (validateAllFields()) {
      const returnMessage = saveDataToICMApi();
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
      const returnMessage = saveDataToICMApi();
      if ((await returnMessage) === "success") {
        const unlockMessage = unlockICMFinalFlags();
        if ((await unlockMessage) == "success") {
          window.opener = null;
          window.open("", "_self");
          window.close();
        }
        else { window.alert("Error clearing locked flags. Please try again."); }
      } else {
        window.alert("Error saving form. Please try again !!!");
      }
    } else {
      window.alert("Please clear the errors in the form before saving !!!");
    }
  };


  const handlePrint = async () => {
    try {

      const originalTitle = document.title;
      document.title = formData.form_id || 'CustomFormName';
      // Create metadata elements
      const metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      metaDescription.content = 'Form PDF.';

      const metaAuthor = document.createElement('meta');
      metaAuthor.name = 'author';
      metaAuthor.content = 'KILN';

      const metaLanguage = document.createElement('meta');
      metaLanguage.httpEquiv = 'Content-Language';
      metaLanguage.content = 'en';

      // Append metadata to the <head>
      const head = document.head;
      head.appendChild(metaDescription);
      head.appendChild(metaAuthor);
      head.appendChild(metaLanguage);


      window.print();
      document.title = originalTitle;
      head.removeChild(metaDescription);
      head.removeChild(metaAuthor);
      head.removeChild(metaLanguage);


    } catch (error) {
      console.error("Error during print:", error);
    }
  };


  const ministryLogoPath = `${window.location.origin}/ministries/${formData.ministry_id}.png`;

  const parseDynamicText = (text: string): string => {
    const regex = /{(formStates\['(.*?)']|groupStates\['(.*?)']\?\.\[(.*?)!?\]\?\.\['(.*?)'])\|?(format:([\w/-]+))?}/g;

    return text.replace(regex, (_match, _fullMatch, fieldId, groupId, groupIndex, nestedFieldId, _formatMatch, format) => {
      let value: string | undefined;

      // Check if it's a formStates match
      if (fieldId) {
        value = formStates[fieldId];
      }
      // Check if it's a groupStates match
      else if (groupId && groupIndex && nestedFieldId) {
        value = groupStates[groupId]?.[groupIndex]?.[nestedFieldId];
      }

      // If no value is found, return the default blank line
      if (!value) return '______________________________';

      // Handle date formatting if a format is specified
      if (format && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        try {
          const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
          return formatDate(parsedDate, format);
        } catch (error) {
          console.error('Date formatting error:', error);
          return 'Invalid Date';
        }
      }

      // Return the value as is if no formatting is required
      return value;
    });
  };

  return (

    <div ref={pdfContainerRef} >

      <div className="header-section fixed">
        <div className="header-image">
          <div className="header-image-only">

            {formData.ministry_id && (
              <img
                src={ministryLogoPath}
                width="232px"
                alt="ministry logo"

              />
            )}
          </div>
          <div className="header-buttons-only">
            {mode == "edit" && formData.readOnly != true && (
              <>
                <Button onClick={handleSave} kind="secondary" className="no-print">
                  Save
                </Button>
                <Button onClick={handleSaveAndClose} kind="secondary" className="no-print">
                  Save And Close
                </Button>

              </>
            )}
            {goBack && (
              <Button onClick={goBack} kind="secondary" className="no-print">
                Back
              </Button>
            )}
            <Button kind="secondary" onClick={handlePrint} className="no-print">
              Print
            </Button>
          </div>




        </div>
      </div>
      <div className="scrollable-content">
        <div className="header-section">
          <div className="header-title-buttons">
            <div className="header-title-only" >
              {formData.title} {goBack && (<span>(Preview)</span>)}
            </div>

          </div>
        </div>



        <div className="content-wrapper">
          <FlexGrid>
            <Row >
              {formData.data.items.map((item, index) => (
                <div
                  key={item.id}
                  style={{ gridColumn: `span ${item.customStyle?.webColumns || 4}`, marginBottom: "5px", breakBefore: item.customStyle?.pageBreak as React.CSSProperties["breakBefore"] || "auto" }}
                  data-print-columns={item.customStyle?.printColumns || 4}>
                  {renderComponent(
                    item,
                    item.type === "group" ? item.id : null,
                    index
                  )}
                </div>
              ))}
            </Row>
          </FlexGrid>
        </div>
      </div>

      <div id="footer" style={{ display: 'none' }}>
        Form ID: Form-12345
      </div>
      <div className="paged-page" data-footer-text=""></div>
    </div>

  );
};

export default Renderer;
