import AsyncStorage from "@react-native-async-storage/async-storage";

interface CachedItem {
  translation: string;
  timestamp: number;
}

interface TranslationCache {
  [key: string]: {
    [language: string]: CachedItem;
  };
}

const CACHE_TTL = 24 * 60 * 60 * 1000;
const CACHE_PREFIX = "PartyApp_translation_";
const MAX_CACHE_SIZE_MB = 5;

// Helpers
const getCacheKey = () => `${CACHE_PREFIX}`;

/**
 * Clean expired entries from the cache
 */
const cleanCache = (translations: TranslationCache): void => {
  const now = Date.now();
  Object.keys(translations).forEach((key) => {
    Object.keys(translations[key]).forEach((lang) => {
      if (now - translations[key][lang].timestamp > CACHE_TTL) {
        delete translations[key][lang];
      }
    });
    if (Object.keys(translations[key]).length === 0) {
      delete translations[key];
    }
  });
};

const checkCacheSize = (translations: TranslationCache): number => {
  try {
    const json = JSON.stringify(translations);
    return json.length * 2;
  } catch {
    return 0;
  }
};

const reduceCacheSize = (translations: TranslationCache): void => {
  const entries: { key: string; lang: string; timestamp: number }[] = [];

  Object.keys(translations).forEach((textKey) => {
    Object.keys(translations[textKey]).forEach((lang) => {
      entries.push({
        key: textKey,
        lang,
        timestamp: translations[textKey][lang].timestamp,
      });
    });
  });

  entries.sort((a, b) => a.timestamp - b.timestamp);
  let currentSize = checkCacheSize(translations);
  const targetSize = MAX_CACHE_SIZE_MB * 1024 * 1024 * 0.8;

  while (currentSize > targetSize && entries.length > 0) {
    const oldest = entries.shift();
    if (!oldest) break;

    delete translations[oldest.key][oldest.lang];
    if (Object.keys(translations[oldest.key]).length === 0) {
      delete translations[oldest.key];
    }

    currentSize = checkCacheSize(translations);
  }
};

const cacheProvider = {
  get: async (language: string, key: string): Promise<string | undefined> => {
    try {
      const cacheKey = getCacheKey();
      const raw = await AsyncStorage.getItem(cacheKey);
      const translations: TranslationCache = JSON.parse(raw || "{}");

      if (!translations[key] || !translations[key][language]) return undefined;

      const cached = translations[key][language];
      if (Date.now() - cached.timestamp > CACHE_TTL) {
        delete translations[key][language];
        if (Object.keys(translations[key]).length === 0) {
          delete translations[key];
        }
        await AsyncStorage.setItem(cacheKey, JSON.stringify(translations));
        return undefined;
      }

      return cached.translation;
    } catch (err) {
      console.error("AsyncStorage GET error:", err);
      await AsyncStorage.removeItem(getCacheKey());
      return undefined;
    }
  },

  set: async (
    language: string,
    key: string,
    translation: string
  ): Promise<void> => {
    try {
      const cacheKey = getCacheKey();
      const raw = await AsyncStorage.getItem(cacheKey);
      const translations: TranslationCache = JSON.parse(raw || "{}");

      if (!translations[key]) translations[key] = {};
      translations[key][language] = {
        translation,
        timestamp: Date.now(),
      };

      cleanCache(translations);
      if (checkCacheSize(translations) > MAX_CACHE_SIZE_MB * 1024 * 1024) {
        reduceCacheSize(translations);
      }

      await AsyncStorage.setItem(cacheKey, JSON.stringify(translations));
    } catch (err) {
      console.error("AsyncStorage SET error:", err);
    }
  },

  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(getCacheKey());
      console.log("Translation cache cleared");
    } catch (err) {
      console.error("AsyncStorage CLEAR error:", err);
    }
  },

  getStats: async (): Promise<{
    entries: number;
    languages: string[];
    size: string;
    oldestEntry: string;
  }> => {
    try {
      const cacheKey = getCacheKey();
      const raw = await AsyncStorage.getItem(cacheKey);
      if (!raw) {
        return {
          entries: 0,
          languages: [],
          size: "0 KB",
          oldestEntry: "-",
        };
      }

      const translations: TranslationCache = JSON.parse(raw);
      const languages = new Set<string>();
      let entries = 0;
      let oldestTimestamp = Date.now();

      Object.values(translations).forEach((entry) => {
        Object.entries(entry).forEach(([lang, { timestamp }]) => {
          languages.add(lang);
          entries++;
          if (timestamp < oldestTimestamp) oldestTimestamp = timestamp;
        });
      });

      return {
        entries,
        languages: Array.from(languages),
        size: (raw.length / 1024).toFixed(2) + " KB",
        oldestEntry: new Date(oldestTimestamp).toLocaleString(),
      };
    } catch (err) {
      console.error("AsyncStorage STATS error:", err);
      return {
        entries: 0,
        languages: [],
        size: "0 KB",
        oldestEntry: "-",
      };
    }
  },
};

export default cacheProvider;
