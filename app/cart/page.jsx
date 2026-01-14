'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import TopBar from "@/components/TopBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import toast from "react-hot-toast";

const Cart = () => {

  const { currency, router, cartItems, addToCart, updateCartQuantity, getCartCount, refreshCart } = useAppContext();
  const [cartProducts, setCartProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  // Fetch product details for all items in cart with sync
  useEffect(() => {
    const fetchCartProducts = async () => {
      const productIds = Object.keys(cartItems).filter(id => cartItems[id] > 0);
      
      if (productIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productPromises = productIds.map(async (id) => {
          try {
            const res = await axios.get(`/api/product/${id}`);
            if (res.data.success && res.data.data) {
              return { id, product: res.data.data, exists: true };
            }
            return { id, product: null, exists: false };
          } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            // Product might be deleted
            if (error.response?.status === 404) {
              return { id, product: null, exists: false };
            }
            return { id, product: null, exists: false };
          }
        });

        const results = await Promise.all(productPromises);
        const productsMap = {};
        const deleted = [];
        
        results.forEach((result) => {
          if (result.exists && result.product) {
            productsMap[result.id] = result.product;
          } else {
            deleted.push(result.id);
          }
        });

        setCartProducts(productsMap);
        
        // Handle deleted products
        if (deleted.length > 0) {
          setDeletedProducts(deleted);
          setShowUpdateNotification(true);
          
          // Remove deleted products from cart
          deleted.forEach(productId => {
            updateCartQuantity(productId, 0);
          });
          
          toast.error(
            `${deleted.length} item(s) removed - no longer available`,
            { duration: 4000 }
          );
        }
      } catch (error) {
        console.error('Error fetching cart products:', error);
        toast.error('Failed to load some cart items');
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, [cartItems]);

  // Refresh cart data
  const handleRefreshCart = async () => {
    setLoading(true);
    if (refreshCart) {
      await refreshCart();
    }
    // Re-fetch products
    const productIds = Object.keys(cartItems).filter(id => cartItems[id] > 0);
    if (productIds.length > 0) {
      window.location.reload(); // Simple refresh for now
    }
  };

  if (loading) {
    return (
      <div className="bg-[#003049] min-h-screen">
        <TopBar/>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#9d0208] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  const cartItemIds = Object.keys(cartItems).filter(id => cartItems[id] > 0);

  return (
    <div className="bg-[#003049] min-h-screen">
      <TopBar/>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 min-[375px]:px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        {/* Update Notification */}
        {showUpdateNotification && deletedProducts.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-yellow-300">Cart Updated</p>
                <p className="text-sm text-yellow-200 mt-1">
                  {deletedProducts.length} item(s) were removed as they are no longer available.
                </p>
              </div>
              <button 
                onClick={() => setShowUpdateNotification(false)}
                className="text-yellow-400 hover:text-yellow-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-white/10">
              <h1 className="text-2xl min-[375px]:text-3xl sm:text-4xl font-bold text-white">
                Shopping <span className="text-[#9d0208]">Cart</span>
              </h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefreshCart}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Refresh cart"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <span className="text-base min-[375px]:text-lg sm:text-xl text-gray-400">
                  {getCartCount()} {getCartCount() === 1 ? 'Item' : 'Items'}
                </span>
              </div>
            </div>
            
            {cartItemIds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 bg-white/5 border border-white/10">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-lg sm:text-xl text-gray-400 mb-6">Your cart is empty</p>
                <button 
                  onClick={() => router.push('/all-products')} 
                  className="px-6 sm:px-8 py-3 bg-[#9d0208] hover:bg-[#7a0106] text-white text-sm sm:text-base font-semibold transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Card View - iPhone 5S optimized */}
                <div className="lg:hidden space-y-4">
                  {cartItemIds.map((itemId) => {
                    const product = cartProducts[itemId];

                    if (!product || cartItems[itemId] <= 0) return null;

                    const productImage = product.image?.[0] || assets.upload_area;
                    const displayPrice = product.offerPrice || product.price || 0;
                    const originalPrice = product.price || 0;
                    const hasDiscount = product.offerPrice && product.offerPrice < originalPrice;
                    const subtotal = displayPrice * cartItems[itemId];

                    return (
                      <div key={itemId} className="bg-white/5 border border-white/10 p-3 min-[375px]:p-4 group hover:bg-white/10 transition-colors">
                        <div className="flex gap-3 min-[375px]:gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="overflow-hidden bg-white/5 border border-white/10 p-2 w-20 min-[375px]:w-24">
                              <Image
                                src={productImage}
                                alt={product.name || "Product"}
                                className="w-full h-auto object-cover"
                                width={200}
                                height={200}
                              />
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm min-[375px]:text-base font-semibold text-white truncate mb-1">
                              {product.name || "Unnamed Product"}
                            </h3>
                            <div className="mb-3">
                              <p className="text-xs min-[375px]:text-sm text-gray-400">
                                {currency}{displayPrice.toFixed(2)} each
                              </p>
                              {hasDiscount && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500 line-through">
                                    {currency}{originalPrice.toFixed(2)}
                                  </span>
                                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded">
                                    {Math.round((1 - displayPrice / originalPrice) * 100)}% OFF
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 min-[375px]:px-3 py-1.5">
                                <button 
                                  onClick={() => updateCartQuantity(itemId, cartItems[itemId] - 1)}
                                  className="text-gray-400 hover:text-[#9d0208] transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="text-sm min-[375px]:text-base font-medium text-white min-w-[24px] text-center">
                                  {cartItems[itemId]}
                                </span>
                                <button 
                                  onClick={() => addToCart(itemId)}
                                  className="text-gray-400 hover:text-[#9d0208] transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>

                              <button
                                className="text-xs min-[375px]:text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                                onClick={() => updateCartQuantity(itemId, 0)}
                              >
                                Remove
                              </button>
                            </div>

                            {/* Subtotal */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                              <span className="text-xs min-[375px]:text-sm text-gray-400">Subtotal:</span>
                              <span className="text-sm min-[375px]:text-base font-bold text-[#9d0208]">
                                {currency}{subtotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto bg-white/5 border border-white/10">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">
                          Product Details
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">
                          Price
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">
                          Quantity
                        </th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItemIds.map((itemId) => {
                        const product = cartProducts[itemId];

                        if (!product || cartItems[itemId] <= 0) return null;

                        const productImage = product.image?.[0] || assets.upload_area;
                        const displayPrice = product.offerPrice || product.price || 0;
                        const originalPrice = product.price || 0;
                        const hasDiscount = product.offerPrice && product.offerPrice < originalPrice;
                        const subtotal = displayPrice * cartItems[itemId];

                        return (
                          <tr key={itemId} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className="overflow-hidden bg-white/5 border border-white/10 p-2 w-20">
                                  <Image
                                    src={productImage}
                                    alt={product.name || "Product"}
                                    className="w-full h-auto object-cover"
                                    width={200}
                                    height={200}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white mb-1">
                                    {product.name || "Unnamed Product"}
                                  </p>
                                  {product.category?.name && (
                                    <p className="text-xs text-gray-400 mb-1">
                                      {product.category.name}
                                    </p>
                                  )}
                                  <button
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                    onClick={() => updateCartQuantity(itemId, 0)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm text-gray-300">
                                {currency}{displayPrice.toFixed(2)}
                                {hasDiscount && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 line-through">
                                      {currency}{originalPrice.toFixed(2)}
                                    </span>
                                    <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded">
                                      {Math.round((1 - displayPrice / originalPrice) * 100)}% OFF
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-2 w-fit">
                                <button 
                                  onClick={() => updateCartQuantity(itemId, cartItems[itemId] - 1)}
                                  className="text-gray-400 hover:text-[#9d0208] transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <input 
                                  onChange={e => {
                                    const value = Number(e.target.value);
                                    if (value >= 0) {
                                      updateCartQuantity(itemId, value);
                                    }
                                  }} 
                                  type="number" 
                                  value={cartItems[itemId]} 
                                  min="0"
                                  className="w-14 bg-transparent border-0 text-center text-white text-sm appearance-none focus:outline-none"
                                />
                                <button 
                                  onClick={() => addToCart(itemId)}
                                  className="text-gray-400 hover:text-[#9d0208] transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-[#9d0208]">
                              {currency}{subtotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button 
                  onClick={() => router.push('/all-products')} 
                  className="group flex items-center mt-6 gap-2 text-gray-400 hover:text-white text-sm sm:text-base transition-colors"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Continue Shopping
                </button>
              </>
            )}
          </div>
          <OrderSummary cartItems={cartItems} cartProducts={cartProducts} />
        </div>
      </div>
      <Footer />
      <WhatsAppButton/>
    </div>
  );
};

export default Cart;