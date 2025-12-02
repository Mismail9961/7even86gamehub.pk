// app/admin/seo/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function SeoManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [seoData, setSeoData] = useState({
    title: "",
    description: "",
    keywords: [],
    openGraph: {
      title: "",
      description: "",
      url: "",
      siteName: "",
      locale: "en_US",
      type: "website"
    }
  });
  const [keywordInput, setKeywordInput] = useState("");

  // Check authentication and authorization
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      toast.error("Please login to access this page");
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "admin" && session?.user?.role !== "seller") {
      toast.error("Access denied. Admin or Seller role required.");
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Fetch current SEO settings
  useEffect(() => {
    if (session?.user?.role === "admin" || session?.user?.role === "seller") {
      fetchSeoData();
    }
  }, [session]);

  const fetchSeoData = async () => {
    try {
      setFetching(true);
      const response = await axios.get("/api/seo");
      if (response.data.success) {
        setSeoData(response.data.seo);
      }
    } catch (error) {
      toast.error("Failed to load SEO settings");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSeoData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenGraphChange = (e) => {
    const { name, value } = e.target;
    setSeoData(prev => ({
      ...prev,
      openGraph: {
        ...prev.openGraph,
        [name]: value
      }
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !seoData.keywords.includes(keywordInput.trim())) {
      setSeoData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput("");
    }
  };

  const removeKeyword = (index) => {
    setSeoData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!seoData.title || !seoData.description) {
      toast.error("Title and description are required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/seo", seoData);
      
      if (response.data.success) {
        toast.success("SEO settings updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update SEO settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching || status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!session || (session.user.role !== "admin" && session.user.role !== "seller")) {
    return null;
  }

  return (
    <div className="w-full min-h-screen px-3 py-4 sm:px-6 sm:py-6 max-w-4xl mx-auto">
      {/* Current SEO Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-3 sm:p-6 mb-4 sm:mb-6 border border-blue-200">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <h2 className="text-base sm:text-xl font-medium text-gray-800">Current Live SEO Settings</h2>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Page Title</h3>
            <p className="text-sm sm:text-base text-gray-800 font-medium break-words">{seoData.title || "Not set"}</p>
            <span className="text-xs text-gray-500 mt-1 inline-block">
              {seoData.title?.length || 0} characters
            </span>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Meta Description</h3>
            <p className="text-sm sm:text-base text-gray-800 break-words">{seoData.description || "Not set"}</p>
            <span className="text-xs text-gray-500 mt-1 inline-block">
              {seoData.description?.length || 0} characters
            </span>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Keywords</h3>
            {seoData.keywords && seoData.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {seoData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 sm:px-3 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm break-all"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">No keywords set</p>
            )}
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Open Graph Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-gray-600">OG Title:</span>
                <p className="text-gray-800 font-medium break-words">{seoData.openGraph?.title || "Not set"}</p>
              </div>
              <div>
                <span className="text-gray-600">Site Name:</span>
                <p className="text-gray-800 font-medium break-words">{seoData.openGraph?.siteName || "Not set"}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-600">OG Description:</span>
                <p className="text-gray-800 break-words">{seoData.openGraph?.description || "Not set"}</p>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <p className="text-gray-800 font-medium">{seoData.openGraph?.type || "website"}</p>
              </div>
              <div>
                <span className="text-gray-600">Locale:</span>
                <p className="text-gray-800 font-medium">{seoData.openGraph?.locale || "en_US"}</p>
              </div>
              {seoData.openGraph?.url && (
                <div className="sm:col-span-2">
                  <span className="text-gray-600">URL:</span>
                  <p className="text-gray-800 break-all text-xs">{seoData.openGraph.url}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
        <h1 className="text-xl sm:text-3xl font-medium mb-1 sm:mb-2">Update SEO Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Modify your website's SEO settings and metadata</p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic SEO */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-medium border-b pb-2">Basic SEO</h2>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={seoData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter page title"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                Meta Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={seoData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter meta description"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Keywords</label>
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  className="flex-1 px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add keyword and press Enter"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 sm:px-6 text-sm sm:text-base bg-gray-700 text-white rounded-lg hover:bg-gray-800 whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {seoData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm break-all"
                  >
                    <span className="break-all">{keyword}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyword(index)}
                      className="hover:text-blue-600 text-base sm:text-lg flex-shrink-0"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Open Graph / Social Media */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-medium border-b pb-2">Open Graph (Social Media)</h2>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">OG Title</label>
              <input
                type="text"
                name="title"
                value={seoData.openGraph.title}
                onChange={handleOpenGraphChange}
                className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Title for social media shares"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">OG Description</label>
              <textarea
                name="description"
                value={seoData.openGraph.description}
                onChange={handleOpenGraphChange}
                rows="2"
                className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description for social media shares"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={seoData.openGraph.siteName}
                onChange={handleOpenGraphChange}
                className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your website name"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">URL</label>
              <input
                type="url"
                name="url"
                value={seoData.openGraph.url}
                onChange={handleOpenGraphChange}
                className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Locale</label>
                <input
                  type="text"
                  name="locale"
                  value={seoData.openGraph.locale}
                  onChange={handleOpenGraphChange}
                  className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="en_US"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Type</label>
                <select
                  name="type"
                  value={seoData.openGraph.type}
                  onChange={handleOpenGraphChange}
                  className="w-full px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                  <option value="product">Product</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update SEO Settings"}
            </button>
            <button
              type="button"
              onClick={fetchSeoData}
              className="w-full sm:w-auto px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}