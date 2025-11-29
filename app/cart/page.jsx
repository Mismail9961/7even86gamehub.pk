'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";

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
        // Fetch all products in parallel
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
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading cart...</p>
        </div>
      </>
    );
  }

  const cartItemIds = Object.keys(cartItems).filter(id => cartItems[id] > 0);

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Your <span className="font-medium text-orange-600">Cart</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">{getCartCount()} Items</p>
          </div>
          
          {cartItemIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-xl text-gray-500 mb-4">Your cart is empty</p>
              <button 
                onClick={() => router.push('/all-products')} 
                className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="text-left">
                    <tr>
                      <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
                        Product Details
                      </th>
                      <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                        Price
                      </th>
                      <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                        Quantity
                      </th>
                      <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
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
                        <tr key={itemId}>
                          <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                            <div>
                              <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
                                <Image
                                  src={productImage}
                                  alt={product.name || "Product"}
                                  className="w-16 h-auto object-cover mix-blend-multiply"
                                  width={1280}
                                  height={720}
                                />
                              </div>
                              <button
                                className="md:hidden text-xs text-orange-600 mt-1"
                                onClick={() => updateCartQuantity(itemId, 0)}
                              >
                                Remove
                              </button>
                            </div>
                            <div className="text-sm hidden md:block">
                              <p className="text-gray-800">{product.name || "Unnamed Product"}</p>
                              <button
                                className="text-xs text-orange-600 mt-1"
                                onClick={() => updateCartQuantity(itemId, 0)}
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                          <td className="py-4 md:px-4 px-1 text-gray-600">
                            {currency}{displayPrice.toFixed(2)}
                          </td>
                          <td className="py-4 md:px-4 px-1">
                            <div className="flex items-center md:gap-2 gap-1">
                              <button onClick={() => updateCartQuantity(itemId, cartItems[itemId] - 1)}>
                                <Image
                                  src={assets.decrease_arrow}
                                  alt="decrease_arrow"
                                  className="w-4 h-4"
                                />
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
                                className="w-8 border text-center appearance-none"
                              />
                              <button onClick={() => addToCart(itemId)}>
                                <Image
                                  src={assets.increase_arrow}
                                  alt="increase_arrow"
                                  className="w-4 h-4"
                                />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 md:px-4 px-1 text-gray-600">
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
                className="group flex items-center mt-6 gap-2 text-orange-600"
              >
                <Image
                  className="group-hover:-translate-x-1 transition"
                  src={assets.arrow_right_icon_colored}
                  alt="arrow_right_icon_colored"
                />
                Continue Shopping
              </button>
            </>
          )}
        </div>
        <OrderSummary cartItems={cartItems} cartProducts={cartProducts} />
      </div>
    </>
  );
};

export default Cart;
