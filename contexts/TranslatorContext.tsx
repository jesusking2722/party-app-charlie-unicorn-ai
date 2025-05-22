import React, { createContext, useState, useContext } from "react";

// Define translator context type
export interface TranslatorContextType {
  from: string;
  to: string;
  loading: boolean;
  error: string | null;
  translateText: (text: string) => Promise<string>;
  setLanguage: (lang: string) => void;
}

// Define translator props
export interface TranslatorProps {
  children: React.ReactNode;
  from: string;
  to: string;
  googleApiKey: string;
  cacheProvider?: {
    get: (language: string, key: string) => Promise<string | undefined>;
    set: (language: string, key: string, translation: string) => Promise<void>;
  };
}

// Create a context for the translator with default values
export const TranslatorContext = createContext<TranslatorContextType>({
  from: "en",
  to: "en",
  loading: false,
  error: null,
  translateText: async (text: string) => text,
  setLanguage: () => {},
});

/**
 * Main translator component that provides translation context
 */
const Translator: React.FC<TranslatorProps> = ({
  children,
  from,
  to,
  googleApiKey,
  cacheProvider,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>(to);
  const [cachedCount, setCachedCount] = useState<number>(0);
  const [lastTranslationTime, setLastTranslationTime] = useState<number>(0);

  // Rate limiting function to prevent API abuse
  const rateLimitTranslation = async <T extends unknown>(
    fn: () => Promise<T>
  ): Promise<T> => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastTranslationTime;
    const minDelay = 200; // milliseconds between requests

    // If we've made a request recently, wait before making another
    if (timeSinceLastRequest < minDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, minDelay - timeSinceLastRequest)
      );
    }

    setLastTranslationTime(Date.now());
    return fn();
  };

  // Function to translate text using Google Translate API
  const translateText = async (text: string): Promise<string> => {
    // Skip empty strings
    if (!text || text.trim() === "") {
      return text;
    }

    // Skip translation if languages are the same
    if (from === targetLanguage) {
      return text;
    }

    // Check if the translation is cached
    if (cacheProvider) {
      const cachedTranslation = await cacheProvider.get(targetLanguage, text);
      if (cachedTranslation) {
        setCachedCount((prev) => prev + 1);
        return cachedTranslation;
      }
    }

    // If no translation in cache, use Google Translate API
    try {
      setLoading(true);
      setError(null);

      // Apply rate limiting to API calls
      const translatedText = await rateLimitTranslation(async () => {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: text,
            source: from,
            target: targetLanguage,
            format: "text",
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message || "Translation error");
        }

        if (
          !data.data ||
          !data.data.translations ||
          !data.data.translations[0]
        ) {
          throw new Error("Invalid API response format");
        }

        return data.data.translations[0].translatedText;
      });

      if (cacheProvider) {
        await cacheProvider.set(targetLanguage, text, translatedText);
      }
      setLoading(false);
      return translatedText;
    } catch (err) {
      setLoading(false);
      return text; // Return original text on error
    }
  };

  // Context value to be provided
  const contextValue: TranslatorContextType = {
    from,
    to: targetLanguage,
    loading,
    error,
    translateText,
    setLanguage: setTargetLanguage,
  };

  return (
    <TranslatorContext.Provider value={contextValue}>
      {children}
    </TranslatorContext.Provider>
  );
};

// Hook for easy access to the translator context
export const useTranslator = (): TranslatorContextType => {
  const context = useContext(TranslatorContext);
  if (!context) {
    console.error("useTranslator must be used within a Translator component");
  }
  return context;
};

export default Translator;
