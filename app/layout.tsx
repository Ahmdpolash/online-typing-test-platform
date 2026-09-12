import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { AppChrome } from "@/components/layout/app-chrome";
import { SettingsProvider } from "@/components/settings/settings-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Typester — Minimalist Typing Test with Mechanical Keyboard Sounds | WPM & Accuracy",
    template: "%s | Typester",
  },
  description: siteConfig.description,
  keywords: [
    "typing test",
    "free typing test",
    "typing speed test",
    "online typing test",
    "wpm test",
    "words per minute test",
    "typing practice",
    "typing trainer",
    "typing speed",
    "keyboard test",
    "mechanical keyboard sounds",
    "monkeytype clone",
    "Typester",
  ],
  creator: siteConfig.creator,
  metadataBase: new URL(siteConfig.url),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "Typester — Minimalist Typing Test with Mechanical Keyboard Sounds",
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Typester — Typing Test with Mechanical Keyboard Sounds",
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        spaceGrotesk.variable
      )}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/* Preload sound sprite */}
        <link
          as="fetch"
          crossOrigin="anonymous"
          href="/sounds/sound.ogg"
          rel="preload"
        />
        {/* Blocking script: apply saved accent before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var a=localStorage.getItem("tb-accent")||"carbon";document.documentElement.setAttribute("data-accent",a)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <SettingsProvider>
            <AppChrome>{children}</AppChrome>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
