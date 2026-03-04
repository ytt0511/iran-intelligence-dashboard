import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "伊朗情报看板 | Iran Intelligence Dashboard",
  description: "伊朗地缘政治风险监测、实时新闻、概率模型与金融市场联动分析",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-[#0a0a0f] text-gray-200 min-h-screen grid-pattern">
        {children}
      </body>
    </html>
  );
}
