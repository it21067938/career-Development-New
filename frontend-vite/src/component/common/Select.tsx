import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectProps {
  label: React.ReactNode;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  options: { value: string; label: string }[];
}

export const Select = ({ label, options, value, onChange }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>

      <div className="relative group">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-10 pl-4 pr-3.5 flex items-center justify-between text-[13.5px] font-medium 
                     bg-white dark:bg-gray-900 border rounded-xl cursor-pointer transition-all duration-200
                     ${isOpen 
                       ? 'border-primary-500 ring-2 ring-primary-500/10' 
                       : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}
        >
          <span className={`truncate mr-2 ${selectedOption ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : 'Select option'}
          </span>
          
          <ChevronDown 
            size={16} 
            strokeWidth={2.5} 
            className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl animate-in fade-in zoom-in duration-150 overflow-hidden">
            <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
              {options.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange({ target: { value: opt.value } });
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 text-[13px] flex items-center justify-between cursor-pointer transition-colors
                             ${value === opt.value 
                               ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-bold' 
                               : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <Check size={14} strokeWidth={3} className="shrink-0 ml-2" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};