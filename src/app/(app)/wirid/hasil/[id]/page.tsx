import WiridHasilDetailPage from "./_page-client";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function Page() {
  return <WiridHasilDetailPage />;
}
