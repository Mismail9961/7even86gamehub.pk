"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

const MAX_DIMENSION = 1920;
const TARGET_MAX_BYTES = 800 * 1024; // 800KB to stay under 1MB body limit
const INITIAL_QUALITY = 0.82;

/** Compress image in browser so upload stays under body size limit (avoids 413) */
function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        if (w > h) {
          h = Math.round((h * MAX_DIMENSION) / w);
          w = MAX_DIMENSION;
        } else {
          w = Math.round((w * MAX_DIMENSION) / h);
          h = MAX_DIMENSION;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      const tryQuality = (quality) => {
        return new Promise((res) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                res(null);
                return;
              }
              if (blob.size <= TARGET_MAX_BYTES || quality <= 0.3) {
                res(blob);
                return;
              }
              tryQuality(Math.max(0.3, quality - 0.15)).then(res);
            },
            "image/jpeg",
            quality
          );
        });
      };

      tryQuality(INITIAL_QUALITY)
        .then((blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))))
        .catch(reject);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

const AddProduct = () => {
  const { router } = useAppContext();
  const { data: session } = useSession();
  const user = session?.user;

  const [files, setFiles] = useState([null, null, null, null]);
  const [previewUrls, setPreviewUrls] = useState([null, null, null, null]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  // Refs for file inputs to reset them
  const fileInputRefs = useRef([]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const { data } = await axios.get("/api/category/list");
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleFileChange = useCallback((index, file) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles[index] = file;
      return newFiles;
    });

    setPreviewUrls((prevUrls) => {
      const newUrls = [...prevUrls];
      // Revoke old URL to prevent memory leak
      if (newUrls[index]) {
        URL.revokeObjectURL(newUrls[index]);
      }
      // Create new URL
      newUrls[index] = file ? URL.createObjectURL(file) : null;
      return newUrls;
    });
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const { data } = await axios.post("/api/category/add", {
        name: newCategory.trim(),
      });

      if (data.success) {
        toast.success(data.message);
        setNewCategory("");
        setShowAddCategory(false);
        await fetchCategories();
        setCategory(data.data._id);
      } else {
        toast.error(data.message || "Failed to add category");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add category");
    }
  };

  if (!user || !["seller", "admin"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-base sm:text-lg font-semibold text-[#9d0208]">Access Denied</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validFiles = files.filter((f) => f && f.size > 0);

    if (validFiles.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (!price || Number(price) <= 0) {
      toast.error("Please enter a valid product price");
      return;
    }

    if (offerPrice && Number(offerPrice) > Number(price)) {
      toast.error("Offer price cannot be greater than the original price");
      return;
    }

    if (!name.trim() || !description.trim()) {
      toast.error("Name and description are required");
      return;
    }

    setIsSubmitting(true);
    setUploadStatus("Compressing images…");
    try {
      const imageUrls = [];
      for (let i = 0; i < validFiles.length; i++) {
        setUploadStatus(`Compressing image ${i + 1}/${validFiles.length}…`);
        const blob = await compressImageFile(validFiles[i]);
        setUploadStatus(`Uploading image ${i + 1}/${validFiles.length}…`);
        const fd = new FormData();
        fd.append("image", blob, `image-${i}.jpg`);
        const { data: uploadData } = await axios.post("/api/product/upload-image", fd, {
          withCredentials: true,
          timeout: 60000,
        });
        if (!uploadData?.success || !uploadData?.url) {
          throw new Error(uploadData?.message || `Image ${i + 1} upload failed`);
        }
        imageUrls.push(uploadData.url);
      }
      setUploadStatus("Creating product…");

      const { data } = await axios.post(
        "/api/product/add",
        {
          name,
          description,
          category,
          price,
          offerPrice: offerPrice || undefined,
          image: imageUrls,
        },
        {
          withCredentials: true,
          timeout: 30000,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data.success) {
        toast.success(data.message);
        
        // Clean up preview URLs
        previewUrls.forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
        
        // Reset form
        setFiles([null, null, null, null]);
        setPreviewUrls([null, null, null, null]);
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setOfferPrice("");
        fileInputRefs.current.forEach((ref) => {
          if (ref) ref.value = "";
        });
        
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(data.message || "Failed to add product");
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || "Failed to add product";
      if (error.code === "ECONNABORTED") {
        toast.error("Upload timed out. Try fewer or smaller images (under 15MB each).");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-[#003049] text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full px-3 py-4 sm:p-6 md:p-10 space-y-4 sm:space-y-5 max-w-lg mx-auto"
      >
        {/* Product Images */}
        <div>
          <p className="text-sm sm:text-base font-semibold text-[#9d0208] mb-2">
            Product Image
          </p>
          <p className="text-xs text-white/70 mb-1">Max 15MB per image. Images are resized for faster upload.</p>
          <div className="grid grid-cols-2 xs:flex xs:flex-wrap items-center gap-2 sm:gap-3">
            {[0, 1, 2, 3].map((index) => (
              <label key={index} htmlFor={`image${index}`} className="block">
                <input
                  type="file"
                  id={`image${index}`}
                  ref={(el) => (fileInputRefs.current[index] = el)}
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileChange(index, file);
                    }
                  }}
                />
                <Image
                  src={previewUrls[index] || assets.upload_area}
                  alt={`upload-${index}`}
                  width={80}
                  height={80}
                  className="cursor-pointer border border-[#9d0208] rounded w-[70px] h-[70px] xs:w-[80px] xs:h-[80px] sm:w-[100px] sm:h-[100px] object-cover"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Product Name */}
        <div className="flex flex-col gap-1 w-full">
          <label
            htmlFor="product-name"
            className="text-sm sm:text-base font-semibold text-[#9d0208]"
          >
            Product Name
          </label>
          <input
            type="text"
            id="product-name"
            placeholder="Type here"
            className="outline-none py-2 sm:py-2.5 px-2.5 sm:px-3 rounded border border-[#9d0208]/50 bg-black text-white text-sm sm:text-base focus:border-[#9d0208] focus:ring-1 focus:ring-[#9d0208]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Product Description */}
        <div className="flex flex-col gap-1 w-full">
          <label
            htmlFor="product-description"
            className="text-sm sm:text-base font-semibold text-[#9d0208]"
          >
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={3}
            placeholder="Type here"
            className="outline-none py-2 sm:py-2.5 px-2.5 sm:px-3 rounded border bg-black text-white text-sm sm:text-base border-[#9d0208]/50 resize-none focus:border-[#9d0208] focus:ring-1 focus:ring-[#9d0208]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1 w-full">
          <label
            htmlFor="category"
            className="text-sm sm:text-base font-semibold text-[#9d0208]"
          >
            Category
          </label>
          <select
            id="category"
            className="outline-none py-2 sm:py-2.5 px-2.5 sm:px-3 rounded border bg-black text-white text-sm sm:text-base border-[#9d0208]/50 focus:border-[#9d0208] focus:ring-1 focus:ring-[#9d0208]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">
              {isLoadingCategories ? "Loading..." : "Select Category"}
            </option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price and Offer Price */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4">
          {/* Product Price */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label
              htmlFor="product-price"
              className="text-sm sm:text-base font-semibold text-[#9d0208]"
            >
              Product Price
            </label>
            <input
              type="number"
              id="product-price"
              placeholder="0"
              min="0"
              step="0.01"
              className="outline-none py-2 sm:py-2.5 px-2.5 sm:px-3 rounded border bg-black text-white text-sm sm:text-base border-[#9d0208]/50 focus:border-[#9d0208] focus:ring-1 focus:ring-[#9d0208] w-full"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {/* Offer Price */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label
              htmlFor="offer-price"
              className="text-sm sm:text-base font-semibold text-[#9d0208]"
            >
              Offer Price
            </label>
            <input
              type="number"
              id="offer-price"
              placeholder="0"
              min="0"
              step="0.01"
              className="outline-none py-2 sm:py-2.5 px-2.5 sm:px-3 rounded border bg-black text-white text-sm sm:text-base border-[#9d0208]/50 focus:border-[#9d0208] focus:ring-1 focus:ring-[#9d0208] w-full"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Add New Category Button */}
        <button
          type="button"
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="w-full sm:w-auto px-6 mr-6 sm:px-8 py-2.5 bg-[#9d0208] text-white text-sm sm:text-base font-semibold rounded hover:bg-black hover:text-[#9d0208] border border-[#9d0208] transition"
        >
          {showAddCategory ? "- Cancel Add Category" : "+ Add New Category"}
        </button>

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 p-3 sm:p-4 border border-[#9d0208]/50 rounded bg-black">
            <input
              type="text"
              placeholder="Category name"
              className="flex-1 outline-none py-2 px-2.5 sm:px-3 rounded border border-[#9d0208]/50 bg-[#003049] text-white text-sm sm:text-base focus:border-[#9d0208] focus:ring-1 focus:ring-[#9d0208]"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
            />
            <div className="flex gap-2 xs:gap-2">
              <button
                type="button"
                onClick={handleAddCategory}
                className="flex-1 xs:flex-initial px-3 sm:px-4 py-2 bg-[#9d0208] text-white text-xs sm:text-sm font-semibold rounded hover:bg-black hover:text-[#9d0208] border border-[#9d0208] transition"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategory("");
                }}
                className="flex-1 xs:flex-initial px-3 sm:px-4 py-2 bg-black text-white text-xs sm:text-sm border border-[#9d0208]/50 rounded hover:border-[#9d0208] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ADD Product Button */}
        <div className="flex flex-col gap-2">
          {uploadStatus && (
            <p className="text-sm text-white/80 text-center">{uploadStatus}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 bg-[#9d0208] text-white text-sm sm:text-base font-semibold rounded hover:bg-black hover:text-[#9d0208] border border-[#9d0208] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Please wait…" : "ADD PRODUCT"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;