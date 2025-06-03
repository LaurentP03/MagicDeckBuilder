import { ScryfallAPI } from "./scryfall-api";
import { DeckCard, ScryfallCard } from "@/types/mtg";

export class DeckParser {
  static async parseDeckList(text: string): Promise<DeckCard[]> {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line);
    const deckCards: DeckCard[] = [];
    
    for (const line of lines) {
      // Skip comments
      if (line.startsWith("//") || line.startsWith("#")) {
        continue;
      }
      
      // Parse format: "4 Lightning Bolt" or "4x Lightning Bolt"
      const match = line.match(/^(\d+)x?\s+(.+)$/);
      if (match) {
        const quantity = parseInt(match[1], 10);
        const cardName = match[2].trim();
        
        try {
          const card = await ScryfallAPI.getCardByName(cardName);
          deckCards.push({
            card,
            quantity,
          });
        } catch (error) {
          console.warn(`Could not find card: ${cardName}`);
          // Continue with other cards even if one fails
        }
      }
    }
    
    return deckCards;
  }

  static validateDeckFormat(text: string): { isValid: boolean; errors: string[] } {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line);
    const errors: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip comments
      if (line.startsWith("//") || line.startsWith("#")) {
        continue;
      }
      
      // Check format
      const match = line.match(/^(\d+)x?\s+(.+)$/);
      if (!match) {
        errors.push(`Line ${i + 1}: Invalid format. Expected "quantity cardname" (e.g., "4 Lightning Bolt")`);
      } else {
        const quantity = parseInt(match[1], 10);
        if (quantity <= 0 || quantity > 99) {
          errors.push(`Line ${i + 1}: Invalid quantity. Must be between 1 and 99.`);
        }
        
        const cardName = match[2].trim();
        if (!cardName) {
          errors.push(`Line ${i + 1}: Missing card name.`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static generateDeckStats(deckCards: DeckCard[]) {
    const stats = {
      totalCards: 0,
      creatures: 0,
      spells: 0,
      lands: 0,
      artifacts: 0,
      planeswalkers: 0,
      enchantments: 0,
    };

    deckCards.forEach(deckCard => {
      const { card, quantity } = deckCard;
      stats.totalCards += quantity;

      const typeLine = card.type_line.toLowerCase();
      
      if (typeLine.includes("creature")) {
        stats.creatures += quantity;
      } else if (typeLine.includes("land")) {
        stats.lands += quantity;
      } else if (typeLine.includes("artifact")) {
        stats.artifacts += quantity;
      } else if (typeLine.includes("planeswalker")) {
        stats.planeswalkers += quantity;
      } else if (typeLine.includes("enchantment")) {
        stats.enchantments += quantity;
      } else {
        stats.spells += quantity;
      }
    });

    return stats;
  }
}
