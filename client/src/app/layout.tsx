import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LocationProvider } from "@/contexts/LocationContext";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The League - Sports & Gaming Platform",
  description: "Connect with athletes, join recreational leagues, and compete in online games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        <AuthProvider>
          <LocationProvider>
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
