"use client";

import { useState } from "react";
import { getBodyTypeIconUrlCandidates } from "@/lib/car-icons";

type CarIconImageProps = {
  fileName: string;
  className?: string;
  fallback: React.ReactNode;
};

/** Иконка типа кузова — public/car-icons, затем Supabase */
export function CarIconImage({ fileName, className, fallback }: CarIconImageProps) {
  const candidates = getBodyTypeIconUrlCandidates(fileName);
  const [candidateIndex, setCandidateIndex] = useState(0);

  if (candidates.length === 0 || candidateIndex >= candidates.length) {
    return <>{fallback}</>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- локальные и Supabase PNG
    <img
      src={candidates[candidateIndex]}
      alt=""
      aria-hidden
      className={`object-contain object-bottom ${className ?? ""}`}
      onError={() => {
        setCandidateIndex((current) => current + 1);
      }}
    />
  );
}
