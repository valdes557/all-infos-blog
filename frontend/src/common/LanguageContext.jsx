import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

// Create context
export const LanguageContext = createContext({});

// Language Provider component
export const LanguageProvider = ({ children }) => {
    // Get initial language from localStorage or default to French
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('language');
        return saved || 'fr'; // Default to French
    });

    // Save language preference to localStorage
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    // Toggle between languages
    const toggleLanguage = () => {
        setLanguage(prev => prev === 'fr' ? 'en' : 'fr');
    };

    // Get translation for a specific path
    const t = (path) => {
        const keys = path.split('.');
        let result = translations[language];
        
        for (const key of keys) {
            if (result && result[key] !== undefined) {
                result = result[key];
            } else {
                // Fallback to French
                result = translations['fr'];
                for (const k of keys) {
                    if (result && result[k] !== undefined) {
                        result = result[k];
                    } else {
                        return path; // Return path if not found
                    }
                }
                break;
            }
        }
        
        return result;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Custom hook for using language context
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
