import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/app/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VeriKost Malang - Cari Kos-Kosan Terverifikasi Lapangan",
  description: "Platform cari kos terpercaya di Malang untuk mahasiswa UB, UM, UMM, dan UIN. Dilengkapi sistem verifikasi lapangan, foto asli, & ulasan jujur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <AppProvider>
          <Navbar />
          <div className="flex flex-col flex-1">
            {children}
          </div>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}

