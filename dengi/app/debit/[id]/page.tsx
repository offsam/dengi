import { DebitCashSettingsView } from "@/app/components/debit-cash-settings-view";

export default async function DebitAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DebitCashSettingsView accountId={id} />;
}
