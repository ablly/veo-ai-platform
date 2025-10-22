import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider"
import { ToastProvider } from "@/lib/toast-context"
import { Navigation } from "@/components/layout/navigation"
import "./globals.css";
import "./button-fix.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VEO AI - 视频创作平台",
  description: "革命性的AI视频生成技术，将您的创意转化为专业级视频内容",
  keywords: ["AI视频", "视频生成", "VEO", "人工智能", "创作平台"],
  authors: [{ name: "VEO AI Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <AuthProvider>
            <Navigation />
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
