import CategoryDetailPage from "./_page-client";

export function generateStaticParams() {
  return [
    "syahriah", "psb", "hbh", "heregistrasi", "tunggakan_bebas",
    "re_registration", "meal", "event", "infaq",
  ].map((type) => ({ type }));
}

export default function Page() {
  return <CategoryDetailPage />;
}
