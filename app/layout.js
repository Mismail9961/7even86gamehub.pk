// app/layout.js
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import SessionWrapper from "@/components/SessionWrapper";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "7even86gamehub.pk",
  description: "Your one-stop shop for gaming consoles, accessories, and more in Pakistan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased text-gray-700`}>
        <Toaster />
        <SessionWrapper>
          <AppContextProvider>
            {children}
          </AppContextProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}