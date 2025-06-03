import { ScryfallAPI } from "./scryfall-api";
import { DeckCard, ScryfallCard } from "@/types/mtg";

export class DeckParser {
  static async parseDeckList(text: string): Promise<{ [blockId: string]: DeckCard[] }> {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line);
    const organizedCards: { [blockId: string]: DeckCard[] } = {
      commanders: [],
      nonlands: [],
      lands: [],
      maybeboard: []
    };
    
    let currentSection = "nonlands"; // Default section
    
    for (const line of lines) {
      // Check for section headers
      if (line.startsWith("//") || line.startsWith("#")) {
        const sectionName = line.replace(/^(\/\/|#)\s*/, "").toLowerCase().trim();
        
        if (sectionName.includes("commander")) {
          currentSection = "commanders";
        } else if (sectionName.includes("outside") || sectionName.includes("sideboard") || sectionName.includes("maybe")) {
          currentSection = "maybeboard";
        }
        continue;
      }
      
      // Parse format: "4 Lightning Bolt" or "4x Lightning Bolt"
      const match = line.match(/^(\d+)x?\s+(.+)$/);
      if (match) {
        const quantity = parseInt(match[1], 10);
        const cardName = match[2].trim();
        
        try {
          const card = await ScryfallAPI.getCardByName(cardName);
          
          // Determine which block the card should go to
          let targetBlock = currentSection;
          
          // Auto-categorize based on card type if not in a specific section
          if (currentSection === "nonlands") {
            const typeLine = card.type_line.toLowerCase();
            
            // Check if it's a double-faced card with both land and non-land types
            const hasLandType = typeLine.includes("land");
            const hasNonLandType = typeLine.includes("creature") || 
                                 typeLine.includes("artifact") || 
                                 typeLine.includes("enchantment") || 
                                 typeLine.includes("planeswalker") || 
                                 typeLine.includes("instant") || 
                                 typeLine.includes("sorcery");
            
            // If card has both land and non-land types (double-faced), keep in nonlands
            if (hasLandType && hasNonLandType) {
              targetBlock = "nonlands";
            } else if (hasLandType && !hasNonLandType) {
              // Pure land cards go to lands block
              targetBlock = "lands";
            } else {
              // All other cards stay in nonlands
              targetBlock = "nonlands";
            }
          }
          
          organizedCards[targetBlock].push({
            card,
            quantity,
            blockId: targetBlock,
          });
        } catch (error) {
          console.warn(`Could not find card: ${cardName}`);
          // Continue with other cards even if one fails
        }
      }
    }
    
    return organizedCards;
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

  // Legacy method for backward compatibility
  static async parseDeckListLegacy(text: string): Promise<DeckCard[]> {
    const organizedCards = await this.parseDeckList(text);
    return Object.values(organizedCards).flat();
  }
}
