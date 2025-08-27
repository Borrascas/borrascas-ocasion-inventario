
import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps {
    value: string;
    onValueChange: (value: string) => void;
    suggestions: string[];
    placeholder?: string;
    required?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ value, onValueChange, suggestions, placeholder, required }) => {
    const [inputValue, setInputValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredSuggestions = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) && inputValue.length > 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onValueChange(newValue);
        setShowSuggestions(true);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prevIndex => (prevIndex < filteredSuggestions.length - 1 ? prevIndex + 1 : prevIndex));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
                e.preventDefault();
                handleSuggestionClick(filteredSuggestions[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        onValueChange(suggestion);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };


    return (
        <div className="relative" ref={containerRef}>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                required={required}
                autoComplete="off"
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-600 shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm max-h-40">
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={suggestion}
                            className={`cursor-pointer select-none relative py-2 px-3 text-white ${activeIndex === index ? 'bg-blue-600' : 'hover:bg-blue-600/50'}`}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            <span className="block truncate">{suggestion}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteInput;
