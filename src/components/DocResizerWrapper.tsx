"use client";

import dynamic from "next/dynamic";

const DocResizer = dynamic(() => import("@/components/DocResizer"), {
  ssr: false,
});

export default function DocResizerWrapper({ hasActiveTools = false, remainingTrialDays = 0 }: { hasActiveTools?: boolean, remainingTrialDays?: number }) {
  return <DocResizer hasActiveTools={hasActiveTools} remainingTrialDays={remainingTrialDays} />;
}
