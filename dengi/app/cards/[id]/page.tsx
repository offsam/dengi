import { CreditCardSettingsView } from "@/app/components/credit-card-settings-view";

export default async function CreditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CreditCardSettingsView cardId={id} />;
}
