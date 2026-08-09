import type { Metadata } from "next";
import { IBM_Plex_Mono, Outfit, Syne } from "next/font/google";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Prabal Kalia",
    template: "%s · Prabal Kalia",
  },
  description:
    "SDE II at Zeta. Payments clearing, systems at scale, and competitive programming — also known as starkizard.",
  metadataBase: new URL("https://prabal-kalia.local"),
  openGraph: {
    title: "Prabal Kalia",
    description:
      "Software engineer at Zeta. Builder, CP enthusiast, starkizard off-duty.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
