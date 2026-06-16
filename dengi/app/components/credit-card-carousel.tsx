import Link from "next/link";
import { CreditCardTile } from "@/app/components/credit-card-tile";
import type { CreditCard } from "@/lib/credit-cards/types";

export function CreditCardCarousel({ cards }: { cards: CreditCard[] }) {
  return (
    <div
      className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-4 pb-1 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Кредитные карты"
    >
      {cards.map((card) => (
        <Link
          key={card.id}
          href={`/cards/${card.id}`}
          className="block shrink-0 snap-start rounded-lg transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
          aria-label={`Открыть настройки ${card.name}`}
        >
          <CreditCardTile {...card} />
        </Link>
      ))}
    </div>
  );
}
