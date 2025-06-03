import { ScryfallCard, AutocompleteResult, ScryfallSearchResult } from "@/types/mtg";

export class ScryfallAPI {
  private static async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`/api/scryfall${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  static async autocomplete(query: string): Promise<string[]> {
    if (query.length < 2) return [];
    
    try {
      const result = await this.request<AutocompleteResult>(
        `/autocomplete?q=${encodeURIComponent(query)}`
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
        `/search?q=${encodeURIComponent(query)}&page=${page}`
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
        `/card-named?name=${encodeURIComponent(name)}`
      );
      return result;
    } catch (error) {
      console.error("Error fetching card by name:", error);
      throw error;
    }
  }

  static async getCardById(id: string): Promise<ScryfallCard> {
    try {
      const result = await this.request<ScryfallCard>(`/card/${id}`);
      return result;
    } catch (error) {
      console.error("Error fetching card by ID:", error);
      throw error;
    }
  }

  static async getCardPrints(cardId: string): Promise<ScryfallCard[]> {
    try {
      const result = await this.request<ScryfallSearchResult>(`/card-prints/${cardId}`);
      return result.data || [];
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
