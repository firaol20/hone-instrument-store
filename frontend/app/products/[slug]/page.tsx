import { Metadata } from "next";
import ProductDetailClient from "@/components/ProductDetailClient";

export const metadata: Metadata = {
  title: 'Hone Instruments - Product Details',
  description: 'Explore detailed specifications, pricing, and availability for our premium musical instruments.',
  openGraph: {
    title: 'Hone Instruments - Product Details',
    description: 'View detailed information about our musical instruments and audio products.',
    images: [
      {
        url: 'https://res.cloudinary.com/dglvpzqcl/image/upload/v1778093864/hone_store/website.jpg',
        width: 1200,
        height: 630,
        alt: 'Hone Instruments Product Detail'
      }
    ],
    siteName: 'Hone Musical Instruments'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}