'use client'
import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import TopBar from "@/components/TopBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useParams } from "next/navigation";
import Link from "next/link";

// Map URL slugs to actual category names
const categoryMap = {
    'gaming-consoles': 'Gaming Consoles',
    'mobile-accessories': 'Mobile Accessories',
    'playstation-games': 'PlayStation Games',
    'gaming-accessories': 'Gaming Accessories'
};

// Reverse map for getting slug from category name
const slugMap = Object.fromEntries(
    Object.entries(categoryMap).map(([slug, name]) => [name, slug])
);

const CategoryPage = () => {
    const { products } = useAppContext();
    const params = useParams();
    const categorySlug = params.category;
    
    // Get the actual category name from the slug
    const categoryName = categoryMap[categorySlug];

    // Extract unique categories for sidebar
    const categories = useMemo(() => {
        const cats = products.map(p => p.category).filter(Boolean);
        return [...new Set(cats)];
    }, [products]);

    // Filter products by the current category
    const filteredProducts = useMemo(() => {
        if (!categoryName) return [];
        return products.filter(p => p.category === categoryName);
    }, [products, categoryName]);

    // If category doesn't exist, show 404-like message
    if (!categoryName || !categories.includes(categoryName)) {
        return (
            <>
                <TopBar/>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-[#001d2e] via-[#003049] to-[#001d2e] flex items-center justify-center">
                    <div className="text-center px-4">
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-[#9d0208]/20 blur-3xl rounded-full"></div>
                            <h1 className="text-6xl font-bold text-white mb-2 relative">404</h1>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Category Not Found</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">The category you're looking for doesn't exist or may have been moved.</p>
                        <Link 
                            href="/all-products"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#9d0208] to-[#d00000] hover:from-[#7a0106] hover:to-[#9d0208] text-white font-semibold transition-all shadow-lg shadow-[#9d0208]/30 hover:shadow-[#9d0208]/50 hover:scale-105 group"
                        >
                            <span>View All Products</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <TopBar/>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-[#001d2e] via-[#003049] to-[#001d2e]">
                <div className="max-w-7xl mx-auto px-4 min-[375px]:px-6 sm:px-8 lg:px-12">
                    {/* Breadcrumb with glass effect */}
                    <div className="pt-8 sm:pt-10 lg:pt-12 pb-6">
                        <nav className="inline-flex items-center gap-2 text-sm bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-lg">
                            <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Home</span>
                            </Link>
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <Link href="/all-products" className="text-gray-400 hover:text-white transition-colors">
                                Products
                            </Link>
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-white font-medium">{categoryName}</span>
                        </nav>
                    </div>

                    {/* Premium Header with gradient accent */}
                    <div className="pb-8 sm:pb-10 relative">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-[#9d0208]/10 blur-3xl rounded-full"></div>
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="h-1 w-12 bg-gradient-to-r from-[#9d0208] to-transparent"></div>
                                <span className="text-xs font-semibold text-[#9d0208] uppercase tracking-wider">Category</span>
                            </div>
                            <h1 className="text-3xl min-[375px]:text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                                {categoryName}
                            </h1>
                            <div className="flex items-center gap-6">
                                <p className="text-base text-gray-400 font-light">
                                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
                                </p>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent max-w-xs"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-8 lg:gap-10 pb-16 sm:pb-20">
                        {/* Premium Sidebar with glass morphism */}
                        <aside className="hidden lg:block w-72 flex-shrink-0">
                            <div className="sticky top-24">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
                                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#9d0208] to-[#d00000] rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                        </div>
                                        <h2 className="text-lg font-bold text-white">Categories</h2>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <Link
                                            href="/all-products"
                                            className="group flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all rounded-xl relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <svg className="w-4 h-4 flex-shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                            <span className="relative z-10">All Products</span>
                                        </Link>
                                        {categories.map((cat) => {
                                            const isActive = cat === categoryName;
                                            const slug = slugMap[cat] || cat.toLowerCase().replace(/\s+/g, '-');
                                            
                                            return (
                                                <Link
                                                    key={cat}
                                                    href={`/all-products/${slug}`}
                                                    className={`group flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-xl relative overflow-hidden ${
                                                        isActive 
                                                            ? 'bg-gradient-to-r from-[#9d0208] to-[#d00000] text-white font-semibold shadow-lg shadow-[#9d0208]/30' 
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                                >
                                                    {!isActive && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    )}
                                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 relative z-10 ${
                                                        isActive ? 'bg-white' : 'bg-gray-600 group-hover:bg-gray-400'
                                                    }`}></div>
                                                    <span className="relative z-10">{cat}</span>
                                                    {isActive && (
                                                        <svg className="w-4 h-4 ml-auto relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Decorative element */}
                                <div className="mt-6 p-6 bg-gradient-to-br from-[#9d0208]/10 to-transparent border border-[#9d0208]/20 rounded-2xl backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-[#9d0208]/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-[#9d0208]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-bold text-white">Premium Selection</h3>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Curated collection of high-quality gaming products
                                    </p>
                                </div>
                            </div>
                        </aside>

                        {/* Products Grid with enhanced spacing */}
                        <div className="flex-1">
                            {filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                                    {filteredProducts.map((product, index) => (
                                        <ProductCard key={index} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center">
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-[#9d0208]/20 blur-3xl rounded-full"></div>
                                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center">
                                            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">No Products Yet</h3>
                                    <p className="text-base text-gray-400 mb-10 max-w-md">We're working on adding amazing products to this category. Check back soon!</p>
                                    <Link
                                        href="/all-products"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#9d0208] to-[#d00000] hover:from-[#7a0106] hover:to-[#9d0208] text-white text-sm font-semibold transition-all shadow-lg shadow-[#9d0208]/30 hover:shadow-[#9d0208]/50 hover:scale-105 rounded-xl group"
                                    >
                                        <span>Explore All Products</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <WhatsAppButton/>
        </>
    );
};

export default CategoryPage;