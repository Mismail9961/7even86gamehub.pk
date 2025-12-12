// components/CategorySeoSchema.js
'use client'
import { useEffect } from 'react';

const CategorySeoSchema = ({ categoryName, categorySlug, products, categorySeo }) => {
  useEffect(() => {
    // Only create schema if we have valid data
    if (!categoryName || !categorySlug || !products) return;

    // Create structured data for the category page
    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": categoryName,
      "description": categorySeo?.seo?.description || `Browse our ${categoryName} collection`,
      "url": `${window.location.origin}/${categorySlug}`,
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": window.location.origin
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": categoryName,
            "item": `${window.location.origin}/${categorySlug}`
          }
        ]
      }
    };

    // Add product list if products exist
    if (products.length > 0) {
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
            "image": product.image || product.images?.[0],
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "PKR",
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "url": `${window.location.origin}/product/${product.slug || product._id}`
            }
          }
        }))
      };
    }

    // Add Open Graph data as additional metadata if available
    if (categorySeo?.seo?.openGraph) {
      const og = categorySeo.seo.openGraph;
      schema.image = og.image;
      schema.publisher = {
        "@type": "Organization",
        "name": og.siteName || "Your Gaming Store",
        "url": window.location.origin
      };
    }

    // Remove existing schema if present
    const existingScript = document.getElementById('category-schema');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new schema
    const script = document.createElement('script');
    script.id = 'category-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    console.log('Schema.org structured data added for:', categoryName);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById('category-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [categoryName, categorySlug, products, categorySeo]);

  return null;
};

export default CategorySeoSchema;