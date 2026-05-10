import React from "react";
import { Loader2 } from "lucide-react";

const styles = {
  base: "inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:pointer-events-none",
  variant: {
    primary: "bg-primary-600 text-white hover:bg-primary-700 ",
    secondary: "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800",
    danger: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 hover:bg-red-100",
    ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
  },
  size: {
    sm: "h-[30px] px-2.5 text-xs rounded-md",
    md: "h-9 px-3.5 text-sm",
    lg: "h-[42px] px-5 text-sm",
  },
};

export const Button = ({
  variant = "primary", 
  size = "md", 
  loading = false, 
  icon = null, 
  iconOnly = false,
  className = "", 
  children, 
  ...props
}) => (
  <button
    className={`${styles.base} ${styles.variant[variant]} ${styles.size[size]} ${iconOnly ? "w-9 px-0" : ""} ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
    {!iconOnly && children}
  </button>
);