'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Upload, X, AlertCircle, Check } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const MAX_IMAGES = 4;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    offerPrice: '',
    image: [],
  });

  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/product/${productId}`);
        const result = await response.json();

        if (result.success) {
          const product = result.data;
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            offerPrice: product.offerPrice || '',
            image: product.image || [],
          });
        } else {
          setError(result.error || 'Failed to load product');
        }
      } catch (err) {
        setError('Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const processFiles = (files) => {
    const currentTotal = formData.image.length + newImages.length;
    const availableSlots = MAX_IMAGES - currentTotal;
    
    if (availableSlots <= 0) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== fileArray.length) {
      setError('Some files were skipped. Only image files are allowed.');
    }

    const filesToAdd = validFiles.slice(0, availableSlots);
    
    if (validFiles.length > availableSlots) {
      setError(`Only ${availableSlots} more image${availableSlots !== 1 ? 's' : ''} can be added. Maximum ${MAX_IMAGES} images allowed.`);
    }

    setNewImages(prev => [...prev, ...filesToAdd]);
    const previews = filesToAdd.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files?.length > 0) {
      processFiles(files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeExistingImage = (index) => {
    setFormData(prev => ({
      ...prev,
      image: prev.image.filter((_, i) => i !== index)
    }));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const totalImages = formData.image.length + newImages.length;
      if (totalImages === 0) {
        throw new Error('Please add at least one product image');
      }

      if (totalImages > MAX_IMAGES) {
        throw new Error(`Maximum ${MAX_IMAGES} images allowed`);
      }

      let imageUrls = [...formData.image];
      
      if (newImages.length > 0) {
        const base64Images = await Promise.all(
          newImages.map(file => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          })
        );
        imageUrls = [...imageUrls, ...base64Images];
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : null,
        image: imageUrls,
      };

      const response = await fetch(`/api/product/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Product updated successfully!');
        setTimeout(() => router.push(`/product/${productId}`), 1500);
      } else {
        throw new Error(result.error || 'Failed to update product');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#002C43]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#930107] mb-3"></div>
          <div className="text-base text-white font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  const totalImages = formData.image.length + newImages.length;
  const canAddMore = totalImages < MAX_IMAGES;

  return (
    <div className="min-h-screen py-4 px-3 sm:py-8 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className=" rounded-xl p-4 sm:p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#9d0208] mb-1 sm:mb-2">Edit Product</h1>
            <p className="text-xs sm:text-sm text-[#9d0208]">Update product information and images</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-[#930107] rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#930107] flex-shrink-0 mt-0.5" />
              <p className="text-[#930107] text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-600 rounded flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800 text-xs sm:text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-5 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-[#9d0208] mb-1.5 sm:mb-2">
                Product Name <span className="text-[#930107]">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#930107] focus:border-transparent outline-none transition-all text-sm sm:text-base text-gray-900 placeholder-gray-400"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-[#9d0208] mb-1.5 sm:mb-2">
                Description <span className="text-[#930107]">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#930107] focus:border-transparent outline-none transition-all text-sm sm:text-base text-gray-900 placeholder-gray-400 resize-none"
                placeholder="Describe your product..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <div>
                <label htmlFor="price" className="block text-xs sm:text-sm font-semibold text-[#9d0208] mb-1.5 sm:mb-2">
                  Price ($) <span className="text-[#930107]">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#930107] focus:border-transparent outline-none transition-all text-sm sm:text-base text-gray-900"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label htmlFor="offerPrice" className="block text-xs sm:text-sm font-semibold text-[#9d0208] mb-1.5 sm:mb-2">
                  Offer ($) <span className="text-gray-400 text-xs">Optional</span>
                </label>
                <input
                  type="number"
                  id="offerPrice"
                  name="offerPrice"
                  value={formData.offerPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#930107] focus:border-transparent outline-none transition-all text-sm sm:text-base text-gray-900"
                  placeholder="0.00"
                />
                {formData.offerPrice && formData.price && parseFloat(formData.offerPrice) < parseFloat(formData.price) && (
                  <p className="mt-1 text-xs text-green-600 font-medium">
                    {Math.round(((formData.price - formData.offerPrice) / formData.price) * 100)}% off
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#9d0208] mb-2">
                Images <span className="text-[#930107]">*</span>
                <span className="ml-2 text-xs font-normal text-gray-500">
                  ({totalImages}/{MAX_IMAGES})
                </span>
              </label>

              {(formData.image.length > 0 || imagePreviews.length > 0) && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Current Images</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {formData.image.map((img, index) => (
                      <div key={`existing-${index}`} className="relative group aspect-square">
                        <div className="w-full h-full rounded-lg overflow-hidden border-2 border-gray-200 bg-white">
                          <Image 
                            src={img} 
                            alt={`Product ${index + 1}`} 
                            width={150} 
                            height={150} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-[#930107] hover:bg-red-700 text-white rounded-full p-1 sm:p-1.5 shadow-lg transition-all"
                          title="Remove"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                          Saved
                        </div>
                      </div>
                    ))}

                    {imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group aspect-square">
                        <div className="w-full h-full rounded-lg overflow-hidden border-2 border-[#930107] bg-white">
                          <Image 
                            src={preview} 
                            alt={`New ${index + 1}`} 
                            width={150} 
                            height={150} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-[#930107] hover:bg-red-700 text-white rounded-full p-1 sm:p-1.5 shadow-lg transition-all"
                          title="Remove"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-[#930107] text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                          New
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canAddMore && (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all ${
                    dragActive 
                      ? 'border-[#930107] bg-red-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label 
                    htmlFor="imageUpload" 
                    className="cursor-pointer flex flex-col items-center gap-2 sm:gap-3"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#002C43] flex items-center justify-center">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium text-xs sm:text-sm mb-0.5 sm:mb-1">
                        Click or drag images
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG (Max {MAX_IMAGES})
                      </p>
                    </div>
                    <div className="mt-1 sm:mt-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#930107] text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-xs sm:text-sm">
                      Browse
                    </div>
                  </label>
                </div>
              )}

              {!canAddMore && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Maximum {MAX_IMAGES} images reached. Remove an image to add more.
                  </p>
                </div>
              )}

              {totalImages === 0 && (
                <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  At least one image required
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || totalImages === 0}
                className="w-full bg-[#930107] text-white py-3 px-4 sm:py-3.5 sm:px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-semibold text-sm sm:text-base shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Updating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Update Product</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                className="w-full px-4 py-3 sm:px-6 sm:py-3.5 border-2 border-[#002C43] text-[#002C43] rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}