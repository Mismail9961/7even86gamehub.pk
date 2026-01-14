// File: app/product/edit/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeExistingImage = (index) => {
    setFormData(prev => ({
      ...prev,
      image: prev.image.filter((_, i) => i !== index)
    }));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
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
      <div className="min-h-screen flex items-center justify-center bg-[#003049]">
        <div className="text-lg text-[#9D0208] font-bold">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#003049] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#003049] rounded-lg p-8">
          <h1 className="text-3xl font-black mb-8 text-[#9D0208] border-b-2 border-[#9D0208] pb-2">
            Edit Product
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-800 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-600 text-green-800 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input fields with custom text color labels */}
            {[
              { label: 'Product Name *', id: 'name', type: 'text' },
              { label: 'Description *', id: 'description', type: 'textarea' }
            ].map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-bold text-[#9D0208] mb-2 uppercase tracking-wide">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    name={field.id}
                    value={formData[field.id]}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9D0208] focus:border-[#9D0208] outline-none text-gray-800"
                    required
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    name={field.id}
                    value={formData[field.id]}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9D0208] focus:border-[#9D0208] outline-none text-gray-800"
                    required
                  />
                )}
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#9D0208] mb-2 uppercase tracking-wide">Regular Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9D0208] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#9D0208] mb-2 uppercase tracking-wide">Offer Price ($)</label>
                <input
                  type="number"
                  name="offerPrice"
                  value={formData.offerPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9D0208] outline-none"
                />
              </div>
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-sm font-bold text-[#9D0208] mb-4 uppercase tracking-wide">Images Management</label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {formData.image.map((img, index) => (
                  <div key={`old-${index}`} className="relative group border-2 border-gray-100 rounded-lg overflow-hidden">
                    <Image src={img} alt="Product" width={200} height={200} className="w-full h-32 object-cover" />
                    <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-1 right-1 bg-[#9D0208] text-white rounded-full p-1 shadow-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#9D0208] file:text-white hover:file:bg-red-800 cursor-pointer"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#9D0208] text-white py-4 px-6 rounded-lg hover:brightness-110 disabled:bg-gray-400 transition-all font-bold uppercase tracking-widest shadow-lg"
              >
                {submitting ? 'Updating...' : 'Update Product'}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-4 border-2 border-[#9D0208] text-[#9D0208] rounded-lg hover:bg-red-50 transition-colors font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}