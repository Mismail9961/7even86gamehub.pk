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
      type: "website",
    },
  });
  const [keywordInput, setKeywordInput] = useState("");

  // Auth check
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      toast.error("Please login to access this page");
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "admin" && session?.user?.role !== "seller") {
      toast.error("Access denied");
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Fetch SEO
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
    setSeoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenGraphChange = (e) => {
    const { name, value } = e.target;
    setSeoData((prev) => ({
      ...prev,
      openGraph: { ...prev.openGraph, [name]: value },
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !seoData.keywords.includes(keywordInput.trim())) {
      setSeoData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const removeKeyword = (i) => {
    setSeoData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, idx) => idx !== i),
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
      if (response.data.success) toast.success("SEO updated");
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  if (fetching || status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d0208]"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-3 min-[375px]:px-4 sm:px-6 py-4 min-[375px]:py-6 max-w-4xl mx-auto bg-black text-white">

      {/* Live Preview */}
      <div className="bg-[#111] border border-[#9d0208] rounded-lg min-[375px]:rounded-xl shadow-lg p-3 min-[375px]:p-4 sm:p-5 mb-4 min-[375px]:mb-6">
        <h2 className="text-base min-[375px]:text-lg sm:text-xl font-semibold flex items-center gap-2 mb-3 min-[375px]:mb-4">
          <span className="text-[#9d0208]">●</span> 
          <span className="break-words">Current Live SEO Settings</span>
        </h2>

        <div className="space-y-3 min-[375px]:space-y-4">

          <div className="bg-[#1a1a1a] rounded-md min-[375px]:rounded-lg p-2.5 min-[375px]:p-3 border border-[#222]">
            <h3 className="text-xs min-[375px]:text-sm text-gray-300 mb-1">Page Title</h3>
            <p className="text-sm min-[375px]:text-base sm:text-lg break-words">{seoData.title || "Not set"}</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-md min-[375px]:rounded-lg p-2.5 min-[375px]:p-3 border border-[#222]">
            <h3 className="text-xs min-[375px]:text-sm text-gray-300 mb-1">Meta Description</h3>
            <p className="text-xs min-[375px]:text-sm sm:text-base break-words">{seoData.description || "Not set"}</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-md min-[375px]:rounded-lg p-2.5 min-[375px]:p-3 border border-[#222]">
            <h3 className="text-xs min-[375px]:text-sm text-gray-300 mb-2">Keywords</h3>

            {seoData.keywords.length ? (
              <div className="flex flex-wrap gap-1.5 min-[375px]:gap-2">
                {seoData.keywords.map((k, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 min-[375px]:py-1 bg-[#9d0208]/20 border border-[#9d0208]/40 text-[#ffb3b3] rounded-full text-[10px] min-[375px]:text-xs sm:text-sm break-all"
                  >
                    {k}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs min-[375px]:text-sm">No keywords added</p>
            )}
          </div>

          <div className="bg-[#1a1a1a] rounded-md min-[375px]:rounded-lg p-2.5 min-[375px]:p-3 border border-[#222]">
            <h3 className="text-xs min-[375px]:text-sm text-gray-300 mb-2">Open Graph</h3>

            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              <p className="text-xs min-[375px]:text-sm break-words">
                <span className="text-gray-400 font-medium">OG Title:</span> {seoData.openGraph.title || "Not set"}
              </p>
              <p className="text-xs min-[375px]:text-sm break-words">
                <span className="text-gray-400 font-medium">Site Name:</span> {seoData.openGraph.siteName || "Not set"}
              </p>
              <p className="text-xs min-[375px]:text-sm break-words">
                <span className="text-gray-400 font-medium">OG Description:</span> {seoData.openGraph.description || "Not set"}
              </p>
              <p className="text-xs min-[375px]:text-sm break-words">
                <span className="text-gray-400 font-medium">Type:</span> {seoData.openGraph.type}
              </p>
              <p className="text-xs min-[375px]:text-sm break-words">
                <span className="text-gray-400 font-medium">Locale:</span> {seoData.openGraph.locale}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[#0d0d0d] p-3 min-[375px]:p-4 sm:p-6 rounded-lg min-[375px]:rounded-xl border border-[#9d0208] shadow-lg">
        <h1 className="text-lg min-[375px]:text-xl sm:text-2xl font-semibold mb-1 min-[375px]:mb-2">Update SEO Settings</h1>
        <p className="text-gray-400 mb-4 min-[375px]:mb-6 text-xs min-[375px]:text-sm">Modify your website's SEO metadata</p>

        <form onSubmit={handleSubmit} className="space-y-4 min-[375px]:space-y-6">

          {/* Title */}
          <div>
            <label className="text-xs min-[375px]:text-sm block mb-1.5 min-[375px]:mb-2 font-medium">Page Title *</label>
            <input
              type="text"
              name="title"
              value={seoData.title}
              onChange={handleChange}
              className="w-full px-2.5 min-[375px]:px-3 py-2 text-sm min-[375px]:text-base bg-black border border-[#9d0208] rounded-md min-[375px]:rounded-lg focus:ring-1 focus:ring-[#9d0208] focus:outline-none"
              placeholder="Enter page title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs min-[375px]:text-sm block mb-1.5 min-[375px]:mb-2 font-medium">Meta Description *</label>
            <textarea
              name="description"
              rows="3"
              value={seoData.description}
              onChange={handleChange}
              className="w-full px-2.5 min-[375px]:px-3 py-2 text-sm min-[375px]:text-base bg-black border border-[#9d0208] rounded-md min-[375px]:rounded-lg focus:ring-1 focus:ring-[#9d0208] focus:outline-none resize-none"
              placeholder="Enter meta description"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="text-xs min-[375px]:text-sm block mb-1.5 min-[375px]:mb-2 font-medium">Keywords</label>

            <div className="flex flex-col min-[375px]:flex-row gap-2 mb-3">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="flex-1 px-2.5 min-[375px]:px-3 py-2 text-sm min-[375px]:text-base bg-black border border-[#9d0208] rounded-md min-[375px]:rounded-lg focus:ring-1 focus:ring-[#9d0208] focus:outline-none"
                placeholder="Add keyword"
              />

              <button
                type="button"
                onClick={addKeyword}
                className="px-4 py-2 text-sm min-[375px]:text-base bg-[#9d0208] text-white rounded-md min-[375px]:rounded-lg hover:bg-[#7a0207] transition-colors whitespace-nowrap"
              >
                Add
              </button>
            </div>

            {seoData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 min-[375px]:gap-2">
                {seoData.keywords.map((k, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 min-[375px]:gap-2 bg-[#9d0208]/20 border border-[#9d0208]/40 px-2 min-[375px]:px-3 py-1 rounded-full text-xs min-[375px]:text-sm"
                  >
                    <span className="break-all">{k}</span>
                    <button 
                      type="button"
                      onClick={() => removeKeyword(i)} 
                      className="text-[#ffb3b3] hover:text-white text-base min-[375px]:text-lg leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* OG */}
          <div className="border-t border-[#222] pt-4 min-[375px]:pt-6">
            <h2 className="text-base min-[375px]:text-lg sm:text-xl font-semibold mb-3 min-[375px]:mb-4">Open Graph Metadata</h2>

            <div className="space-y-3 min-[375px]:space-y-4">
              <div>
                <label className="text-xs min-[375px]:text-sm text-gray-400 block mb-1">OG Title</label>
                <input
                  type="text"
                  name="title"
                  value={seoData.openGraph.title}
                  onChange={handleOpenGraphChange}
                  placeholder="OG Title"
                  className="w-full px-2.5 min-[375px]:px-3 py-2 text-sm min-[375px]:text-base bg-black border border-[#9d0208] rounded-md min-[375px]:rounded-lg focus:ring-1 focus:ring-[#9d0208] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs min-[375px]:text-sm text-gray-400 block mb-1">OG Description</label>
                <textarea
                  name="description"
                  rows="2"
                  value={seoData.openGraph.description}
                  onChange={handleOpenGraphChange}
                  placeholder="OG Description"
                  className="w-full px-2.5 min-[375px]:px-3 py-2 text-sm min-[375px]:text-base bg-black border border-[#9d0208] rounded-md min-[375px]:rounded-lg focus:ring-1 focus:ring-[#9d0208] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs min-[375px]:text-sm text-gray-400 block mb-1">Site Name</label>
                <input
                  type="text"
                  name="siteName"
                  placeholder="Site Name"
                  value={seoData.openGraph.siteName}
                  onChange={handleOpenGraphChange}
                  className="w-full px-2.5 min-[375px]:px-3 py-2 text-sm min-[375px]:text-base bg-black border border-[#9d0208] rounded-md min-[375px]:rounded-lg focus:ring-1 focus:ring-[#9d0208] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs min-[375px]:text-sm text-gray-400 block mb-1">Page URL</label>
                <input
                  type="url"
                  name="url"
                  placeholder="https://example.com"
                  value={seoData.openGraph.url}
                  onChange={handleOpenGraphChange}
                  className="w-full px-2.5 min-[375px]:px-3 py-2 text-sm min-[375px]:text-base bg-black border border-[#9d0208] rounded-md min-[375px]:rounded-lg focus:ring-1 focus:ring-[#9d0208] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs min-[375px]:text-sm text-gray-400 block mb-1">Locale</label>
                  <input
                    type="text"
                    name="locale"
                    value={seoData.openGraph.locale}
                    onChange={handleOpenGraphChange}
                    className="w-full px-2.5 min-[375px]:px-3 py-2 text-sm min-[375px]:text-base bg-black border border-[#9d0208] rounded-md min-[375px]:rounded-lg focus:ring-1 focus:ring-[#9d0208] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs min-[375px]:text-sm text-gray-400 block mb-1">Type</label>
                  <select
                    name="type"
                    value={seoData.openGraph.type}
                    onChange={handleOpenGraphChange}
                    className="w-full px-2.5 min-[375px]:px-3 py-2 text-sm min-[375px]:text-base bg-black border border-[#9d0208] rounded-md min-[375px]:rounded-lg focus:ring-1 focus:ring-[#9d0208] focus:outline-none"
                  >
                    <option value="website">Website</option>
                    <option value="article">Article</option>
                    <option value="product">Product</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col min-[375px]:flex-row gap-2 min-[375px]:gap-3 sm:gap-4 pt-3 min-[375px]:pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full min-[375px]:flex-1 px-4 min-[375px]:px-6 py-2.5 min-[375px]:py-3 text-sm min-[375px]:text-base bg-[#9d0208] text-white rounded-md min-[375px]:rounded-lg hover:bg-[#7a0207] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={fetchSeoData}
              disabled={loading}
              className="w-full min-[375px]:flex-1 px-4 min-[375px]:px-6 py-2.5 min-[375px]:py-3 text-sm min-[375px]:text-base border border-[#9d0208] text-white rounded-md min-[375px]:rounded-lg hover:bg-[#9d0208]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Reset
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}