import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, AlertCircle } from "lucide-react";
import { CardGrid } from "@/components/card-grid";
import { CardModal } from "@/components/card-modal";
import { useCardSearch } from "@/hooks/use-card-search";

export default function SearchPage() {
  const {
    searchQuery,
    setSearchQuery,
    cards,
    isLoadingSearch,
    searchError,
    selectedCard,
    setSelectedCard,
  } = useCardSearch();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Search Magic Cards</h1>
        <p className="text-muted-foreground text-lg">
          Discover and explore Magic: The Gathering cards from Scryfall
        </p>
      </div>

      {/* Search Input */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for cards (e.g., Lightning Bolt, Counterspell)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg h-12"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div>
        {searchError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to search cards. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        )}

        {searchQuery.length >= 2 ? (
          <CardGrid
            cards={cards}
            isLoading={isLoadingSearch}
            onCardClick={setSelectedCard}
          />
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground mb-2">
              Start typing to search for cards
            </p>
            <p className="text-muted-foreground">
              Enter at least 2 characters to begin searching
            </p>
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      <CardModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        showDeckActions={false}
      />
    </div>
  );
}
