import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans, DM_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Overlift",
  description: "Lean bulk workout tracker",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(bebas.variable, dmSans.variable, dmMono.variable, "font-sans", figtree.variable)}
    >
      <body className={`${dmSans.className} font-sans`}>
        <div className="max-w-[1100px] mx-auto px-5 pt-4 pb-20 relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
