import DocResizerWrapper from "@/components/DocResizerWrapper";

export const metadata = {
  title: "Document Resizer | PANTRA",
  description: "Smart Client-Side Document Resizer and PDF Converter",
};

export default function ResizerPage() {
  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <DocResizerWrapper />
    </div>
  );
}
