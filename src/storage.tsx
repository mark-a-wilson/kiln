// src/storage.ts
import localForage from 'localforage';

export const saveForm = async (formId: string, formData: any) => {
  await localForage.setItem(formId, formData);
};

export const loadForm = async (formId: string): Promise<object | null> => {
    const data = await localForage.getItem(formId);
    return data as object | null;
  };

export const getAllForms = async () => {
  const keys = await localForage.keys();
  const forms = await Promise.all(keys.map((key) => localForage.getItem(key)));
  return forms;
};
