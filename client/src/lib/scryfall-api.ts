import { ScryfallCard, AutocompleteResult, ScryfallSearchResult } from "@/types/mtg";

const SCRYFALL_API_BASE = "https://api.scryfall.com";

export class ScryfallAPI {
  private static async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${SCRYFALL_API_BASE}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  static async autocomplete(query: string): Promise<string[]> {
    if (query.length < 2) return [];
    
    try {
      const result = await this.request<AutocompleteResult>(
        `/cards/autocomplete?q=${encodeURIComponent(query)}`
      );
      return result.data;
    } catch (error) {
      console.error("Error fetching autocomplete:", error);
      return [];
    }
  }

  static async searchCards(query: string, page = 1): Promise<ScryfallSearchResult> {
    try {
      const result = await this.request<ScryfallSearchResult>(
        `/cards/search?q=${encodeURIComponent(query)}&page=${page}&order=name`
      );
      return result;
    } catch (error) {
      console.error("Error searching cards:", error);
      throw error;
    }
  }

  static async getCardByName(name: string): Promise<ScryfallCard> {
    try {
      const result = await this.request<ScryfallCard>(
        `/cards/named?exact=${encodeURIComponent(name)}`
      );
      return result;
    } catch (error) {
      console.error("Error fetching card by name:", error);
      throw error;
    }
  }

  static async getCardById(id: string): Promise<ScryfallCard> {
    try {
      const result = await this.request<ScryfallCard>(`/cards/${id}`);
      return result;
    } catch (error) {
      console.error("Error fetching card by ID:", error);
      throw error;
    }
  }

  static async getCardPrints(cardId: string): Promise<ScryfallCard[]> {
    try {
      const result = await this.request<ScryfallSearchResult>(
        `/cards/search?q=oracleid%3A${cardId}&unique=prints&order=released`
      );
      return result.data;
    } catch (error) {
      console.error("Error fetching card prints:", error);
      return [];
    }
  }

  static getCardImageUrl(card: ScryfallCard, size: 'small' | 'normal' | 'large' = 'normal'): string {
    if (card.image_uris) {
      return card.image_uris[size] || card.image_uris.normal;
    }
    
    if (card.card_faces && card.card_faces[0]?.image_uris) {
      return card.card_faces[0].image_uris[size] || card.card_faces[0].image_uris.normal;
    }
    
    return "";
  }
}
