import { AutoVehicleSettingsView } from "@/app/components/auto-vehicle-settings-view";

type AutoDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AutoDetailPage({ params }: AutoDetailPageProps) {
  const { id } = await params;
  return <AutoVehicleSettingsView vehicleId={id} />;
}
