import { DashboardMetricBreakdownView } from "@/app/components/dashboard-metric-breakdown-view";

export default async function DashboardMetricPage({
  params,
}: {
  params: Promise<{ metric: string }>;
}) {
  const { metric } = await params;
  return <DashboardMetricBreakdownView metricSlug={metric} />;
}
