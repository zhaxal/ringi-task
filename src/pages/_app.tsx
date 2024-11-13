import Footer from "@/components/Footer";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <Component {...pageProps} />
      </div>
      <Footer />
    </div>
  );
}
