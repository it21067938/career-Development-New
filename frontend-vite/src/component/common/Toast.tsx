import { useEffect } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

const config: Record<ToastType, { bg: string; border: string; text: string; Icon: any }> = {
  success: { bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-900/30",  text: "text-green-700 dark:text-green-400", Icon: CheckCircle },
  error:   { bg: "bg-red-50 dark:bg-red-900/20",    border: "border-red-200 dark:border-red-900/30",    text: "text-red-700 dark:text-red-400",     Icon: XCircle },
  info:    { bg: "bg-blue-50 dark:bg-blue-900/20",   border: "border-blue-200 dark:border-blue-900/30",  text: "text-blue-700 dark:text-blue-400",   Icon: Info },
  warning: { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-900/30", text: "text-amber-700 dark:text-amber-400", Icon: AlertTriangle },
};

export const Toast = ({ isOpen, onClose, title, message, type = "info", duration = 5000 }: ToastProps) => {
  useEffect(() => {
    if (!isOpen || !duration) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const { bg, border, text, Icon } = config[type];

  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-start gap-2.5 p-3.5 rounded-xl border max-w-xs w-full animate-toast-slide-in ${bg} ${border}`}>
      <Icon size={18} className={`${text} mt-0.5 shrink-0`} />
      <div className="flex-1">
        <p className={`text-[13px] font-bold ${text}`}>{title}</p>
        <p className={`text-[12px] mt-0.5 leading-tight ${text} opacity-90`}>{message}</p>
      </div>
      <button onClick={onClose} className={`${text} opacity-60 hover:opacity-100 p-0.5 transition-opacity`}>
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
};