import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/nav/BottomNav";
import { SideRail } from "@/components/nav/SideRail";
import { StoreProvider } from "@/lib/store";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Budget Tracker",
    template: "%s · Budget Tracker",
  },
  description:
    "A personal budget tracker that keeps your data in your browser.",
  applicationName: "Budget Tracker",
  appleWebApp: {
    capable: true,
    title: "Budget Tracker",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f4ef",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-dvh bg-paper text-ink antialiased">
        <StoreProvider>
          <a
            href="#main"
            className="sr-only-focusable fixed left-4 top-4 z-50 rounded-[4px] bg-accent px-4 py-3 text-sm font-medium text-white"
          >
            Skip to content
          </a>
          <div className="min-h-dvh lg:pl-[232px]">
            <SideRail />
            <main
              id="main"
              className="mx-auto w-full max-w-[900px] px-5 pb-32 pt-7 sm:px-8 lg:px-14 lg:pb-16 lg:pt-12"
            >
              {children}
            </main>
            <BottomNav />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
