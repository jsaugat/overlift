import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans, DM_Mono, Figtree, Play } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

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
const play = Play({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-play",
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
      className={cn(
        bebas.variable,
        dmSans.variable,
        dmMono.variable,
        "font-sans",
        figtree.variable,
        play.variable,
      )}
    >
      <body className={`${dmSans.className} font-sans`}>
        <div className="max-w-275 mx-auto px-5 pt-4 pb-16 md:pb-20 relative z-10">
          {children}
        </div>
        <Toaster theme="dark" richColors />
      </body>
    </html>
  );
}
