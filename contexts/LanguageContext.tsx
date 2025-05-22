import React, { createContext, useState, useContext, useEffect } from "react";
import { useTranslator } from "./TranslatorContext";

// Available languages with their display names
export const AVAILABLE_LANGUAGES: Record<string, string> = {
  en: "English",
  pl: "Polski", // Polish
  es: "Español", // Spanish
  fr: "Français", // French
  de: "Deutsch", // German
  it: "Italiano", // Italian
  // ja: "日本語", // Japanese
  // ko: "한국어", // Korean
  // zh: "中文", // Chinese
  ru: "Русский", // Russian
  ar: "العربية", // Arabic
  pt: "Português", // Portuguese
  nl: "Nederlands", // Dutch
  // hi: "हिन्दी", // Hindi
  tr: "Türkçe", // Turkish
};

// Define language context type with all required properties
export interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  availableLanguages: Record<string, string>;
  isChangingLanguage: boolean;
}

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  availableLanguages: AVAILABLE_LANGUAGES,
  isChangingLanguage: false,
});

// Props for the provider component
interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: string;
}

/**
 * Provider component for language selection
 */
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = "en",
}) => {
  const [language, setLanguageState] = useState<string>(defaultLanguage);
  const [isChangingLanguage, setIsChangingLanguage] = useState<boolean>(false);

  // Persist language choice to localStorage
  const setLanguage = async (lang: string) => {
    try {
      // Validate language code
      if (!Object.keys(AVAILABLE_LANGUAGES).includes(lang)) {
        console.warn(`Language '${lang}' not supported, defaulting to English`);
        lang = "en";
      }

      // Show loading state while changing language
      setIsChangingLanguage(true);

      // Store in localStorage
      // localStorage.setItem("preferredLanguage", lang);

      // Update state
      setLanguageState(lang);

      // Reset loading state after a short delay to allow UI to update
      setTimeout(() => {
        setIsChangingLanguage(false);
      }, 500);
    } catch (err) {
      console.error("Error setting language:", err);
      setIsChangingLanguage(false);
    }
  };

  // Provide context value
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    availableLanguages: AVAILABLE_LANGUAGES,
    isChangingLanguage,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook for accessing the language context
 * @returns Language context value
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default { LanguageProvider, useLanguage, AVAILABLE_LANGUAGES };
