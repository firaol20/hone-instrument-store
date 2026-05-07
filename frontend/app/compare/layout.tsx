import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Musical Instruments | Hone Musical Instruments',
  description: 'Compare pianos, guitars, and other musical instruments side-by-side to find the perfect match for your rhythm at Hone Musical Instruments.',
  openGraph: {
    title: 'Compare Musical Instruments | Hone Musical Instruments',
    description: 'Find your perfect instrument by comparing specs, prices, and features side-by-side.',
    images: ['https://res.cloudinary.com/dglvpzqcl/image/upload/v1778093864/hone_store/website.jpg'],
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
