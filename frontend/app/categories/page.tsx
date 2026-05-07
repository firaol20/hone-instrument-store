import { Metadata } from 'next';
import CategoriesClient from '@/components/CategoriesClient';

export const metadata: Metadata = {
  title: 'Hone Instruments - Categories',
  description: 'Browse our musical instruments by category. Find pianos, guitars, drums, and audio equipment organized by type.',
  openGraph: {
    title: 'Hone Instruments - Categories',
    description: 'Explore musical instruments organized by category at Hone Musical Instruments',
    images: [
      {
        url: 'https://res.cloudinary.com/dglvpzqcl/image/upload/v1778093864/hone_store/website.jpg',
        width: 1200,
        height: 630,
        alt: 'Hone Instruments Categories'
      }
    ],
    siteName: 'Hone Musical Instruments'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}