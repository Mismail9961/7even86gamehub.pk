"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, XCircle, CheckCircle, Clock, Send, RotateCcw } from "lucide-react";
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
    if (!form.name.trim()) e.name = "Name required";
    if (!form.email.trim()) e.email = "Email required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.subject.trim()) e.subject = "Subject required";
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = "Minimum 10 characters";
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

      setSuccess("Message sent! We'll be in touch shortly.");
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
      <Navbar />
      <div className="bg-[#003049] min-h-screen font-sans">
        <main className="max-w-6xl mx-auto px-4 py-8 sm:py-16 lg:py-20">
          {/* Header */}
          <header className="mb-10 sm:mb-16 text-center lg:text-left">
            <span className="text-[#9d0208] uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold mb-3 block">
              Get In Touch
            </span>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              Contact <span className="text-[#9d0208]">Us</span>
            </h1>
            <p className="mt-4 text-gray-400 text-sm sm:text-lg max-w-2xl leading-relaxed">
              Have a question about an order or our services? Our team is ready to help you.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
            {/* Left Section: Info */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Support Card */}
              <div className="bg-[#003049] border border-white/5 p-6 rounded-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#9d0208]/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#9d0208]/20 transition-all"></div>
                
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-[#9d0208]" />
                  Operating Hours
                </h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center rounded-lg text-[#9d0208]">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Call Us</p>
                      <p className="text-white font-medium">+92 337 8679555</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center rounded-lg text-[#9d0208]">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Email Us</p>
                      <p className="text-white font-medium truncate">7even86gamehub@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center rounded-lg text-[#9d0208]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Visit Us</p>
                      <address className="text-white font-medium not-italic text-sm leading-relaxed mt-1">
                        NOMAN GARDEN, BLF SHOP 34, <br />
                        PLT FL 6 BL 1 SCT 14A METROVIL
                      </address>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-6 bg-gradient-to-r from-[#9d0208]/20 to-transparent border-l-4 border-[#9d0208] rounded-r-xl">
                <p className="text-white text-sm font-semibold italic">
                  "Most inquiries receive a response within 24 business hours."
                </p>
              </div>
            </aside>

            {/* Right Section: Form */}
            <div className="lg:col-span-8 bg-[#003049]/30 border border-white/10 p-5 xs:p-6 sm:p-10 rounded-2xl backdrop-blur-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Full Name</label>
                  <input
                    className={`w-full bg-[#001d2d] border px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#9d0208]/50 transition-all rounded-lg ${
                      errors.name ? "border-red-500/50" : "border-white/10"
                    }`}
                    placeholder="Enter name"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    className={`w-full bg-[#001d2d] border px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#9d0208]/50 transition-all rounded-lg ${
                      errors.email ? "border-red-500/50" : "border-white/10"
                    }`}
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Order ID</label>
                  <input
                    className="w-full bg-[#001d2d] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#9d0208]/50 transition-all rounded-lg"
                    placeholder="#Optional"
                    value={form.orderNumber}
                    onChange={(e) => setForm((s) => ({ ...s, orderNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Subject</label>
                  <input
                    className={`w-full bg-[#001d2d] border px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#9d0208]/50 transition-all rounded-lg ${
                      errors.subject ? "border-red-500/50" : "border-white/10"
                    }`}
                    placeholder="How can we help?"
                    value={form.subject}
                    onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Your Message</label>
                <textarea
                  className={`w-full bg-[#001d2d] border px-4 py-3 min-h-[150px] text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#9d0208]/50 transition-all resize-none rounded-lg ${
                    errors.message ? "border-red-500/50" : "border-white/10"
                  }`}
                  placeholder="Type your message here..."
                  value={form.message}
                  onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                />
              </div>

              {/* Action Bar */}
              <div className="mt-8 flex flex-col xs:flex-row items-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full xs:w-auto flex items-center justify-center gap-2 bg-[#9d0208] hover:bg-[#ba0309] text-white px-8 py-4 text-sm font-bold transition-all rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Sending..." : <><Send className="w-4 h-4" /> Send Message</>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForm({ name: "", email: "", orderNumber: "", subject: "", message: "" });
                    setErrors({});
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              {/* Feedback Alerts */}
              {(success || serverError) && (
                <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                  {success && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg flex items-center gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 shrink-0" /> {success}
                    </div>
                  )}
                  {serverError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3 text-sm">
                      <XCircle className="w-5 h-5 shrink-0" /> {serverError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}