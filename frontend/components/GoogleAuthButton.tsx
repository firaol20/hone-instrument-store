"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthButtonProps {
  mode: "signin" | "signup";
}

export function GoogleAuthButton({ mode }: GoogleAuthButtonProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.google?.accounts?.id) {
        setScriptLoaded(true);
      } else {
        existingScript.addEventListener("load", () => setScriptLoaded(true), {
          once: true,
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !googleClientId || !window.google) {
      return;
    }

    const onCredential = async (response: { credential?: string }) => {
      if (!response.credential) {
        toast.error("Google login did not return a credential");
        return;
      }

      setLoading(true);
      try {
        const apiResponse = await authAPI.googleAuth({
          idToken: response.credential,
        });

        if (apiResponse.data.success) {
          const { token, refreshToken, userId, email, role } = apiResponse.data.data;
          setAuth({ _id: userId, email, role }, token, refreshToken);
          toast.success(
            mode === "signup"
              ? "Google signup successful"
              : "Google signin successful"
          );
          router.push("/products");
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Google authentication failed");
      } finally {
        setLoading(false);
      }
    };

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: onCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large", // Reduced from large
      text: mode === "signup" ? "signup_with" : "signin_with",
      shape: "pill",
      logo_alignment: "left", 
      width: Math.min(280, window.innerWidth - 80), // Reduced width for a cleaner look
    });
  }, [googleClientId, mode, router, scriptLoaded, setAuth]);

  if (!googleClientId) {
    return (
      <p className="text-xs text-slate-500 text-center">
        Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to enable Google auth.
      </p>
    );
  }

  return (
    <div className="flex justify-center w-full py-2">
      <div
        ref={buttonRef}
        className={loading ? "pointer-events-none opacity-70" : ""}
      />
    </div>
  );
}