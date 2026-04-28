import { create } from "zustand";
import { LanguageCode } from "./translations";

interface LangState {
  currentLang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
}

export const useLangStore = create<LangState>((set) => ({
  currentLang: "ENG",
  setLang: (lang) => set({ currentLang: lang }),
}));
