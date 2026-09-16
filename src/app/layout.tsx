import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Fraunces } from "next/font/google";
import { headers } from "next/headers";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["SOFT", "WONK"],
  variable: "--font-display",
});

const sans = Be_Vietnam_Pro({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efeae0" },
    { media: "(prefers-color-scheme: dark)", color: "#1b242c" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware gắn header này cho mọi request (xem src/middleware.ts) —
  // dùng để ẩn header/footer marketing ở khu vực /quan-tri mà không cần
  // tách route group hay biến header/footer thành client component.
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/quan-tri");

  return (
    <html lang="vi" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh">
        {isAdmin ? (
          children
        ) : (
          <>
            <a
              href="#noi-dung"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
            >
              Sang nội dung chính
            </a>
            <SiteHeader />
            <main id="noi-dung">{children}</main>
            <SiteFooter />
          </>
        )}
      </body>
    </html>
  );
}
