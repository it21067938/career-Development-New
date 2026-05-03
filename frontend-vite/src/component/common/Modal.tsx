import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  disableOverlayClick?: boolean; 
}

const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  size = "md",
  disableOverlayClick = false 
}: ModalProps) => {

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableOverlayClick) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, disableOverlayClick]); 

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !disableOverlayClick) {
          onClose();
        }
      }}
    >
      <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full ${sizes[size]} transition-colors duration-200`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white">{title}</h3>
          <Button variant="ghost" size="sm" iconOnly icon={<X size={16} />} onClick={onClose} />
        </div>

        {/* Body */}
        <div className="px-5 py-5 text-gray-600 dark:text-gray-300">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};