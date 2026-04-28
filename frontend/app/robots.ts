export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/checkout/', '/cart/', '/account/', '/api/'],
    },
    sitemap: 'https://honestore.com/sitemap.xml',
  };
}