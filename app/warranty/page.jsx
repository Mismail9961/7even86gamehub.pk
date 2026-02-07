"use client";

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import TopBar from '@/components/TopBar';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Shield, Package, Clock, CheckCircle, XCircle, AlertCircle, FileText, Phone } from 'lucide-react';

export default function WarrantyPage() {
  const eligibleItems = [
    "Defective or damaged products upon delivery",
    "Wrong items shipped",
    "Products not matching description",
    "Manufacturing defects discovered within 7 days",
    "Sealed products with factory defects"
  ];

  const nonEligibleItems = [
    "Products with removed or damaged seals",
    "Used or installed products",
    "Products with physical damage caused by customer",
    "Products without original packaging and accessories",
    "Items purchased on clearance or final sale",
    "Digital products or downloadable content"
  ];

  const exchangeProcess = [
    {
      step: "1",
      title: "Contact Us",
      description: "Reach out within 7 days of delivery via WhatsApp, email, or phone with your order details and issue description."
    },
    {
      step: "2",
      title: "Verification",
      description: "Our team will verify your claim and may request photos or videos of the defective product."
    },
    {
      step: "3",
      title: "Return Approval",
      description: "Once approved, you'll receive return instructions and a return authorization number."
    },
    {
      step: "4",
      title: "Ship Back",
      description: "Pack the product securely with all original accessories and ship it back to our warehouse."
    },
    {
      step: "5",
      title: "Inspection",
      description: "We'll inspect the returned product within 2-3 business days to verify the condition."
    },
    {
      step: "6",
      title: "Exchange/Refund",
      description: "After approval, we'll ship your replacement or process your refund within 5-7 business days."
    }
  ];

  return (
    <>
    <TopBar/>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-[#001d2e] via-[#003049] to-[#001d2e]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#9d0208] to-[#6a0105] py-8 sm:py-12 lg:py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/10 rounded-full mb-3 sm:mb-4 lg:mb-6">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 lg:mb-4 px-2">
            7 Days Exchange Policy
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-white/90 max-w-3xl mx-auto px-2">
            Your satisfaction is our priority. Shop with confidence knowing you have 7 days to exchange eligible products.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
        
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-10 lg:mb-16">
          <div className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 text-center">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#9d0208] mx-auto mb-2 sm:mb-3 lg:mb-4" />
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">7 Days</h3>
            <p className="text-xs sm:text-sm text-gray-400">From delivery date to initiate exchange</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 text-center">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#9d0208] mx-auto mb-2 sm:mb-3 lg:mb-4" />
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">Original Packaging</h3>
            <p className="text-xs sm:text-sm text-gray-400">Product must be in original condition</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 text-center">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#9d0208] mx-auto mb-2 sm:mb-3 lg:mb-4" />
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">Full Protection</h3>
            <p className="text-xs sm:text-sm text-gray-400">Against defects and damages</p>
          </div>
        </div>

        {/* Eligible vs Non-Eligible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-10 lg:mb-16">
          
          {/* Eligible Items */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-900/10 border border-green-500/30 rounded-lg sm:rounded-xl p-3 sm:p-5 lg:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-400 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl lg:text-3xl font-bold text-white">Eligible for Exchange</h2>
            </div>
            <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
              {eligibleItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm lg:text-base text-gray-300 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Non-Eligible Items */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-900/10 border border-red-500/30 rounded-lg sm:rounded-xl p-3 sm:p-5 lg:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-400 flex-shrink-0" />
              <h2 className="text-lg sm:text-xl lg:text-3xl font-bold text-white">Not Eligible</h2>
            </div>
            <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
              {nonEligibleItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2 sm:gap-3">
                  <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm lg:text-base text-gray-300 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Exchange Process */}
        <div className="mb-6 sm:mb-10 lg:mb-16">
          <div className="text-center mb-5 sm:mb-7 lg:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-4 px-2">
              How to Exchange Your Product
            </h2>
            <p className="text-xs sm:text-sm lg:text-lg text-gray-400 max-w-2xl mx-auto px-2">
              Follow these simple steps to initiate an exchange
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {exchangeProcess.map((process, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-5 lg:p-6 relative">
                <div className="absolute -top-2 sm:-top-3 lg:-top-4 -left-2 sm:-left-3 lg:-left-4 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#9d0208] to-[#6a0105] rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg shadow-lg">
                  {process.step}
                </div>
                <h3 className="text-sm sm:text-base lg:text-xl font-bold text-white mb-1.5 sm:mb-2 lg:mb-3 mt-1.5 sm:mt-2 lg:mt-3">
                  {process.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {process.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Important Terms */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-900/10 border border-yellow-500/30 rounded-lg sm:rounded-xl p-3 sm:p-5 lg:p-8 mb-6 sm:mb-10 lg:mb-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-400 flex-shrink-0" />
            <h2 className="text-lg sm:text-xl lg:text-3xl font-bold text-white">Important Terms</h2>
          </div>
          <div className="space-y-2.5 sm:space-y-3 lg:space-y-4 text-xs sm:text-sm lg:text-base text-gray-300">
            <p className="leading-relaxed">
              <strong className="text-white">7-Day Period:</strong> The exchange period starts from the date of delivery, not the order date. Ensure you inspect your product immediately upon receipt.
            </p>
            <p className="leading-relaxed">
              <strong className="text-white">Original Condition:</strong> Products must be returned in their original packaging with all accessories, manuals, warranty cards, and free gifts (if any).
            </p>
            <p className="leading-relaxed">
              <strong className="text-white">Proof of Purchase:</strong> You must provide a valid invoice or order confirmation to process an exchange.
            </p>
            <p className="leading-relaxed">
              <strong className="text-white">Shipping Costs:</strong> For defective products, we cover return shipping. For change of mind or non-defective returns, shipping costs are the customer's responsibility.
            </p>
            <p className="leading-relaxed">
              <strong className="text-white">Inspection Time:</strong> Once we receive your returned product, please allow 2-3 business days for inspection before exchange processing begins.
            </p>
            <p className="leading-relaxed">
              <strong className="text-white">Replacement Availability:</strong> If the exact product is unavailable, we'll offer a similar alternative or issue a refund.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-[#9d0208]/20 to-black/40 border border-[#9d0208]/30 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-10 text-center">
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-[#9d0208] mx-auto mb-3 sm:mb-4 lg:mb-6" />
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-4 px-2">
            Need Help with an Exchange?
          </h2>
          <p className="text-xs sm:text-sm lg:text-lg text-gray-400 mb-4 sm:mb-6 lg:mb-8 max-w-2xl mx-auto px-2">
            Our customer support team is here to assist you with any questions about our exchange policy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-2">
            <a
              href="https://wa.me/923378679555"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-green-600/50 text-xs sm:text-sm lg:text-base"
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              WhatsApp Support
            </a>
            
            <a
              href="mailto:support@7even86gamehub.pk"
              className="flex items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 border border-white/20 hover:bg-white/5 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm lg:text-base"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              Email Us
            </a>
          </div>

          <div className="mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 lg:pt-8 border-t border-white/10">
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 px-2">
              Business Hours: Monday - Saturday, 10:00 AM - 8:00 PM (PKT)
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 sm:mt-10 lg:mt-12 text-center px-2">
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 max-w-3xl mx-auto leading-relaxed">
            7even86 Game Hub reserves the right to modify this exchange policy at any time. 
            Please check this page regularly for updates. Last updated: December 2024
          </p>
        </div>

      </div>
    </div>
    <Footer/>
    <WhatsAppButton/>
    </>
  );
}