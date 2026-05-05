import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { TranslationProvider } from "@/components/TranslationProvider";
import LanguageBody from "@/components/LanguageBody";
import { Toaster } from "sonner";
import FloatingChat from "@/components/FloatingChat";

const geistSans = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#1f2937",
};

export const metadata: Metadata = {
  title: "Best Musical Instruments in Ethiopia - Traditional & Modern | Hone Musical Instruments",
  description:
    "Discover the best musical instruments in Ethiopia at Hone Musical Instruments. We offer a wide range of traditional and modern instruments, professional sound systems, and studio gear. Shop online for quality, expertise, and worldwide delivery.",
  keywords:
    "Best Musical Instrument in Ethiopia, traditional Ethiopian instruments, modern musical instruments Ethiopia, buy instruments Addis Ababa, sound system rental Ethiopia, studio equipment Ethiopia, Hone Musical Instruments",
  openGraph: {
    title: "Hone Musical Instruments - Best Traditional & Modern Instruments in Ethiopia",
    description: "Your premier destination for quality musical instruments and professional audio gear in Ethiopia. Traditional craftsmanship meets modern technology.",
    url: "https://honestore.com",
    siteName: "Hone Musical Instruments",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dglvpzqcl/image/upload/v1776616291/hone_store/qz7rfmsvsyh8kcekqehj.jpg",
        width: 1200,
        height: 630,
        alt: "Hone Musical Instruments Storefront",
      },
    ],
  },
  robots: "index, follow",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.className} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MusicStore",
              "name": "Hone Musical Instruments",
              "description": "The best musical instruments in Ethiopia, offering traditional and modern instruments, studio gear, and professional sound systems.",
              "url": "https://honestore.com",
              "logo": "https://honestore.com/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+251982616263",
                "contactType": "customer service",
                "areaServed": "ET",
                "availableLanguage": ["Amharic", "English", "Oromo"]
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Near Bethlehem plaza 2nd floor, Megenagna",
                "addressLocality": "Addis Ababa",
                "addressRegion": "Addis Ababa",
                "postalCode": "1000",
                "addressCountry": "ET"
              },
              "sameAs": [
                "https://www.facebook.com/profile.php?id=100064707545307",
                "https://www.instagram.com/honemusicalinstruments",
                "https://www.tiktok.com/@honemusicinstruments",
                "https://t.me/honemusicinstruments"
              ]
            })
          }}
        />
        <Toaster position="top-right" richColors />
        <TranslationProvider>
          <LanguageBody>{children}</LanguageBody>
          <FloatingChat />
        </TranslationProvider>
        <Analytics />
      </body>
    </html>
  );
}
