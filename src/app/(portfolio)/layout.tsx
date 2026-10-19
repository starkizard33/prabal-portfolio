import type { Metadata } from "next";
import { IBM_Plex_Mono, Outfit, Syne } from "next/font/google";
import { EasterEggs } from "@/components/EasterEggs";
import { ScopedScrollAnimations } from "@/components/motion/ScopedScrollAnimations";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    "SDE II at Zeta. Java, Spring Boot, microservices, Kafka, AWS — payments clearing and systems at scale.",
  metadataBase: new URL("https://starkizard.com"),
  openGraph: {
    title: "Prabal Kalia · SDE II at Zeta",
    description:
      "Clearing systems, matching logic, and rule engines. Builder and starkizard off-duty.",
    type: "website",
    url: "https://starkizard.com",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* egg: Stark + Charizard. Console has the dad-joke map. */}
        {children}
        <ScopedScrollAnimations />
        <EasterEggs />
      </body>
    </html>
  );
}
