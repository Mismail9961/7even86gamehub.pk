"use client";

import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

const AddProduct = () => {
  const { router } = useAppContext();
  const { data: session } = useSession();
  const user = session?.user;

  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

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
        await fetchCategories(); // Refresh categories list
        setCategory(data.data._id); // Auto-select the new category
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-[#9d0208]">Access Denied</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0 || !files[0]) {
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

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("offerPrice", offerPrice);

    files.forEach((file) => formData.append("images", file));

    try {
      const { data } = await axios.post("/api/product/add", formData, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success(data.message);
        setFiles([]);
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setOfferPrice("");
      } else {
        toast.error(data.message || "Failed to add product");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-[#003049] text-white">
      <form
        onSubmit={handleSubmit}
        className="md:p-10 p-4 space-y-5 max-w-lg mx-auto"
      >
        {/* Product Images */}
        <div>
          <p className="text-base font-semibold text-[#9d0208]">
            Product Image
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input
                  type="file"
                  id={`image${index}`}
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const updatedFiles = [...files];
                    updatedFiles[index] = e.target.files[0];
                    setFiles(updatedFiles);
                  }}
                />
                <Image
                  src={
                    files[index]
                      ? URL.createObjectURL(files[index])
                      : assets.upload_area
                  }
                  alt={`upload-${index}`}
                  width={100}
                  height={100}
                  className="cursor-pointer border border-[#9d0208] rounded"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Product Name */}
        <div className="flex flex-col gap-1 max-w-md">
          <label
            htmlFor="product-name"
            className="text-base font-semibold text-[#9d0208]"
          >
            Product Name
          </label>
          <input
            type="text"
            id="product-name"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-[#9d0208]/50 bg-black text-white focus:border-[#9d0208] focus:ring-1 focus:ring-[#9d0208]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Product Description */}
        <div className="flex flex-col gap-1 max-w-md">
          <label
            htmlFor="product-description"
            className="text-base font-semibold text-[#9d0208]"
          >
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border bg-black text-white border-[#9d0208]/50 resize-none focus:border-[#9d0208] focus:ring-1 focus:ring-[#9d0208]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Category, Price, Offer Price */}
        <div className="flex items-center gap-5 flex-wrap">
          {/* Category */}
          <div className="flex flex-col gap-1 w-40">
            <label
              htmlFor="category"
              className="text-base font-semibold text-[#9d0208]"
            >
              Category
            </label>
            <select
              id="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border bg-black text-white border-[#9d0208]/50 focus:border-[#9d0208] focus:ring-1 focus:ring-[#9d0208]"
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

          {/* Product Price */}
          <div className="flex flex-col gap-1 w-32">
            <label
              htmlFor="product-price"
              className="text-base font-semibold text-[#9d0208]"
            >
              Product Price
            </label>
            <input
              type="number"
              id="product-price"
              placeholder="0"
              min="0"
              step="0.01"
              className="outline-none md:py-2.5 py-2 px-3 rounded border bg-black text-white border-[#9d0208]/50 focus:border-[#9d0208] focus:ring-1 focus:ring-[#9d0208]"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {/* Offer Price */}
          <div className="flex flex-col gap-1 w-32">
            <label
              htmlFor="offer-price"
              className="text-base font-semibold text-[#9d0208]"
            >
              Offer Price
            </label>
            <input
              type="number"
              id="offer-price"
              placeholder="0"
              min="0"
              step="0.01"
              className="outline-none md:py-2.5 py-2 px-3 rounded border bg-black text-white border-[#9d0208]/50 focus:border-[#9d0208] focus:ring-1 focus:ring-[#9d0208]"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Add New Category Button */}
        <button
          type="button"
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="text-sm text-[#9d0208] hover:underline"
        >
          {showAddCategory ? "- Cancel Add Category" : "+ Add New Category"}
        </button>

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="flex items-center gap-3 p-4 border border-[#9d0208]/50 rounded bg-black">
            <input
              type="text"
              placeholder="Category name"
              className="flex-1 outline-none py-2 px-3 rounded border border-[#9d0208]/50 bg-[#003049] text-white focus:border-[#9d0208] focus:ring-1 focus:ring-[#9d0208]"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-[#9d0208] text-white font-semibold rounded hover:bg-black hover:text-[#9d0208] border border-[#9d0208] transition"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddCategory(false);
                setNewCategory("");
              }}
              className="px-4 py-2 bg-black text-white border border-[#9d0208]/50 rounded hover:border-[#9d0208] transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ADD Product Button */}
        <button
          type="submit"
          className="px-8 py-2.5 bg-[#9d0208] text-white font-semibold rounded hover:bg-black hover:text-[#9d0208] border border-[#9d0208] transition"
        >
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddProduct;