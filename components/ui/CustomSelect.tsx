
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

interface CustomSelectOption<T> {
    value: T;
    label: string;
}

interface CustomSelectProps<T> {
    options: CustomSelectOption<T>[];
    value: T;
    onChange: (value: T) => void;
    placeholder?: string;
    className?: string;
}

const CustomSelect = <T extends string | 'All'>({ options, value, onChange, placeholder, className }: CustomSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (newValue: T) => {
        onChange(newValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className || 'w-full sm:w-48'}`} ref={selectRef}>
            <button
                type="button"
                className="relative w-full bg-gray-700/80 border border-gray-600 rounded-lg shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-full"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="block truncate text-white">{selectedOption ? selectedOption.label : placeholder}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
                </span>
            </button>
            {isOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-600 shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm animate-fade-in-sm">
                    {options.map(option => (
                        <li
                            key={String(option.value)}
                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 text-white hover:bg-blue-600/50 ${value === option.value ? 'bg-blue-600' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            <span className={`block truncate ${value === option.value ? 'font-semibold' : 'font-normal'}`}>{option.label}</span>
                        </li>
                    ))}
                </ul>
            )}
            <style>{`
                @keyframes fade-in-sm {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-sm { animation: fade-in-sm 0.15s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default CustomSelect;
