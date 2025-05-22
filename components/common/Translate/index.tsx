import { useState, useEffect } from "react";
import { useTranslator } from "@/contexts/TranslatorContext";

const Translate = ({ children }: { children: string }) => {
  const { translateText, to } = useTranslator();
  const [translated, setTranslated] = useState(children);

  useEffect(() => {
    const translate = async () => {
      const result = await translateText(children);
      setTranslated(result);
    };

    translate();
  }, [children, to]);

  return <>{translated}</>;
};

export default Translate;
