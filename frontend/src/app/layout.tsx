/**
 * Copyright (c) 2026 TickerGrade LLC. All rights reserved.
 * This code is the proprietary property of TickerGrade LLC.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TickerGrade | Intelligent Swing Trading Analysis",
  description: "Data-driven risk analysis for self-directed traders. Grade stocks based on Trend, Value, Macro, and Sentiment.",
  openGraph: {
    title: "TickerGrade - Intelligent Risk Scoring",
    description: "Stop guessing. Start grading. Analyze stocks with professional-grade logic for Trend, Value, and Macro liquidity.",
    type: "website",
    siteName: "TickerGrade",
  },
  twitter: {
    card: "summary",
    title: "TickerGrade",
    description: "Professional-grade risk analysis for the retail trader.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
