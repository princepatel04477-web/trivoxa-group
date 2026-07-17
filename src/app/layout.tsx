import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import LenisProvider from "@/components/providers/LenisProvider";
import CustomCursor from "@/components/CustomCursor";
import VelocitySkewHeadings from "@/components/VelocitySkewHeadings";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const lufga = localFont({
  variable: "--font-lufga",
  src: [
    { path: "../fonts/lufga/Lufga-Thin.woff", weight: "100", style: "normal" },
    { path: "../fonts/lufga/Lufga-ExtraLight.woff", weight: "200", style: "normal" },
    { path: "../fonts/lufga/Lufga-Light.woff", weight: "300", style: "normal" },
    { path: "../fonts/lufga/Lufga-Light-Italic.woff", weight: "300", style: "italic" },
    { path: "../fonts/lufga/Lufga-Regular.woff", weight: "400", style: "normal" },
    { path: "../fonts/lufga/Lufga-Medium.woff", weight: "500", style: "normal" },
    { path: "../fonts/lufga/Lufga-SemiBold.woff", weight: "600", style: "normal" },
    { path: "../fonts/lufga/Lufga-Bold.woff", weight: "700", style: "normal" },
  ],
});

const calisto = localFont({
  variable: "--font-calisto",
  src: [{ path: "../fonts/calisto/Calisto-MT-Italic.woff", weight: "400", style: "italic" }],
});

export const metadata: Metadata = {
  title: "Trivoxa Group | Building the Future of Global Commerce",
  description:
    "Trivoxa Group is an international business group delivering trusted products, strategic sourcing solutions, and professional services across global markets.",
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${lufga.variable} ${calisto.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        <LenisProvider>
          <CustomCursor />
          <VelocitySkewHeadings />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}

