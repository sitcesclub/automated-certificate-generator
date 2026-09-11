import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "CES Automated Certificate Generator | Offline PWA",
  description:
    "Offline-first automated bulk certificate generator for Computer Engineers' Society. Design templates, import spreadsheet data, and generate high-resolution certificates directly in your browser.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CES CertGen",
  },
};

export const viewport: Viewport = {
  themeColor: "#090a0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Dancing+Script:wght@500;700&family=Great+Vibes&family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Montserrat:wght@300;400;500;600;700;800;900&family=Open+Sans:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#090a0d] text-[#f1f3f7] selection:bg-blue-600 selection:text-white font-sans" suppressHydrationWarning>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
