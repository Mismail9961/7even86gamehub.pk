"use client";

import React, { useState } from "react";
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
  const [category, setCategory] = useState("Earphone");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");

  // Only seller/admin can access
  if (!user || !["seller", "admin"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">Access Denied</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("offerPrice", offerPrice);
  
    files.forEach((file) => formData.append("images", file));
  
    try {
      const { data } = await axios.post("/api/product/add", formData, {
        withCredentials: true, // Ensure cookies are sent
      });
  
      if (data.success) {
        toast.success(data.message);
        setFiles([]);
        setName("");
        setDescription("");
        setCategory("Earphone");
        setPrice("");
        setOfferPrice("");
      } else {
        toast.error(data.message || "Failed to add product");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add product");
    }
  };
  

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form
        onSubmit={handleSubmit}
        className="md:p-10 p-4 space-y-5 max-w-lg mx-auto"
      >
        {/* Product Images */}
        <div>
          <p className="text-base font-medium text-[#5C66F0]">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input
                  type="file"
                  id={`image${index}`}
                  hidden
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
                  className="cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Product Name */}
        <div className="flex flex-col gap-1 max-w-md">
          <label htmlFor="product-name" className="text-base font-medium text-[#5C66F0]">
            Product Name
          </label>
          <input
            type="text"
            id="product-name"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-[#5C66F0]/40 focus:border-[#5C66F0] focus:ring-1 focus:ring-[#5C66F0]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Product Description */}
        <div className="flex flex-col gap-1 max-w-md">
          <label htmlFor="product-description" className="text-base font-medium text-[#5C66F0]">
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-[#5C66F0]/40 resize-none focus:border-[#5C66F0] focus:ring-1 focus:ring-[#5C66F0]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Category, Price, Offer Price */}
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex flex-col gap-1 w-32">
            <label htmlFor="category" className="text-base font-medium text-[#5C66F0]">
              Category
            </label>
            <select
              id="category"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-[#5C66F0]/40 focus:border-[#5C66F0] focus:ring-1 focus:ring-[#5C66F0]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Earphone">Earphone</option>
              <option value="Headphone">Headphone</option>
              <option value="Watch">Watch</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Laptop">Laptop</option>
              <option value="Camera">Camera</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label htmlFor="product-price" className="text-base font-medium text-[#5C66F0]">
              Product Price
            </label>
            <input
              type="number"
              id="product-price"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-[#5C66F0]/40 focus:border-[#5C66F0] focus:ring-1 focus:ring-[#5C66F0]"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1 w-32">
            <label htmlFor="offer-price" className="text-base font-medium text-[#5C66F0]">
              Offer Price
            </label>
            <input
              type="number"
              id="offer-price"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-[#5C66F0]/40 focus:border-[#5C66F0] focus:ring-1 focus:ring-[#5C66F0]"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-8 py-2.5 bg-[#5C66F0] text-white font-medium rounded hover:bg-[#4A54D4] transition"
        >
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
