import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TinyAI - 超轻量自研 AI (Rust + 4-bit Quantized)",
  description: "TinyAI by FishLab-ai — 完全自研的 GPT 推理引擎，Rust 编写，4-bit 量化权重仅 ~25MB，无需 Git LFS",
  keywords: ["TinyAI", "FishLab-ai", "Rust", "GPT", "4-bit Quantization", "AI", "self-developed"],
  authors: [{ name: "FishLab-ai" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "TinyAI - 超轻量自研 AI",
    description: "Rust Engine + 4-bit Quantization, No Git LFS Required",
    url: "https://github.com/FishLab-ai",
    siteName: "TinyAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TinyAI - 超轻量自研 AI",
    description: "Rust Engine + 4-bit Quantization, No Git LFS Required",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
