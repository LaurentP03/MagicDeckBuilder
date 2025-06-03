import { MTGDeck, DeckBlock } from "@/types/mtg";

const STORAGE_KEY = "mtg_decks";

export class DeckStorage {
  static getAllDecks(): MTGDeck[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading decks from storage:", error);
      return [];
    }
  }

  static getDeck(id: string): MTGDeck | null {
    const decks = this.getAllDecks();
    return decks.find(deck => deck.id === id) || null;
  }

  static saveDeck(deck: MTGDeck): void {
    try {
      const decks = this.getAllDecks();
      const now = new Date().toISOString();
      
      if (deck.id) {
        // Update existing deck
        const index = decks.findIndex(d => d.id === deck.id);
        if (index !== -1) {
          decks[index] = { ...deck, updatedAt: now };
        }
      } else {
        // Create new deck
        const newDeck: MTGDeck = {
          ...deck,
          id: this.generateId(),
          createdAt: now,
          updatedAt: now,
        };
        decks.push(newDeck);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    } catch (error) {
      console.error("Error saving deck:", error);
      throw new Error("Failed to save deck to local storage");
    }
  }

  static deleteDeck(id: string): void {
    try {
      const decks = this.getAllDecks();
      const filteredDecks = decks.filter(deck => deck.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDecks));
    } catch (error) {
      console.error("Error deleting deck:", error);
      throw new Error("Failed to delete deck");
    }
  }

  static exportDeck(deck: MTGDeck): string {
    let content = `// ${deck.name}\n`;
    if (deck.description) {
      content += `// ${deck.description}\n`;
    }
    content += "\n";

    deck.blocks.forEach(block => {
      if (block.cards.length > 0) {
        content += `// ${block.name}\n`;
        block.cards.forEach(deckCard => {
          content += `${deckCard.quantity} ${deckCard.card.name}\n`;
        });
        content += "\n";
      }
    });

    return content;
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
