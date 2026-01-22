'use client'

const CategorySeoSchema = ({ categoryName, categorySlug, products, categorySeo }) => {
  // Return null if data is missing to avoid errors
  if (!categoryName || !categorySlug) return null;

  // Use a fallback for origin since window is not available on server
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.7even86gamehub.pk';

  // Create structured data object
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": categoryName,
    "description": categorySeo?.seo?.description || `Browse our ${categoryName} collection in Pakistan.`,
    "url": `${origin}/${categorySlug}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": origin
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": categoryName,
          "item": `${origin}/${categorySlug}`
        }
      ]
    }
  };

  // Add product list (JSON-LD ItemList)
  if (products && products.length > 0) {
    schema.mainEntity = {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 12).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "description": product.description || `${product.name} - Available now`,
          "image": product.image || (Array.isArray(product.images) ? product.images[0] : ""),
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "PKR",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": `${origin}/product/${product.slug || product._id}`
          }
        }
      }))
    };
  }

  return (
    <script
      type="application/ld+json"
      id="category-schema"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default CategorySeoSchema;