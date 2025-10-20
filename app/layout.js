import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import GoToTopArrow from "@/components/GoToTopArrow";
import Provider from "@/components/Provider";

const fredokaVariable = localFont({
  src: "./fonts/Fredoka-VariableFont_wdth,wght.ttf",
  variable: "--font-fredoka-variable",
  weight: "100 900", // All weights
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Tagneed Mail",
  icons: {
    icon: "/favicon.webp",
    apple: "/favicon.webp",
  },
  openGraph: {
    title: "Tagneed Mail",
    siteName: "Tagneed Mail",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tagneed Mail",
    creator: "Ahmed Abdeen",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fredokaVariable.variable} antialiased`}
      >
        <Provider>
          <main className="flex flex-col overflow-hidden min-h-screen md:text-base text-sm relative bg-background text-maincolor">
            <div className="flex relative">
              <Header />
            </div>

            <ScrollToTop />
            <GoToTopArrow />
            <div className="flex flex-grow w-full h-full relative">
              {children}
            </div>
            <Footer />
          </main>
        </Provider>
      </body>
    </html>
  );
}
