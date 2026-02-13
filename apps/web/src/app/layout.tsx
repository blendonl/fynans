import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/providers/toast-provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  viewportFit: "cover",
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F8F6" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1114" },
  ],
};

export const metadata: Metadata = {
  title: "Fynans",
  description: "Personal finance management",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fynans",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakartaSans.variable} ${GeistMono.variable}`}>
      <head />
      <body>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <ToastProvider />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <Script id="sw-register" strategy="afterInteractive">
          {`if("serviceWorker"in navigator){navigator.serviceWorker.register("/sw.js")}`}
        </Script>
      </body>
    </html>
  );
}
