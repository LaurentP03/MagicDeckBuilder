import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  BarChart3,
  FileText,
  AlertTriangle 
} from "lucide-react";
import { DeckStorage } from "@/lib/deck-storage";
import { MTGDeck } from "@/types/mtg";
import { ScryfallAPI } from "@/lib/scryfall-api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function DeckManagerPage() {
  const [decks, setDecks] = useState<MTGDeck[]>(() => DeckStorage.getAllDecks());
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleDeleteDeck = (deckId: string) => {
    if (confirm("Are you sure you want to delete this deck?")) {
      try {
        DeckStorage.deleteDeck(deckId);
        setDecks(DeckStorage.getAllDecks());
        toast({
          title: "Deck deleted",
          description: "The deck has been removed from your collection.",
        });
      } catch (error) {
        toast({
          title: "Error deleting deck",
          description: "Failed to delete the deck. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditDeck = (deckId: string) => {
    setLocation(`/deck-builder?edit=${deckId}`);
  };

  const handleCreateNewDeck = () => {
    setLocation("/deck-builder");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPreviewCards = (deck: MTGDeck) => {
    const allCards = deck.blocks.flatMap(block => block.cards);
    return allCards.slice(0, 4);
  };

  if (decks.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-4">No decks yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          You haven't created any decks yet. Start building your first deck to see it here.
        </p>
        <Button onClick={handleCreateNewDeck} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Create Your First Deck
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Saved Decks</h1>
          <p className="text-muted-foreground">
            Manage and organize your Magic: The Gathering deck collection
          </p>
        </div>
        <Button onClick={handleCreateNewDeck} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Create New Deck
        </Button>
      </div>

      {/* Deck Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => {
          const previewCards = getPreviewCards(deck);
          const remainingCards = deck.totalCards - previewCards.length;

          return (
            <Card 
              key={deck.id} 
              className="hover:border-primary transition-colors cursor-pointer group"
              onClick={() => handleEditDeck(deck.id!)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {deck.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Modified {formatDate(deck.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDeck(deck.id!);
                      }}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDeck(deck.id!);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Card Preview Grid */}
                <div className="grid grid-cols-8 gap-1">
                  {previewCards.map((deckCard, index) => (
                    <div key={index} className="aspect-[5/7] overflow-hidden rounded border">
                      <img
                        src={ScryfallAPI.getCardImageUrl(deckCard.card, 'small')}
                        alt={deckCard.card.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {remainingCards > 0 && (
                    <div className="aspect-[5/7] bg-muted rounded border flex items-center justify-center">
                      <span className="text-xs font-medium">+{remainingCards}</span>
                    </div>
                  )}
                </div>

                {/* Deck Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span>{deck.totalCards} cards</span>
                  </div>
                  {deck.format && (
                    <Badge variant="outline">{deck.format}</Badge>
                  )}
                </div>

                {/* Description */}
                {deck.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {deck.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Create New Deck Card */}
        <Card 
          className="border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer group min-h-48 flex flex-col items-center justify-center"
          onClick={handleCreateNewDeck}
        >
          <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            Create New Deck
          </h3>
          <p className="text-muted-foreground text-center text-sm">
            Start building your next deck
          </p>
        </Card>
      </div>
    </div>
  );
}
