"use client";

import type { DashboardMetricChartSegment } from "@/lib/dashboard/metric-breakdown";
import { useLocale } from "@/app/components/locale-provider";

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function describeDonutSegment(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const sweep = endAngle - startAngle;

  if (sweep >= 359.999) {
    return null;
  }

  const startOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArc = sweep > 180 ? 1 : 0;

  return [
    `M ${startOuter.x.toFixed(3)} ${startOuter.y.toFixed(3)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endOuter.x.toFixed(3)} ${endOuter.y.toFixed(3)}`,
    `L ${startInner.x.toFixed(3)} ${startInner.y.toFixed(3)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${endInner.x.toFixed(3)} ${endInner.y.toFixed(3)}`,
    "Z",
  ].join(" ");
}

function DonutRing({ color }: { color: string }) {
  return (
    <circle
      cx="60"
      cy="60"
      r="37"
      fill="none"
      stroke={color}
      strokeWidth="18"
    />
  );
}

function DonutChart({ segments }: { segments: DashboardMetricChartSegment[] }) {
  if (segments.length === 0) {
    return (
      <svg viewBox="0 0 120 120" className="mx-auto size-40" aria-hidden>
        <circle cx="60" cy="60" r="46" className="fill-zinc-200/80" />
        <circle cx="60" cy="60" r="28" className="fill-[#FCFCFA]" />
      </svg>
    );
  }

  if (segments.length === 1) {
    return (
      <svg viewBox="0 0 120 120" className="mx-auto size-40" aria-hidden>
        <DonutRing color={segments[0].color} />
      </svg>
    );
  }

  const arcs = segments.reduce<
    Array<{ segment: DashboardMetricChartSegment; startAngle: number; endAngle: number }>
  >((acc, segment) => {
    const startAngle = acc.length === 0 ? 0 : acc[acc.length - 1].endAngle;
    const endAngle = startAngle + (segment.percent / 100) * 360;
    acc.push({ segment, startAngle, endAngle });
    return acc;
  }, []);

  return (
    <svg viewBox="0 0 120 120" className="mx-auto size-40" aria-hidden>
      {arcs.map(({ segment, startAngle, endAngle }) => {
        const sweep = endAngle - startAngle;

        if (sweep >= 359.999) {
          return <DonutRing key={segment.id} color={segment.color} />;
        }

        const path = describeDonutSegment(60, 60, 46, 28, startAngle, endAngle);

        if (!path) {
          return null;
        }

        return <path key={segment.id} d={path} fill={segment.color} />;
      })}
    </svg>
  );
}

function LegendRow({ segment }: { segment: DashboardMetricChartSegment }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: segment.color }}
        aria-hidden
      />
      <p className="min-w-0 flex-1 truncate text-sm text-zinc-700">{segment.label}</p>
      <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
        {segment.percent}%
      </p>
    </div>
  );
}

export function DashboardMetricDonutChart({
  segments,
}: {
  segments: DashboardMetricChartSegment[];
}) {
  const { t } = useLocale();

  return (
    <div className="space-y-4 px-3.5 py-4">
      <DonutChart segments={segments} />
      {segments.length > 0 ? (
        <div className="space-y-2.5" aria-label={t("common.categorySharesAria")}>
          {segments.map((segment) => (
            <LegendRow key={segment.id} segment={segment} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
