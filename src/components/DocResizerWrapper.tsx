"use client";

import dynamic from "next/dynamic";

const DocResizer = dynamic(() => import("@/components/DocResizer"), {
  ssr: false,
});

export default function DocResizerWrapper() {
  return <DocResizer />;
}
