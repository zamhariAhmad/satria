import BillDetailPage from "./_page-client";

export function generateStaticParams() {
  // Placeholder shell; actual IDs are user-specific and loaded client-side.
  return [{ id: "_" }];
}

export default function Page() {
  return <BillDetailPage />;
}
