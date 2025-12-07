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

const Cart = () => {

  const { currency, router, cartItems, addToCart, updateCartQuantity, getCartCount } = useAppContext();
  const [cartProducts, setCartProducts] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch product details for all items in cart
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
              return { id, product: res.data.data };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            return null;
          }
        });

        const results = await Promise.all(productPromises);
        const productsMap = {};
        
        results.forEach((result) => {
          if (result) {
            productsMap[result.id] = result.product;
          }
        });

        setCartProducts(productsMap);
      } catch (error) {
        console.error('Error fetching cart products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, [cartItems]);

  if (loading) {
    return (
      <div className="bg-[#003049] min-h-screen">
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
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-white/10">
              <h1 className="text-2xl min-[375px]:text-3xl sm:text-4xl font-bold text-white">
                Shopping <span className="text-[#9d0208]">Cart</span>
              </h1>
              <span className="text-base min-[375px]:text-lg sm:text-xl text-gray-400">
                {getCartCount()} {getCartCount() === 1 ? 'Item' : 'Items'}
              </span>
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
                            <p className="text-xs min-[375px]:text-sm text-gray-400 mb-3">
                              {currency}{displayPrice.toFixed(2)} each
                            </p>

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
                                  <button
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                    onClick={() => updateCartQuantity(itemId, 0)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-300">
                              {currency}{displayPrice.toFixed(2)}
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