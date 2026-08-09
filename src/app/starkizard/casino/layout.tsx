import { CasinoSessionProvider } from "@/casino/session/CasinoSessionContext";

export default function CasinoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CasinoSessionProvider>{children}</CasinoSessionProvider>;
}
