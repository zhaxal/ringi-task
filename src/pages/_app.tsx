import "@/styles/globals.css";
import type { AppProps } from "next/app";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-grow mx-4 md:mx-8 lg:mx-16">
        <Component {...pageProps} />
      </div>
      <Footer />
    </div>
  );
}
