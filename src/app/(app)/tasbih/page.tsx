import { PageHeader } from "@/components/common/PageHeader";
import { Tasbih } from "@/features/spiritual/components/Tasbih";

export default function TasbihPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasbih Digital"
        description="Dekatkan diri, hitung zikirmu dengan mudah."
      />
      <Tasbih />
    </div>
  );
}
