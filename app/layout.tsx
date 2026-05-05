import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OptoMedEd — Eye care education for every stage of your career",
    template: "%s | OptoMedEd",
  },
  description:
    "Member-based e-learning platform for eye care professionals — students, residents, ODs, MDs, technicians, opticians, and vision scientists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
