import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Search, 
  Upload, 
  Download, 
  Save,
  BarChart3 
} from "lucide-react";
import { CardSearch } from "@/components/card-search";
import { DeckBlock } from "@/components/deck-block";
import { CardModal } from "@/components/card-modal";
import { FileUploadModal } from "@/components/file-upload-modal";
import { useDeckBuilder } from "@/hooks/use-deck-builder";
import { ScryfallCard, DeckCard } from "@/types/mtg";

export default function DeckBuilderPage() {
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [draggedCard, setDraggedCard] = useState<DeckCard | null>(null);

  const {
    deck,
    setDeck,
    deckStats,
    addBlock,
    updateBlock,
    deleteBlock,
    addCardToBlock,
    removeCardFromBlock,
    saveDeck,
    exportDeck,
    importDeck,
  } = useDeckBuilder();

  const handleCardSelect = (card: ScryfallCard) => {
    // Add to first available block by default
    if (deck.blocks.length > 0) {
      addCardToBlock(card, deck.blocks[0].id);
    }
  };

  const handleAddToDeck = (card: ScryfallCard) => {
    // Show block selection or add to first block
    if (deck.blocks.length > 0) {
      addCardToBlock(card, deck.blocks[0].id);
    }
    setSelectedCard(null);
  };

  const handleRemoveFromDeck = (card: ScryfallCard) => {
    // Find and remove card from any block
    for (const block of deck.blocks) {
      const deckCard = block.cards.find(c => c.card.id === card.id);
      if (deckCard) {
        removeCardFromBlock(card.id, block.id);
        break;
      }
    }
    setSelectedCard(null);
  };

  const handleDragStart = (e: React.DragEvent, card: DeckCard) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    if (draggedCard) {
      // Remove from source block and add to target block
      const sourceBlockId = draggedCard.blockId || 
        deck.blocks.find(b => b.cards.some(c => c.card.id === draggedCard.card.id))?.id;
      
      if (sourceBlockId && sourceBlockId !== blockId) {
        removeCardFromBlock(draggedCard.card.id, sourceBlockId);
        addCardToBlock(draggedCard.card, blockId, draggedCard.quantity);
      }
      setDraggedCard(null);
    }
  };

  const handleSaveDeck = () => {
    if (!deck.name.trim()) {
      return;
    }
    saveDeck();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Panel - Tools & Stats */}
      <div className="lg:col-span-1 space-y-6">
        {/* Quick Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Quick Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardSearch
              onCardSelect={handleCardSelect}
              placeholder="Add cards to deck..."
            />
            
            <Separator />
            
            {/* Import/Export */}
            <div className="space-y-2">
              <Button
                onClick={() => setShowUploadModal(true)}
                variant="outline"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import .txt
              </Button>
              <Button
                onClick={exportDeck}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Deck
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deck Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Deck Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Cards:</span>
                <Badge variant="secondary">{deckStats.totalCards}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Creatures:</span>
                <Badge variant="outline">{deckStats.creatures}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Spells:</span>
                <Badge variant="outline">{deckStats.spells}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Lands:</span>
                <Badge variant="outline">{deckStats.lands}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Artifacts:</span>
                <Badge variant="outline">{deckStats.artifacts}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Planeswalkers:</span>
                <Badge variant="outline">{deckStats.planeswalkers}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Deck Builder */}
      <div className="lg:col-span-3 space-y-6">
        {/* Deck Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Deck Builder</h2>
              <Button onClick={addBlock} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Block
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Deck Name
                </label>
                <Input
                  value={deck.name}
                  onChange={(e) => setDeck(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter deck name..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Format
                </label>
                <Input
                  value={deck.format || ""}
                  onChange={(e) => setDeck(prev => ({ ...prev, format: e.target.value }))}
                  placeholder="e.g., Standard, Modern, Commander"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">
                Description (Optional)
              </label>
              <Textarea
                value={deck.description || ""}
                onChange={(e) => setDeck(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your deck strategy..."
                rows={2}
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleSaveDeck}
                disabled={!deck.name.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Deck
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deck Blocks */}
        <div className="space-y-4">
          {deck.blocks.map((block) => (
            <DeckBlock
              key={block.id}
              block={block}
              onUpdateBlock={updateBlock}
              onDeleteBlock={deleteBlock}
              onRemoveCard={removeCardFromBlock}
              onCardClick={setSelectedCard}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* Empty State */}
        {deck.blocks.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Plus className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground mb-2">
                No blocks yet
              </p>
              <p className="text-muted-foreground mb-4">
                Add your first block to start building your deck
              </p>
              <Button onClick={addBlock}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Block
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Card Detail Modal */}
      <CardModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onAddToDeck={handleAddToDeck}
        onRemoveFromDeck={handleRemoveFromDeck}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImport={importDeck}
      />
    </div>
  );
}
