import { PlayRoom } from "@/components/play/PlayRoom";

type PageProps = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ name?: string }>;
};

export default async function PlayRoomPage({ params, searchParams }: PageProps) {
  const { code } = await params;
  const { name = "" } = await searchParams;
  return <PlayRoom code={code} initialName={name} />;
}
