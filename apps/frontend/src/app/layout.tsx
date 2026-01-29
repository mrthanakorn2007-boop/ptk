import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import schoolConfig from "@/data/school-config.json";

const ibmPlex = IBM_Plex_Sans_Thai({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    template: `%s | ${schoolConfig.name.short.en} Connext`,
    default: `${schoolConfig.name.short.en} Connext`,
  },
  description: schoolConfig.description.th,
  keywords: [
    "School Management",
    "LMS",
    "Student Portal",
    schoolConfig.name.en,
    schoolConfig.name.th,
    "ระบบเกรด",
  ],
  authors: [{ name: `${schoolConfig.name.en} Team` }],
  openGraph: {
    title: `${schoolConfig.name.short.en} Connext | ${schoolConfig.name.th}`,
    description: schoolConfig.description.th,
    siteName: schoolConfig.name.short.en,
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${schoolConfig.name.short.en} Connext | ${schoolConfig.name.th}`,
    description: schoolConfig.description.th,
    images: ["/og-preview.png"],
  },
};

import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${ibmPlex.variable} font-sans antialiased bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]`}
      >
        <Providers>
          <div className="max-w-[430px] mx-auto min-h-screen relative flex flex-col">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
