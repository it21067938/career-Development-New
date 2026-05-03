import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast } from "../component/common/Toast";

type ToastType = "success" | "error" | "info" | "warning";
interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState({ isOpen: false, title: "", message: "", type: "info" as ToastType });

  const showToast = useCallback((type: ToastType, title: string, message: string) => {
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