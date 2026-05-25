import WiridDetailPage from "./_page-client";

export const dynamic = "force-static";

export function generateStaticParams() {
  // Placeholder shell; actual IDs are dynamic and loaded client-side.
  return [{ slug: "_", id: "_" }];
}

export default function Page() {
  return <WiridDetailPage />;
}
