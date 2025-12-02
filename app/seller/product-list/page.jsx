'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import { useSession } from "next-auth/react";

const ProductList = () => {
  const { router } = useAppContext();
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchSellerProduct = async () => {
    try {
      const { data } = await axios.get("/api/product/list", {
        withCredentials: true,
      });
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    try {
      setDeleting(productId);

      const { data } = await axios.delete(`/api/product/admin/products/${productId}`);

      if (data.success) {
        alert("Product deleted successfully!");
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        alert("❌ " + (data.error || "Failed to delete product"));
      }
    } catch (error) {
      alert("❌ " + (error.response?.data?.error || "Something went wrong"));
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchSellerProduct();
  }, []);

  // Allow only admin or seller to delete
  const canDelete = ["admin", "seller"].includes(session?.user?.role);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full px-3 py-3 sm:px-4 sm:py-4 md:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 sm:pb-4 gap-2">
            <h2 className="text-base sm:text-lg font-medium">All Products</h2>
            <div className="text-xs sm:text-sm text-gray-600">
              Total: <span className="font-semibold">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-gray-400 text-3xl sm:text-4xl mb-3 sm:mb-4">📦</div>
              <p className="text-gray-600 text-base sm:text-lg font-medium">No products found</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Start by adding your first product</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block max-w-6xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                <table className="table-fixed w-full overflow-hidden">
                  <thead className="text-gray-900 text-sm text-left bg-gray-50">
                    <tr>
                      <th className="w-2/5 px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="text-sm text-gray-500">
                    {products.map((product) => (
                      <tr key={product._id} className="border-t border-gray-500/20 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-500/10 rounded p-2 flex-shrink-0">
                              <Image
                                src={product.image[0] || assets.upload_area}
                                alt="product"
                                className="w-16 h-16 object-cover rounded"
                                width={64}
                                height={64}
                              />
                            </div>
                            <span className="truncate font-medium text-gray-900">
                              {product.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {product.category}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-semibold text-gray-900">
                          ${product.offerPrice || product.price}
                          {product.offerPrice && (
                            <span className="ml-2 text-xs text-gray-400 line-through">
                              ${product.price}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => router.push(`/product/${product._id}`)}
                              className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white text-xs rounded-md hover:bg-orange-700 transition"
                            >
                              Visit
                            </button>

                            {canDelete && (
                              <button
                                onClick={() => handleDelete(product._id, product.name)}
                                disabled={deleting === product._id}
                                className="px-3 py-2 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition disabled:opacity-50"
                              >
                                {deleting === product._id ? "Deleting..." : "Delete"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards - Optimized for iPhone 5s (320px) */}
              <div className="block sm:hidden space-y-2.5">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                    <div className="flex gap-2.5 mb-3">
                      <div className="flex-shrink-0">
                        <Image
                          src={product.image[0] || assets.upload_area}
                          alt="product"
                          className="w-16 h-16 object-cover rounded"
                          width={64}
                          height={64}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1.5">
                          {product.name}
                        </h3>

                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full inline-block">
                          {product.category}
                        </span>

                        <div className="text-sm mt-1.5">
                          <span className="font-semibold text-gray-900">
                            ${product.offerPrice || product.price}
                          </span>
                          {product.offerPrice && (
                            <span className="ml-1.5 text-xs text-gray-400 line-through">
                              ${product.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/product/${product._id}`)}
                        className="flex-1 px-3 py-2 bg-orange-600 text-white text-xs font-medium rounded-md hover:bg-orange-700 transition active:bg-orange-800"
                      >
                        Visit
                      </button>

                      {canDelete && (
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          disabled={deleting === product._id}
                          className="flex-shrink-0 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed active:bg-red-800 min-w-[70px]"
                        >
                          {deleting === product._id ? "..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductList;