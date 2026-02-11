import React, { createContext, useContext, useState } from 'react';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
}

interface ContactFormContextType {
  formData: ContactFormData;
  setFormData: (data: Partial<ContactFormData>) => void;
  resetFormData: () => void;
}

const initialFormData: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: ''
};

const ContactFormContext = createContext<ContactFormContextType | undefined>(undefined);

export const ContactFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormDataState] = useState<ContactFormData>(initialFormData);

  const setFormData = (data: Partial<ContactFormData>) => {
    setFormDataState(prev => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormDataState(initialFormData);
  };

  return (
    <ContactFormContext.Provider value={{ formData, setFormData, resetFormData }}>
      {children}
    </ContactFormContext.Provider>
  );
};

export const useContactForm = () => {
  const context = useContext(ContactFormContext);
  if (!context) {
    throw new Error('useContactForm must be used within ContactFormProvider');
  }
  return context;
};
