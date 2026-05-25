import WiridKategoriPage from "./_page-client";

export function generateStaticParams() {
  return [
    { slug: "doa-harian" },
    { slug: "dzikir-pagi" },
    { slug: "dzikir-petang" },
    { slug: "dzikir-setelah-shalat" },
    { slug: "doa-pilihan" },
  ];
}

export default function Page() {
  return <WiridKategoriPage />;
}
