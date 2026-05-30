import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import PageTransition from "./components/PageTransition";
import Providers from "./components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeckFix — 脖子前倾检测与康复训练",
  description: "科学识别和纠正脖子前倾（Forward Head Posture），提供个性化康复训练方案。所有检测在浏览器本地完成，保护隐私。",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-100">
        <Providers>
          <Navbar />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
        </Providers>
      </body>
    </html>
  );
}
