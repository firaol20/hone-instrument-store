"use client";

import { ReactNode } from "react";
import { useLangStore } from "@/lib/lang-store";

export default function LanguageBody({ children }: { children: ReactNode }) {
  return (
    <div className="leading-relaxed">
      {children}
    </div>
  );
}
