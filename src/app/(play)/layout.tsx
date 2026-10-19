import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getPartyHost } from "@/lib/play/partyHost";
import "./play/play.css";

// Variable Inter — one file, no multi-weight download.
const playFont = Inter({
  subsets: ["latin"],
  variable: "--font-play",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Play",
    template: "%s · Play Starkizard",
  },
  description: "Party games with friends — room codes, no accounts required.",
  metadataBase: new URL("https://play.starkizard.com"),
};

export default function PlayRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const partyHost = getPartyHost();
  const partyOrigin =
    partyHost.startsWith("localhost") || partyHost.startsWith("127.")
      ? null
      : `https://${partyHost}`;

  return (
    <html lang="en" className={`${playFont.variable} h-full antialiased`}>
      {partyOrigin ? (
        <head>
          <link rel="dns-prefetch" href={partyOrigin} />
          <link rel="preconnect" href={partyOrigin} crossOrigin="" />
        </head>
      ) : null}
      <body className="min-h-full">{children}</body>
    </html>
  );
}
