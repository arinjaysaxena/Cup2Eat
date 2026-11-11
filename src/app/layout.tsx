import type { Metadata, Viewport } from "next";
import { Bowlby_One, Caveat_Brush, Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Bowlby_One({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });
const hand = Caveat_Brush({ weight: "400", subsets: ["latin"], variable: "--font-hand", display: "swap" });
const body = Space_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Cup2Eat — Good things come in cups",
  description: "Meet Cup2Eat. A little cup packed with a whole lot of goodness. Explore the Ramen Bistro range.",
};

export const viewport: Viewport = {
  themeColor: "#120b07",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${hand.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
