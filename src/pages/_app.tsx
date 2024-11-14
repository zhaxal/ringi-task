import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isDashboard, setIsDashboard] = useState(false);

  useEffect(() => {
    setIsDashboard(router.pathname.startsWith("/dashboard"));
  }, [router.pathname]);

  return (
    <div className="flex flex-col h-full">
      {isDashboard && <Navbar />}

      <div className="flex-grow mx-4 md:mx-8 lg:mx-16">
        <Component {...pageProps} />
      </div>
      <Footer />
    </div>
  );
}