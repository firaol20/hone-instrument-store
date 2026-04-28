"use client";

import { ReactNode } from "react";
import { useLangStore } from "@/lib/lang-store";

export default function LanguageBody({ children }: { children: ReactNode }) {
  const currentLang = useLangStore((state) => state.currentLang);

  return (
    <div
      className={currentLang === "AMH" ? "leading-relaxed" : "leading-normal"}
    >
      {children}
    </div>
  );
}
