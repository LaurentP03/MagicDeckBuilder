import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, X } from "lucide-react";
import { ScryfallCard } from "@/types/mtg";
import { ScryfallAPI } from "@/lib/scryfall-api";
import { useQuery } from "@tanstack/react-query";

interface CardModalProps {
  card: ScryfallCard | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToDeck?: (card: ScryfallCard) => void;
  onRemoveFromDeck?: (card: ScryfallCard) => void;
  showDeckActions?: boolean;
}

export function CardModal({ 
  card, 
  isOpen, 
  onClose, 
  onAddToDeck, 
  onRemoveFromDeck,
  showDeckActions = true 
}: CardModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<ScryfallCard | null>(null);

  // Fetch other versions/prints of this card
  const { data: cardPrints = [], isLoading: isLoadingPrints } = useQuery({
    queryKey: ["/api/card-prints", card?.id],
    queryFn: () => card ? ScryfallAPI.getCardPrints(card.id) : [],
    enabled: !!card && isOpen,
  });

  const displayCard = selectedVersion || card;

  if (!displayCard) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{displayCard.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Image */}
          <div className="space-y-4">
            <div className="aspect-[5/7] overflow-hidden rounded-lg border">
              <img
                src={ScryfallAPI.getCardImageUrl(displayCard, 'large')}
                alt={displayCard.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Other Versions */}
            {cardPrints.length > 1 && (
              <div>
                <h4 className="font-semibold mb-2">Other Versions</h4>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {isLoadingPrints ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="w-16 h-24 flex-shrink-0 rounded" />
                    ))
                  ) : (
                    cardPrints.map((print) => (
                      <div
                        key={print.id}
                        className={`w-16 h-24 flex-shrink-0 rounded cursor-pointer border-2 transition-colors overflow-hidden ${
                          selectedVersion?.id === print.id || (!selectedVersion && print.id === card?.id)
                            ? "border-primary"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        onClick={() => setSelectedVersion(print)}
                      >
                        <img
                          src={ScryfallAPI.getCardImageUrl(print, 'small')}
                          alt={`${print.name} - ${print.set_name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card Details */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-muted-foreground">Mana Cost</h4>
                <p className="text-lg">{displayCard.mana_cost || "—"}</p>
              </div>

              <div>
                <h4 className="font-semibold text-muted-foreground">Type</h4>
                <p>{displayCard.type_line}</p>
              </div>

              {displayCard.oracle_text && (
                <div>
                  <h4 className="font-semibold text-muted-foreground">Card Text</h4>
                  <p className="whitespace-pre-line">{displayCard.oracle_text}</p>
                </div>
              )}

              {(displayCard.power || displayCard.toughness) && (
                <div>
                  <h4 className="font-semibold text-muted-foreground">Power / Toughness</h4>
                  <p>{displayCard.power} / {displayCard.toughness}</p>
                </div>
              )}

              <div className="flex gap-2">
                <div>
                  <h4 className="font-semibold text-muted-foreground">Set</h4>
                  <p>{displayCard.set_name}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground">Rarity</h4>
                  <Badge variant="outline" className="capitalize">
                    {displayCard.rarity}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {showDeckActions && (
              <div className="space-y-2 pt-4">
                <Button
                  onClick={() => onAddToDeck?.(displayCard)}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Deck
                </Button>
                
                {onRemoveFromDeck && (
                  <Button
                    onClick={() => onRemoveFromDeck(displayCard)}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove from Deck
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
