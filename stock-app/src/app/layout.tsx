import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "주식 포트폴리오",
  description: "멀티 계좌 주식 포트폴리오 관리",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className={`${geistSans.variable} antialiased bg-[#0f1117] text-slate-200`}>
        {children}
      </body>
    </html>
  );
}
