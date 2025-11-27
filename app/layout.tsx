"use client";
import './globals.css'
import Navbar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";
import { useEffect, useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>("");
  useEffect(() => {
    setPathname(typeof window !== "undefined" ? window.location.pathname : "");
  }, []);
  const hideNavAndFooter = pathname.startsWith("/academy");
  useEffect(() => {
    const onErr = (e: ErrorEvent) => {
      console.error("global error:", e.error?.stack ?? e.message, e);
    };
    window.addEventListener("error", onErr);
    return () => window.removeEventListener("error", onErr);
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Use Baloo 2 (playful, rounded — similar to Dynapuff) */}
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {!hideNavAndFooter && <Navbar />}
        {children}
        {!hideNavAndFooter && <Footer />}
        {/* CookiePreferences removed from layout — now rendered inside Footer */}
      </body>
    </html>
  );
}
