'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
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
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      setDeleting(productId);
      const { data } = await axios.delete(`/api/product/admin/products/${productId}`);

      if (data.success) {
        // Remove product from all user carts
        try {
          await axios.post("/api/cart/remove-deleted-product", {
            productId: productId
          });
        } catch (cartError) {
          console.error("Failed to remove product from carts:", cartError);
          // Don't block the delete operation if cart cleanup fails
        }

        alert("Product deleted successfully!");
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Something went wrong");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchSellerProduct();
  }, []);

  const canDelete = ["admin", "seller"].includes(session?.user?.role);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-[#003049] text-white">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full px-3 py-3 sm:px-4 sm:py-4 md:p-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 sm:pb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-[#9d0208]">All Products</h2>
            <div className="text-xs sm:text-sm text-gray-300">
              Total: <span className="font-semibold text-[#9d0208]">{products.length}</span>
            </div>
          </div>

          {/* No Products */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 bg-[#003049] rounded-lg border border-[#9d0208]/50">
              <div className="text-gray-400 text-4xl mb-3">📦</div>
              <p className="text-gray-300 font-medium">No products found</p>
              <p className="text-gray-500 text-xs">Add your first product</p>
            </div>
          ) : (
            <>

              {/* DESKTOP TABLE */}
              <div className="hidden sm:block max-w-6xl w-full overflow-hidden rounded-md bg-[#003049] border border-[#9d0208]/40">
                <table className="table-auto w-full">
                  <thead className="text-white text-sm bg-[#9d0208]/20">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium w-2/5">Product</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 text-center font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="text-sm text-gray-200">
                    {products.map((product) => (
                      <tr
                        key={product._id}
                        className="border-t border-[#9d0208]/30 hover:bg-[#9d0208]/10"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Image
                              src={product.image[0] || assets.upload_area}
                              alt="product"
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <span className="font-medium text-white">{product.name}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-[#9d0208]/20 text-[#9d0208] text-xs rounded-full">
                            {product.category}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-semibold text-white">
                          PKR {product.offerPrice || product.price}
                          {product.offerPrice && (
                            <span className="ml-2 text-xs text-gray-400 line-through">
                              PKR {product.price}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => router.push(`/product/${product._id}`)}
                              className="px-3 py-2 bg-[#9d0208] text-white text-xs rounded hover:bg-[#7a0006]"
                            >
                              Visit
                            </button>

                            {canDelete && (
                              <button
                                onClick={() => handleDelete(product._id)}
                                disabled={deleting === product._id}
                                className="px-3 py-2 bg-red-700 text-white text-xs rounded hover:bg-red-800 disabled:opacity-50"
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

              {/* MOBILE CARDS */}
              <div className="block sm:hidden space-y-3">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-black/70 rounded-lg border border-[#9d0208]/40 p-3 shadow-sm"
                  >
                    <div className="flex gap-2">
                      <Image
                        src={product.image[0] || assets.upload_area}
                        alt="product"
                        width={60}
                        height={60}
                        className="w-16 h-16 object-cover rounded"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm line-clamp-2">
                          {product.name}
                        </h3>

                        <span className="px-2 py-0.5 text-[10px] font-medium bg-[#9d0208]/20 text-[#9d0208] rounded-full inline-block mt-1">
                          {product.category}
                        </span>

                        <div className="text-sm mt-1">
                          <span className="font-bold text-white">
                            PKR {product.offerPrice || product.price}
                          </span>
                          {product.offerPrice && (
                            <span className="ml-2 text-xs line-through text-gray-400">
                              PKR {product.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => router.push(`/product/${product._id}`)}
                        className="flex-1 px-3 py-2 bg-[#9d0208] text-white text-xs rounded-md"
                      >
                        Visit
                      </button>

                      {canDelete && (
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deleting === product._id}
                          className="px-3 py-2 bg-red-700 text-white text-xs rounded-md disabled:opacity-50"
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
    </div>
  );
};

export default ProductList;