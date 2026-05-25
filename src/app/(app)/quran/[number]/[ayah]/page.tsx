import AyahDetailPage from "./_page-client";

export function generateStaticParams() {
  return Array.from({ length: 7 }, (_, i) => ({
    number: "1",
    ayah: String(i + 1),
  }));
}

export default function Page() {
  return <AyahDetailPage />;
}
