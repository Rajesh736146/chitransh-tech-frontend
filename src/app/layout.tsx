import type { Metadata } from "next";
import { DM_Sans, Source_Serif_4 } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChitranshTech — Find Your Dream Career",
  description: "India's leading job platform for blue-collar and white-collar professionals. Connect, grow, and get hired.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen bg-[var(--color-cream)] text-[var(--color-ink)] antialiased font-[var(--font-sans)]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
