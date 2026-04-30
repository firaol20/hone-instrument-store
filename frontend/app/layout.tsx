import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { TranslationProvider } from "@/components/TranslationProvider";
import LanguageBody from "@/components/LanguageBody";
import { Toaster } from "sonner";

const geistSans = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#1f2937",
};

export const metadata: Metadata = {
  title: "Hone Musical Instruments, Studio Gear & Sound Systems",
  description:
    "Hone Music offers modern and traditional musical instruments, studio equipment, and soundproofing services. Enjoy worldwide delivery, music production courses, and free consultancy.",
  keywords:
    "Best Musical Instrument in Ethiopia ,musical instruments, sound system rental, studio equipment, stage lighting, music production course, instrument maintenance, soundproofing services, buy instruments online",
  openGraph: {
    title: "Hone Musical Instruments - Modern & Traditional Musical Instruments",
    description: "Your global source for musical instruments, professional sound systems, and studio equipment. We offer worldwide delivery and expert consultancy.",
    url: "https://honestore.com",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dglvpzqcl/image/upload/v1776616291/hone_store/qz7rfmsvsyh8kcekqehj.jpg",
        width: 1200,
        height: 630,
        alt: "Hone Music Storefront",
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
        <Toaster position="top-right" richColors />
        <TranslationProvider>
          <LanguageBody>{children}</LanguageBody>
        </TranslationProvider>
        <Analytics />
      </body>
    </html>
  );
}
