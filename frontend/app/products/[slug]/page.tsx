import { Metadata } from "next";
import ProductDetailClient from "@/components/ProductDetailClient";
import { productsAPI } from "@/lib/api";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await productsAPI.getBySlug(params.slug);
    const product = response.data?.data || response.data;

    if (!product) return { title: 'Product Not Found - Hone Instruments' };

    const title = `${product.name} - Hone Musical Instruments`;
    const description = product.description?.substring(0, 160) || `Buy ${product.name} at the best price in Ethiopia. Quality musical instruments at Hone Instruments.`;
    const image = product.images?.[0]?.url || 'https://res.cloudinary.com/dglvpzqcl/image/upload/v1778093864/hone_store/website.jpg';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: image }],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      }
    };
  } catch (error) {
    return { title: 'Hone Instruments - Product Details' };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  let product = null;
  try {
    const response = await productsAPI.getBySlug(params.slug);
    product = response.data?.data || response.data;
  } catch (error) {
    console.error("Error fetching product for JSON-LD:", error);
  }

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": product.name,
              "image": product.images?.map((img: any) => img.url) || [],
              "description": product.description,
              "sku": product._id,
              "offers": {
                "@type": "Offer",
                "url": `https://honemusics.com/products/${product.slug}`,
                "priceCurrency": "ETB",
                "price": product.price,
                "availability": product.countInStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "itemCondition": "https://schema.org/NewCondition"
              },
              "brand": {
                "@type": "Brand",
                "name": product.brand || "Hone Musical Instruments"
              }
            })
          }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}