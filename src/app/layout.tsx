import type { Metadata } from "next";
import { Kumbh_Sans } from "next/font/google";
import { AppHeader } from "@/components/layout/AppHeader";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const kumbhSans = Kumbh_Sans({
  variable: "--font-kumbh-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebWatcher",
  description: "Surveillance de disponibilité de sites web",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${kumbhSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-950 font-sans text-zinc-100">
        <AppHeader />
        {children}
        <Footer />
      </body>
    </html>
  );
}
