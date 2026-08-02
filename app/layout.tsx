import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AidLens ??Relief kit verification with Gemma",
  description: "A multilingual, edge-ready field assistant that checks disaster relief kits from a single photo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

