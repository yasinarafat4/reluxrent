import { getCookie, setCookie } from 'cookies-next';
import { createContext, useContext, useEffect, useState } from 'react';

export const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [lang, setLangState] = useState(null);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLang = getCookie('siteLang');

    if (savedLang) {
      try {
        setLangState(JSON.parse(savedLang));
      } catch {
        setLangState(savedLang);
      }
    } else {
      // 👇 fetch default lang from DB (via API)
      fetch('/api/default/language')
        .then((res) => res.json())
        .then((defaultLang) => {
          setLangState(defaultLang);
          setCookie('siteLang', JSON.stringify(defaultLang), {
            maxAge: 60 * 60 * 24 * 365,
          });
        });
    }
  }, []);

  useEffect(() => {
    if (!lang) return;

    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/translations/${lang.code}`)
      .then((res) => res.json())
      .then((data) => {
        setTranslations(data);
        setLoading(false);
      });
  }, [lang]);

  const setLang = (newLang) => {
    setLangState(newLang);
    setCookie('siteLang', JSON.stringify(newLang), { maxAge: 60 * 60 * 24 * 365 });
  };

  const trans = (key) => translations[key] || key;

  // if (loading || !lang) {
  //   return null;
  // }

  if (!lang) {
    return 'null'; // only block first mount if lang missing
  }

  return <TranslationContext.Provider value={{ lang, setLang, trans, loading }}>{children}</TranslationContext.Provider>;
};

export const useTranslation = () => useContext(TranslationContext);

// Create the i18nProvider compatible with React Admin
export const i18nProvider = {
  getTranslations: async (language) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/translations/${language}`);
    const data = await res.json();
    return data;
  },

  // Fetch a translation for a given key
  translate: (key) => {
    const { trans } = useTranslation();
    return trans(key);
  },

  getLocale: () => {
    const { lang } = useTranslation();
    return lang;
  },

  // Set a new language
  setLanguage: (language) => {
    const { setLang } = useTranslation();
    setLang(language);
  },
};
