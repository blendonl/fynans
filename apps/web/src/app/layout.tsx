import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/providers/toast-provider";
import "./globals.css";

export const viewport: Viewport = {
  viewportFit: "cover",
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6200EE" },
    { media: "(prefers-color-scheme: dark)", color: "#BB86FC" },
  ],
};

export const metadata: Metadata = {
  title: "Fynans",
  description: "Personal finance management",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
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
