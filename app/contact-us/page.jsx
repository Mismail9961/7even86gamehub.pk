"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, XCircle, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    orderNumber: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [serverError, setServerError] = useState(null);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.email.trim()) e.email = "Please enter your email.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = "Message should be at least 10 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setSuccess(null);
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Server error.");
      }

      setSuccess("Thanks! Your message was sent successfully.");
      setForm({ name: "", email: "", orderNumber: "", subject: "", message: "" });
      setErrors({});
    } catch (err) {
      setServerError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
    <Navbar/>
    <div className="bg-[#003049] min-h-screen">
      <main className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 py-6 xs:py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <header className="mb-6 xs:mb-8 sm:mb-12 text-center lg:text-left">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Contact <span className="text-[#9d0208]">Us</span>
          </h1>
          <p className="mt-1.5 xs:mt-2 sm:mt-3 text-gray-400 text-xs xs:text-sm sm:text-base md:text-lg">
            Need help? We're here for you 24/7.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 xs:gap-6 sm:gap-8">
          {/* Left Section */}
          <aside className="space-y-5 xs:space-y-6">
            {/* Support Card */}
            <div className="bg-gradient-to-br from-[#9d0208] to-[#7a0106] p-4 xs:p-5 sm:p-6 border border-white/10 relative overflow-hidden rounded-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
              <div className="relative z-10">
                <h3 className="text-base xs:text-lg sm:text-xl font-bold text-white">Customer Support</h3>
                <p className="mt-1.5 xs:mt-2 text-xs xs:text-sm text-white/80">Mon - Fri: 9 AM — 6 PM (PKT)</p>

                <dl className="mt-4 xs:mt-5 sm:mt-6 space-y-3 xs:space-y-4 text-xs xs:text-sm">
                  <div className="flex items-start gap-2.5 xs:gap-3 group">
                    <div className="w-9 h-9 xs:w-10 xs:h-10 flex-shrink-0 flex items-center justify-center bg-white/10 border border-white/20 group-hover:bg-white/20 transition-colors rounded-sm">
                      <Phone className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <dt className="font-semibold text-white">Phone</dt>
                      <dd className="text-white/80 mt-0.5 xs:mt-1">+92 330 2533241</dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 xs:gap-3 group">
                    <div className="w-9 h-9 xs:w-10 xs:h-10 flex-shrink-0 flex items-center justify-center bg-white/10 border border-white/20 group-hover:bg-white/20 transition-colors rounded-sm">
                      <Mail className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <dt className="font-semibold text-white">Email</dt>
                      <dd className="text-white/80 mt-0.5 xs:mt-1 break-all">7even86gamehub@gmail.com</dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 xs:gap-3 group">
                    <div className="w-9 h-9 xs:w-10 xs:h-10 flex-shrink-0 flex items-center justify-center bg-white/10 border border-white/20 group-hover:bg-white/20 transition-colors rounded-sm">
                      <MapPin className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <dt className="font-semibold text-white">Address</dt>
                      <dd className="text-white/80 mt-0.5 xs:mt-1">Gulberg, Karachi, Pakistan</dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-4 xs:mt-5 sm:mt-6 flex flex-wrap gap-3 xs:gap-4 text-xs xs:text-sm">
                  <a href="/warranty" className="text-white hover:text-white/80 transition-colors underline">Returns</a>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden border border-white/10 h-44 xs:h-48 sm:h-56 bg-white/5 rounded-sm">
              <iframe
                title="location"
                className="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.4474!2d67.0731!3d24.8607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDUxJzM4LjUiTiA2N8KwMDQnMjMuMiJF!5e0!3m2!1sen!2s!4v1234567890"
                loading="lazy"
              />
            </div>
          </aside>

          {/* Contact Form */}
          <div className="lg:col-span-2 border border-white/10 p-4 xs:p-5 sm:p-6 md:p-8 bg-white/5 rounded-sm">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-white mb-4 xs:mb-5 sm:mb-6">Send us a message</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 xs:gap-4 sm:gap-5">
              {/* Name */}
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-1.5 xs:mb-2">Full name *</label>
                <input
                  className={`w-full bg-[#001f2f] border px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9d0208] focus:border-transparent transition-all rounded-sm ${
                    errors.name ? "border-red-500" : "border-white/20"
                  }`}
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
                {errors.name && <p className="text-[10px] xs:text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-1.5 xs:mb-2">Email *</label>
                <input
                  type="email"
                  className={`w-full bg-[#001f2f] border px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9d0208] focus:border-transparent transition-all rounded-sm ${
                    errors.email ? "border-red-500" : "border-white/20"
                  }`}
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                />
                {errors.email && <p className="text-[10px] xs:text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>

              {/* Order Number */}
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-1.5 xs:mb-2">Order number (optional)</label>
                <input
                  className="w-full bg-[#001f2f] border border-white/20 px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9d0208] focus:border-transparent transition-all rounded-sm"
                  placeholder="#12345"
                  value={form.orderNumber}
                  onChange={(e) => setForm((s) => ({ ...s, orderNumber: e.target.value }))}
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-1.5 xs:mb-2">Subject *</label>
                <input
                  className={`w-full bg-[#001f2f] border px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9d0208] focus:border-transparent transition-all rounded-sm ${
                    errors.subject ? "border-red-500" : "border-white/20"
                  }`}
                  placeholder="Order inquiry"
                  value={form.subject}
                  onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
                />
                {errors.subject && <p className="text-[10px] xs:text-xs text-red-400 mt-1">{errors.subject}</p>}
              </div>
            </div>

            {/* Message */}
            <div className="mt-3.5 xs:mt-4 sm:mt-5">
              <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-1.5 xs:mb-2">Message *</label>
              <textarea
                className={`w-full bg-[#001f2f] border px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 min-h-[100px] xs:min-h-[120px] sm:min-h-[140px] text-xs xs:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9d0208] focus:border-transparent transition-all resize-none rounded-sm ${
                  errors.message ? "border-red-500" : "border-white/20"
                }`}
                placeholder="Tell us more about your inquiry..."
                value={form.message}
                onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
              />
              {errors.message && <p className="text-[10px] xs:text-xs text-red-400 mt-1">{errors.message}</p>}
            </div>

            {/* Buttons */}
            <div className="mt-5 xs:mt-6 sm:mt-8 space-y-3 xs:space-y-0 xs:flex xs:flex-wrap xs:gap-3 xs:items-center">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full xs:w-auto bg-[#9d0208] hover:bg-[#7a0106] active:bg-[#6a0105] text-white px-5 xs:px-6 sm:px-8 py-2.5 xs:py-3 text-xs xs:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-sm shadow-lg hover:shadow-xl"
              >
                {submitting ? "Sending..." : "Send message"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm({ name: "", email: "", orderNumber: "", subject: "", message: "" });
                  setErrors({});
                  setSuccess(null);
                  setServerError(null);
                }}
                className="w-full xs:w-auto text-xs xs:text-sm text-gray-400 hover:text-white transition-colors underline text-center xs:text-left"
              >
                Reset form
              </button>

              <span className="w-full xs:w-auto xs:ml-auto text-[10px] xs:text-xs sm:text-sm flex items-center justify-center xs:justify-start gap-1.5 xs:gap-2 text-gray-400">
                <CheckCircle className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-[#9d0208] flex-shrink-0" /> 
                Response within 24 hours
              </span>
            </div>

            {/* Alerts */}
            {(success || serverError) && (
              <div className="mt-4 xs:mt-5 sm:mt-6">
                {success && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 xs:p-3.5 sm:p-4 flex items-start gap-2 xs:gap-2.5 sm:gap-3 text-xs xs:text-sm rounded-sm">
                    <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                {serverError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 xs:p-3.5 sm:p-4 flex items-start gap-2 xs:gap-2.5 sm:gap-3 text-xs xs:text-sm rounded-sm">
                    <XCircle className="w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
    <Footer/>
    </>
  );
}