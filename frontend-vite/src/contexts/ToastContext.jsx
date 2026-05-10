import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast } from "../component/common/Toast";

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [state, setState] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    type: "info" 
  });

  const showToast = useCallback((type, title, message) => {
    setState({ isOpen: true, type, title, message });
  }, []);

  const hideToast = useCallback(() => setState(p => ({ ...p, isOpen: false })), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast 
        isOpen={state.isOpen} 
        onClose={hideToast} 
        title={state.title} 
        message={state.message} 
        type={state.type} 
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};