'use client';

import React, { useState, useEffect } from 'react';
import { Save, Eye, Search, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const AdminCategorySeoManager = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const categoryOptions = [
    { slug: 'gaming-consoles', name: 'Gaming Consoles' },
    { slug: 'mobile-accessories', name: 'Mobile Accessories' },
    { slug: 'playstation-games', name: 'PlayStation Games' },
    { slug: 'gaming-accessories', name: 'Gaming Accessories' }
  ];

  const [formData, setFormData] = useState({
    categorySlug: '',
    categoryName: '',
    seo: {
      title: '',
      description: '',
      keywords: [],
      openGraph: {
        title: '',
        description: '',
        url: '',
        siteName: '',
        locale: 'en_US',
        type: 'website',
        image: ''
      }
    },
    isActive: true
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seo/category');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        setMessage({ type: 'error', text: 'Failed to load categories' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load categories' });
    }
    setLoading(false);
  };

  const saveCategorySeo = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    if (!formData.categorySlug || !formData.seo.title || !formData.seo.description) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/seo/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'SEO data saved successfully!' });
        await fetchCategories();

        setTimeout(() => {
          setSelectedCategory(null);
          resetForm();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save SEO data' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save SEO data' });
    }

    setSaving(false);
  };

  const loadCategoryData = (category) => {
    setSelectedCategory(category);
    setFormData({
      categorySlug: category.categorySlug,
      categoryName: category.categoryName,
      seo: category.seo,
      isActive: category.isActive
    });
  };

  const resetForm = () => {
    setFormData({
      categorySlug: '',
      categoryName: '',
      seo: {
        title: '',
        description: '',
        keywords: [],
        openGraph: {
          title: '',
          description: '',
          url: '',
          siteName: '',
          locale: 'en_US',
          type: 'website',
          image: ''
        }
      },
      isActive: true
    });
  };

  const handleInputChange = (field, value, isNested = false, nestedField = '') => {
    if (isNested) {
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [field]: nestedField ? {
            ...prev.seo[field],
            [nestedField]: value
          } : value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleKeywordsChange = (value) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k);
    handleInputChange('keywords', keywords, true);
  };

  const createNewCategory = (slug) => {
    const category = categoryOptions.find(c => c.slug === slug);
    setSelectedCategory(null);
    setFormData({
      categorySlug: slug,
      categoryName: category.name,
      seo: {
        title: '',
        description: '',
        keywords: [],
        openGraph: {
          title: '',
          description: '',
          url: `https://yoursite.com/${slug}`,
          siteName: 'Your Gaming Store',
          locale: 'en_US',
          type: 'website',
          image: ''
        }
      },
      isActive: true
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat => 
    cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.categorySlug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#001d2e] via-[#003049] to-[#001d2e] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">Category SEO Manager</h1>
          <p className="text-[#9D0208]">Manage SEO settings for category pages</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Categories List */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-black mb-4">Categories</h2>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#9d0208]"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#9d0208] mb-2">Add New Category</label>
                <select
                  onChange={(e) => e.target.value && createNewCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-black focus:outline-none focus:border-[#9d0208]"
                  defaultValue=""
                >
                  <option value="" disabled>Select category...</option>
                  {categoryOptions.filter(opt => !categories.find(c => c.categorySlug === opt.slug)).map(opt => (
                    <option key={opt.slug} value={opt.slug}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 text-[#9d0208] animate-spin" />
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <p className="text-black text-sm text-center py-8">No categories found</p>
                ) : (
                  filteredCategories.map((category) => (
                    <button
                      key={category.categorySlug}
                      onClick={() => loadCategoryData(category)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedCategory?.categorySlug === category.categorySlug
                          ? 'bg-gradient-to-r from-[#9d0208] to-[#d00000] text-black'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-medium">{category.categoryName}</div>
                      <div className="text-xs opacity-75 mt-1">{category.categorySlug}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* SEO FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              
              {formData.categorySlug ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                      {selectedCategory ? 'Edit' : 'New'} SEO Settings
                    </h2>
                    <span className="text-sm text-gray-400">{formData.categorySlug}</span>
                  </div>

                  <div className="space-y-6">

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.categoryName}
                        onChange={(e) => handleInputChange('categoryName', e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9d0208]"
                        placeholder="Gaming Consoles"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SEO Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.seo.title}
                        onChange={(e) => handleInputChange('title', e.target.value, true)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9d0208]"
                        placeholder="Gaming Consoles - PS5, Xbox, Nintendo | Your Store"
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.seo.title.length} characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SEO Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.seo.description}
                        onChange={(e) => handleInputChange('description', e.target.value, true)}
                        rows={3}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9d0208]"
                        placeholder="Shop the latest gaming consoles..."
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.seo.description.length} characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Keywords (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.seo.keywords.join(', ')}
                        onChange={(e) => handleKeywordsChange(e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9d0208]"
                        placeholder="gaming consoles, PS5, Xbox Series X"
                      />
                    </div>

                    {/* OPEN GRAPH */}
                    <div className="border-t border-white/10 pt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Open Graph (Social Media)</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">OG Title</label>
                          <input
                            type="text"
                            value={formData.seo.openGraph.title}
                            onChange={(e) => handleInputChange('openGraph', e.target.value, true, 'title')}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9d0208]"
                            placeholder="Premium Gaming Consoles Collection"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">OG Description</label>
                          <textarea
                            rows={2}
                            value={formData.seo.openGraph.description}
                            onChange={(e) => handleInputChange('openGraph', e.target.value, true, 'description')}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9d0208]"
                            placeholder="Get the latest PlayStation, Xbox, and Nintendo consoles"
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">OG URL</label>
                            <input
                              type="text"
                              value={formData.seo.openGraph.url}
                              onChange={(e) => handleInputChange('openGraph', e.target.value, true, 'url')}
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9d0208]"
                              placeholder="https://yoursite.com/gaming-consoles"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
                            <input
                              type="text"
                              value={formData.seo.openGraph.siteName}
                              onChange={(e) => handleInputChange('openGraph', e.target.value, true, 'siteName')}
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9d0208]"
                              placeholder="Your Gaming Store"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">OG Image URL</label>
                          <input
                            type="text"
                            value={formData.seo.openGraph.image}
                            onChange={(e) => handleInputChange('openGraph', e.target.value, true, 'image')}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#9d0208]"
                            placeholder="https://yoursite.com/images/og-gaming-consoles.jpg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ACTIVE TOGGLE */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="w-4 h-4 text-[#9d0208] bg-white/5 border-white/10 rounded focus:ring-[#9d0208]"
                      />
                      <label htmlFor="isActive" className="text-sm text-gray-300">Category is active</label>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={saveCategorySeo}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9d0208] to-[#d00000] hover:from-[#7a0106] hover:to-[#9d0208] text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save SEO Settings
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => window.open(`/${formData.categorySlug}`, '_blank')}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                      >
                        <Eye className="w-5 h-5" />
                        Preview
                      </button>
                    </div>
                  </div>

                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Category Selected</h3>
                  <p className="text-gray-400">Select a category from the list or create a new one</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminCategorySeoManager;
