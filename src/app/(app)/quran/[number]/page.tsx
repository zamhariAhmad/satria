import SurahPage from "./_page-client";

export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ number: String(i + 1) }));
}

export default function Page() {
  return <SurahPage />;
}
