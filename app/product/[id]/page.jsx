"use client"
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import TopBar from "@/components/TopBar";
import WhatsAppButton from "@/components/WhatsAppButton";

const Product = () => {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart, currency } = useAppContext();

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalSeo, setGlobalSeo] = useState(null);

    const fetchGlobalSeo = async () => {
        try {
            const res = await axios.get("/api/product-pages-seo");
            if (res.data.success) {
                setGlobalSeo(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching global SEO:", err);
        }
    };

    const fetchProductData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`/api/product/${id}`);
            
            if (res.data.success && res.data.data) {
                setProductData(res.data.data);
                setMainImage(res.data.data.image?.[0] || null);
            } else {
                setError("Product not found");
            }
        } catch (err) {
            console.error("Error fetching product:", err);
            setError(err.response?.data?.error || "Failed to load product");
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async () => {
        try {
            const res = await axios.get("/api/product/list");
            if (res.data.success && res.data.data && productData) {
                const currentCat = productData.category?._id || productData.category;
                const related = res.data.data
                    .filter(p => p._id !== id && (p.category?._id || p.category) === currentCat)
                    .slice(0, 5);
                setRelatedProducts(related);
            }
        } catch (err) {
            console.error("Related Products Error:", err);
        }
    };

    useEffect(() => {
        if (!productData || !globalSeo) return;

        const displayPrice = productData.offerPrice || productData.price;
        const productImage = productData.image?.[0] || "";
        const categoryName = typeof productData.category === 'object' ? productData.category.name : productData.category;

        const title = `${productData.name} | ${globalSeo?.title || '7even86'}`;
        const description = productData.description || globalSeo?.description || '';
        
        document.title = title;

        const updateMetaTag = (property, content, isProperty = false) => {
            if (!content) return;
            const attribute = isProperty ? 'property' : 'name';
            let meta = document.querySelector(`meta[${attribute}="${property}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attribute, property);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', content);
        };

        updateMetaTag('description', description);
        updateMetaTag('og:title', title, true);
        updateMetaTag('og:description', description, true);
        if (productImage) updateMetaTag('og:image', productImage, true);
        updateMetaTag('og:type', 'product', true);
        updateMetaTag('product:price:amount', String(displayPrice), true);
        updateMetaTag('product:price:currency', globalSeo?.structuredData?.defaultCurrency || 'PKR', true);
        if (categoryName) updateMetaTag('product:category', categoryName, true);

    }, [productData, globalSeo]);

    useEffect(() => {
        fetchGlobalSeo();
        if (id) fetchProductData();
    }, [id]);

    useEffect(() => {
        if (productData) fetchRelatedProducts();
    }, [productData]);

    const getCategoryName = () => {
        if (!productData?.category) return "N/A";
        return typeof productData.category === 'object' ? productData.category.name : productData.category;
    };

    if (loading) return <Loading />;

    if (error || !productData) {
        return (
            <>
                <TopBar/>
                <Navbar />
                <div className="min-h-screen bg-[#003049] flex items-center justify-center px-4">
                    <div className="text-center bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 p-8 sm:p-12 max-w-md">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#9d0208] to-black rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-[#9d0208]/50">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-lg sm:text-xl text-white font-semibold mb-6">{error || "Product not found"}</p>
                        <button onClick={() => router.push("/")} className="relative overflow-hidden px-6 sm:px-8 py-3 bg-gradient-to-r from-[#9d0208] to-black text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#9d0208]/50 transition-all duration-300">
                            Return Home
                        </button>
                    </div>
                </div>
            </>
        )
    }

    const displayPrice = productData.offerPrice || productData.price;
    const originalPrice = productData.offerPrice ? productData.price : null;
    const productImages = productData.image || [];
    const discountPercentage = originalPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

    return (
        <>
            <TopBar />
            <Navbar />
            <div className="bg-gradient-to-br from-[#001d2e] via-[#003049] to-[#001d2e] min-h-screen px-3 sm:px-4 md:px-8 lg:px-16 xl:px-24 pt-6 sm:pt-8 md:pt-12 pb-8">
                
                <div className="text-sm text-gray-400 mb-6">
                    <button onClick={() => router.push("/")} className="hover:text-white transition">Home</button>
                    <span className="mx-2">/</span>
                    <span className="text-white">{productData.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
                    
                    <div className="space-y-3 sm:space-y-4">
                        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
                            {discountPercentage > 0 && (
                                <div className="absolute top-4 right-4 z-10 bg-[#9d0208] text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                                    {discountPercentage}% OFF
                                </div>
                            )}
                            <div className="aspect-square w-full">
                                <Image
                                    src={mainImage || productImages[0] || assets.upload_area}
                                    alt={productData.name}
                                    className="w-full h-full object-contain p-4 sm:p-6 md:p-8 transition-transform duration-500 hover:scale-105"
                                    width={800} height={800} priority
                                />
                            </div>
                        </div>

                        {productImages.length > 1 && (
                            <div className="grid grid-cols-4 gap-2 sm:gap-3">
                                {productImages.map((image, index) => (
                                    <div key={index} onClick={() => setMainImage(image)} 
                                        className={`cursor-pointer rounded-lg sm:rounded-xl overflow-hidden bg-white/5 border-2 transition-all duration-300 hover:scale-105 ${mainImage === image ? "border-[#9d0208] shadow-lg shadow-[#9d0208]/50" : "border-white/10"}`}>
                                        <div className="aspect-square">
                                            <Image src={image} alt="gallery" className="w-full h-full object-contain p-2" width={200} height={200} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col space-y-4 sm:space-y-6">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">{productData.name}</h1>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= 4 ? 'text-[#9d0208]' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-sm sm:text-base text-gray-400 font-medium">(4.5)</span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{productData.description}</p>
                        <div className="flex items-baseline gap-3 flex-wrap">
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#9d0208] to-white bg-clip-text text-transparent">
                                {currency}{displayPrice}
                            </span>
                            {originalPrice && (
                                <span className="text-base sm:text-lg text-gray-600 line-through">{currency}{originalPrice}</span>
                            )}
                        </div>

                        <div className="bg-white/5 rounded-xl border border-white/10 p-4 sm:p-6">
                            <table className="w-full">
                                <tbody className="space-y-2">
                                    <tr className="border-b border-white/10">
                                        <td className="text-xs sm:text-sm text-gray-400 font-medium py-2 sm:py-3">Category</td>
                                        <td className="text-xs sm:text-sm text-white py-2 sm:py-3 text-right font-semibold">{getCategoryName()}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-xs sm:text-sm text-gray-400 font-medium py-2 sm:py-3">Availability</td>
                                        <td className="text-xs sm:text-sm py-2 sm:py-3 text-right">
                                            <span className="inline-flex items-center gap-1 text-green-400 font-semibold">
                                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>In Stock
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 pt-4">
                            <button onClick={() => addToCart(productData._id)} className="flex-1 py-3 sm:py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                Add to Cart
                            </button>
                            <button onClick={() => { addToCart(productData._id); router.push('/cart'); }} className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-[#9d0208] to-[#7a0006] text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="space-y-6 sm:space-y-8">
                        <div className="text-center relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            </div>
                            <h2 className="relative inline-block px-6 text-2xl sm:text-3xl lg:text-4xl font-bold">
                                <span className="text-white">Related </span>
                                <span className="bg-gradient-to-r from-[#9d0208] to-white bg-clip-text text-transparent">Products</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                            {relatedProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
            <WhatsAppButton/>
        </>
    );
};

export default Product;