"use client";

import { useState } from "react";
import { getBodyTypeIconUrlCandidates } from "@/lib/car-icons";

type CarIconImageProps = {
  fileName: string;
  className?: string;
  /** bottom — главный экран; center — пикер; top — hero статистики */
  align?: "bottom" | "center" | "top";
  /** progress — непрозрачный кузов для полоски прогресса кредита */
  variant?: "default" | "progress";
  imageStyle?: React.CSSProperties;
  fallback: React.ReactNode;
};

/** Иконка типа кузова — public/car-icons, затем Supabase */
export function CarIconImage({
  fileName,
  className,
  align = "bottom",
  variant = "default",
  imageStyle,
  fallback,
}: CarIconImageProps) {
  const candidates = getBodyTypeIconUrlCandidates(fileName, variant);
  const [candidateIndex, setCandidateIndex] = useState(0);

  if (candidates.length === 0 || candidateIndex >= candidates.length) {
    return <>{fallback}</>;
  }

  const objectPosition =
    align === "center" ? "object-center" : align === "top" ? "object-top" : "object-bottom";

  return (
    // eslint-disable-next-line @next/next/no-img-element -- локальные и Supabase PNG
    <img
      src={candidates[candidateIndex]}
      alt=""
      aria-hidden
      className={`object-contain ${objectPosition} ${className ?? ""}`}
      style={imageStyle}
      onError={() => {
        setCandidateIndex((current) => current + 1);
      }}
    />
  );
}
