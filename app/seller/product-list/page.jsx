'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const ProductList = () => {
  const { router } = useAppContext();
  const { data: session } = useSession();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "N/A";
    
    let id;
    if (typeof categoryId === 'object' && categoryId?.$oid) {
      id = categoryId.$oid;
    } else if (typeof categoryId === 'object' && categoryId?._id) {
      id = String(categoryId._id);
    } else {
      id = String(categoryId);
    }

    const category = categories.find(cat => String(cat._id) === id);
    return category?.name || "Unknown";
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/list");
      if (data.success) {
        const normalized = data.data.map((c) => ({
          _id: String(c._id),
          name: c.name,
        }));
        setCategories(normalized);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchSellerProduct = async () => {
    try {
      const { data } = await axios.get("/api/product/list", {
        withCredentials: true,
      });
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product? It will be removed from all user carts.")) {
      return;
    }

    try {
      setDeleting(productId);
      try {
        await axios.post("/api/cart/remove-deleted-product", {
          productId: productId
        });
      } catch (cartError) {
        console.error("Failed to remove product from carts:", cartError);
      }

      const { data } = await axios.delete(`/api/product/admin/products/${productId}`);

      if (data.success) {
        toast.success("Product deleted successfully!");
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        toast.error(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Something went wrong");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSellerProduct();
  }, []);

  const canEditOrDelete = ["admin", "seller"].includes(session?.user?.role);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex flex-col justify-between bg-[#003049] text-white">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#001d2e] via-[#003049] to-[#001d2e] text-white">
      <div className="w-full px-3 py-4 min-[320px]:px-4 min-[320px]:py-5 sm:px-6 sm:py-6 md:p-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 sm:pb-6 gap-3">
          <div>
            <h2 className="text-xl min-[320px]:text-2xl sm:text-3xl font-bold text-white mb-1">
              All Products
            </h2>
            <p className="text-xs min-[320px]:text-sm text-gray-400">
              Manage your product inventory
            </p>
          </div>
          <div className="flex items-center gap-3 min-[320px]:gap-4">
            <div className="px-3 min-[320px]:px-4 py-2 bg-white/5 border border-white/10 rounded-lg min-[320px]:rounded-xl">
              <span className="text-xs min-[320px]:text-sm text-gray-400">Total: </span>
              <span className="text-xs min-[320px]:text-sm font-bold text-[#9d0208]">{products.length}</span>
            </div>
            <button
              onClick={() => router.push('/seller')}
              className="px-3 min-[320px]:px-4 py-2 bg-[#9d0208] text-white text-xs min-[320px]:text-sm rounded-lg min-[320px]:rounded-xl hover:bg-[#7a0006] transition flex items-center gap-2"
            >
              <span className="text-base min-[320px]:text-lg">+</span>
              <span className="hidden min-[375px]:inline">Add Product</span>
              <span className="min-[375px]:hidden">Add</span>
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 min-[320px]:py-20 bg-white/5 rounded-xl min-[320px]:rounded-2xl border border-white/10">
            <div className="text-6xl min-[320px]:text-7xl mb-4">📦</div>
            <p className="text-base min-[320px]:text-lg text-white font-semibold mb-2">No products found</p>
            <p className="text-xs min-[320px]:text-sm text-gray-400 mb-6">Start by adding your first product</p>
            <button
              onClick={() => router.push('/seller/add-product')}
              className="px-6 py-3 bg-[#9d0208] text-white text-sm rounded-xl hover:bg-[#7a0006] transition"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block w-full overflow-hidden rounded-xl bg-white/5 border border-white/10 shadow-xl">
              <table className="table-auto w-full">
                <thead className="text-white text-sm bg-white/5">
                  <tr>
                    <th className="px-4 py-4 text-left font-semibold">Product</th>
                    <th className="px-4 py-4 text-center font-semibold">Category</th>
                    <th className="px-4 py-4 text-center font-semibold">Price</th>
                    <th className="px-4 py-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="text-sm text-gray-200">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-t border-white/10 hover:bg-white/5 transition"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                            <Image
                              src={product.image[0] || assets.upload_area}
                              alt="product"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{product.name}</p>
                            <p className="text-xs text-gray-400 truncate">{product.description?.slice(0, 50)}...</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-[#9d0208]/20 text-[#9d0208] text-xs font-medium rounded-full border border-[#9d0208]/30">
                          {getCategoryName(product.category)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-white">
                            PKR {product.offerPrice || product.price}
                          </span>
                          {product.offerPrice && (
                            <span className="text-xs text-gray-500 line-through">
                              PKR {product.price}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => router.push(`/product/${product._id}`)}
                            className="p-2 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10 transition"
                            title="View"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {canEditOrDelete && (
                            <>
                              {/* UPDATE BUTTON */}
                              <button
                                onClick={() => router.push(`/seller/productupdate/${product._id}`)}
                                className="p-2 bg-blue-900/20 text-blue-400 rounded-lg hover:bg-blue-900/30 border border-blue-900/30 transition"
                                title="Edit Product"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>

                              <button
                                onClick={() => handleDelete(product._id)}
                                disabled={deleting === product._id}
                                className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 border border-red-900/30 disabled:opacity-50 transition"
                                title="Delete"
                              >
                                {deleting === product._id ? (
                                  <span className="animate-spin block w-4 h-4">⏳</span>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE/TABLET CARDS */}
            <div className="block md:hidden space-y-3 min-[320px]:space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white/5 rounded-lg min-[320px]:rounded-xl border border-white/10 p-3 min-[320px]:p-4 shadow-lg hover:bg-white/10 transition"
                >
                  <div className="flex gap-3 min-[320px]:gap-4">
                    <div className="relative w-20 h-20 min-[320px]:w-24 min-[320px]:h-24 rounded-lg min-[320px]:rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      <Image
                        src={product.image[0] || assets.upload_area}
                        alt="product"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm min-[320px]:text-base line-clamp-2 mb-1 min-[320px]:mb-2">
                        {product.name}
                      </h3>
                      <span className="inline-block px-2 py-0.5 text-[10px] min-[320px]:text-xs font-medium bg-[#9d0208]/20 text-[#9d0208] rounded-full border border-[#9d0208]/30 mb-2">
                        {getCategoryName(product.category)}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-white text-sm min-[320px]:text-base">
                          PKR {product.offerPrice || product.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 min-[320px]:gap-3 mt-3 min-[320px]:mt-4">
                    <button
                      onClick={() => router.push(`/product/${product._id}`)}
                      className="flex-1 px-2 py-2 bg-white/5 text-white text-xs rounded-lg border border-white/10 transition font-medium"
                    >
                      View
                    </button>

                    {canEditOrDelete && (
                      <>
                        <button
                          onClick={() => router.push(`/seller/productupdate/${product._id}`)}
                          className="flex-1 px-2 py-2 bg-blue-900/20 text-blue-400 text-xs rounded-lg border border-blue-900/30 transition font-medium"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deleting === product._id}
                          className="flex-1 px-2 py-2 bg-red-900/20 text-red-400 text-xs rounded-lg border border-red-900/30 disabled:opacity-50 transition font-medium"
                        >
                          {deleting === product._id ? "..." : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;