import { useState, useCallback, useMemo } from "react";
import { MTGDeck, DeckBlock, DeckCard, ScryfallCard } from "@/types/mtg";
import { DeckStorage } from "@/lib/deck-storage";
import { DeckParser } from "@/lib/deck-parser";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#6b7280", // gray
];

export function useDeckBuilder(initialDeck?: MTGDeck) {
  const { toast } = useToast();
  const [deck, setDeck] = useState<MTGDeck>(() => 
    initialDeck || {
      name: "",
      description: "",
      blocks: [
        {
          id: "commanders",
          name: "Commanders",
          color: DEFAULT_COLORS[0],
          cards: [],
        },
        {
          id: "nonlands",
          name: "Nonlands",
          color: DEFAULT_COLORS[1],
          cards: [],
        },
        {
          id: "lands",
          name: "Lands",
          color: DEFAULT_COLORS[2],
          cards: [],
        },
        {
          id: "maybeboard",
          name: "Maybeboard",
          color: DEFAULT_COLORS[3],
          cards: [],
        },
      ],
      format: "Commander",
      totalCards: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const deckStats = useMemo(() => {
    const allCards = deck.blocks.flatMap(block => block.cards);
    return DeckParser.generateDeckStats(allCards);
  }, [deck.blocks]);

  const addBlock = useCallback(() => {
    const newBlock: DeckBlock = {
      id: `block-${Date.now()}`,
      name: "New Block",
      color: DEFAULT_COLORS[deck.blocks.length % DEFAULT_COLORS.length],
      cards: [],
    };

    setDeck(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      updatedAt: new Date().toISOString(),
    }));
  }, [deck.blocks.length]);

  const updateBlock = useCallback((blockId: string, updates: Partial<DeckBlock>) => {
    setDeck(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setDeck(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addCardToBlock = useCallback((card: ScryfallCard, blockId: string, quantity = 1) => {
    setDeck(prev => {
      const newBlocks = prev.blocks.map(block => {
        if (block.id !== blockId) return block;

        const existingCardIndex = block.cards.findIndex(deckCard => 
          deckCard.card.id === card.id
        );

        if (existingCardIndex !== -1) {
          // Update existing card quantity
          const newCards = [...block.cards];
          newCards[existingCardIndex] = {
            ...newCards[existingCardIndex],
            quantity: newCards[existingCardIndex].quantity + quantity,
          };
          return { ...block, cards: newCards };
        } else {
          // Add new card
          return {
            ...block,
            cards: [...block.cards, { card, quantity, blockId }],
          };
        }
      });

      return {
        ...prev,
        blocks: newBlocks,
        totalCards: deckStats.totalCards + quantity,
        updatedAt: new Date().toISOString(),
      };
    });

    toast({
      title: "Card added to deck",
      description: `${quantity}x ${card.name} added to ${deck.blocks.find(b => b.id === blockId)?.name}`,
    });
  }, [deckStats.totalCards, deck.blocks, toast]);

  const removeCardFromBlock = useCallback((cardId: string, blockId: string, quantity?: number) => {
    setDeck(prev => {
      const newBlocks = prev.blocks.map(block => {
        if (block.id !== blockId) return block;

        const existingCardIndex = block.cards.findIndex(deckCard => 
          deckCard.card.id === cardId
        );

        if (existingCardIndex === -1) return block;

        const existingCard = block.cards[existingCardIndex];
        const newCards = [...block.cards];

        if (quantity && existingCard.quantity > quantity) {
          // Reduce quantity
          newCards[existingCardIndex] = {
            ...existingCard,
            quantity: existingCard.quantity - quantity,
          };
        } else {
          // Remove card completely
          newCards.splice(existingCardIndex, 1);
        }

        return { ...block, cards: newCards };
      });

      return {
        ...prev,
        blocks: newBlocks,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const moveCard = useCallback((cardId: string, fromBlockId: string, toBlockId: string) => {
    const fromBlock = deck.blocks.find(b => b.id === fromBlockId);
    const card = fromBlock?.cards.find(c => c.card.id === cardId);
    
    if (!card) return;

    removeCardFromBlock(cardId, fromBlockId);
    addCardToBlock(card.card, toBlockId, card.quantity);
  }, [deck.blocks, addCardToBlock, removeCardFromBlock]);

  const saveDeck = useCallback(() => {
    try {
      DeckStorage.saveDeck(deck);
      toast({
        title: "Deck saved",
        description: `${deck.name} has been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error saving deck",
        description: "Failed to save deck to local storage.",
        variant: "destructive",
      });
    }
  }, [deck, toast]);

  const exportDeck = useCallback(() => {
    const content = DeckStorage.exportDeck(deck);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deck.name || "deck"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Deck exported",
      description: "Deck file downloaded successfully.",
    });
  }, [deck, toast]);

  const importDeck = useCallback(async (text: string) => {
    try {
      const validation = DeckParser.validateDeckFormat(text);
      if (!validation.isValid) {
        toast({
          title: "Invalid deck format",
          description: validation.errors.join("\n"),
          variant: "destructive",
        });
        return;
      }

      const organizedCards = await DeckParser.parseDeckList(text);
      
      // Check if any cards were found
      const allCardArrays = Object.values(organizedCards);
      const totalCardTypes = allCardArrays.reduce((sum, blockCards) => sum + blockCards.length, 0);
      if (totalCardTypes === 0) {
        toast({
          title: "No cards found",
          description: "No valid cards were found in the imported text.",
          variant: "destructive",
        });
        return;
      }

      // Calculate total cards
      const totalCards = allCardArrays
        .flat()
        .reduce((sum, card) => sum + card.quantity, 0);
      
      // Update blocks with organized cards
      setDeck(prev => {
        const newBlocks = prev.blocks.map(block => {
          const blockCards = organizedCards[block.id] || [];
          return {
            ...block,
            cards: blockCards.map(card => ({ ...card, blockId: block.id }))
          };
        });

        return {
          ...prev,
          blocks: newBlocks,
          totalCards,
          updatedAt: new Date().toISOString(),
        };
      });

      toast({
        title: "Deck imported",
        description: `Successfully imported ${totalCardTypes} different cards (${totalCards} total).`,
      });
    } catch (error) {
      console.error("Import deck error:", error);
      toast({
        title: "Import failed",
        description: "Failed to import deck. Please check the format and try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    deck,
    setDeck,
    deckStats,
    addBlock,
    updateBlock,
    deleteBlock,
    addCardToBlock,
    removeCardFromBlock,
    moveCard,
    saveDeck,
    exportDeck,
    importDeck,
  };
}
