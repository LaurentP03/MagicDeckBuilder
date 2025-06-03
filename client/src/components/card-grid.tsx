import { ScryfallCard } from "@/types/mtg";
import { ScryfallAPI } from "@/lib/scryfall-api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CardGridProps {
  cards: ScryfallCard[];
  isLoading?: boolean;
  onCardClick?: (card: ScryfallCard) => void;
  className?: string;
}

export function CardGrid({ cards, isLoading, onCardClick, className }: CardGridProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-2">
            <Skeleton className="w-full aspect-[5/7] rounded-md mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-3 w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-muted-foreground text-lg">No cards found</p>
        <p className="text-muted-foreground text-sm mt-2">Try adjusting your search terms</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 ${className}`}>
      {cards.map((card) => (
        <Card
          key={card.id}
          className="card-hover cursor-pointer p-2 border-border hover:border-primary transition-all duration-200"
          onClick={() => onCardClick?.(card)}
        >
          <div className="aspect-[5/7] mb-2 overflow-hidden rounded-md">
            <img
              src={ScryfallAPI.getCardImageUrl(card, 'normal')}
              alt={card.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <h3 className="text-sm font-medium text-center line-clamp-2">{card.name}</h3>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {card.mana_cost || "—"}
          </p>
        </Card>
      ))}
    </div>
  );
}
