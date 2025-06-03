export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  colors?: string[];
  color_identity?: string[];
  set: string;
  set_name: string;
  rarity: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: Array<{
    name: string;
    mana_cost?: string;
    type_line: string;
    oracle_text?: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
      png: string;
      art_crop: string;
      border_crop: string;
    };
  }>;
  prints_search_uri?: string;
  related_uris?: {
    edhrec: string;
    mtgtop8: string;
    tcgplayer: string;
  };
}

export interface DeckCard {
  card: ScryfallCard;
  quantity: number;
  blockId?: string;
}

export interface DeckBlock {
  id: string;
  name: string;
  color: string;
  cards: DeckCard[];
}

export interface MTGDeck {
  id?: string;
  name: string;
  description?: string;
  blocks: DeckBlock[];
  format?: string;
  totalCards: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeckStats {
  totalCards: number;
  creatures: number;
  spells: number;
  lands: number;
  artifacts: number;
  planeswalkers: number;
  enchantments: number;
}

export interface AutocompleteResult {
  object: string;
  total_values: number;
  data: string[];
}

export interface ScryfallSearchResult {
  object: string;
  total_cards: number;
  has_more: boolean;
  next_page?: string;
  data: ScryfallCard[];
}
