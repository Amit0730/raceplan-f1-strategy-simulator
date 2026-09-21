import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "RacePlan - Interactive F1 Race Strategy Simulator",
  description:
    "Simulate Formula 1 race strategy by selecting tyre compounds, pit-stop laps, fuel assumptions, and weather conditions with live telemetry.",
  keywords: [
    "f1",
    "formula 1",
    "race strategy",
    "motorsport",
    "pirelli tyres",
    "pit stop",
    "telemetry",
    "simulation",
  ],
  authors: [{ name: "RacePlan Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#080a0f] text-slate-200">
        {children}
      </body>
    </html>
  );
}
