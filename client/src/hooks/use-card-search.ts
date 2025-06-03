import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScryfallAPI } from "@/lib/scryfall-api";
import { ScryfallCard } from "@/types/mtg";

export function useCardSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [autocompleteQuery, setAutocompleteQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce autocomplete query
  useEffect(() => {
    const timer = setTimeout(() => {
      setAutocompleteQuery(searchQuery);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Autocomplete suggestions
  const {
    data: suggestions = [],
    isLoading: isLoadingSuggestions,
  } = useQuery({
    queryKey: ["/api/autocomplete", autocompleteQuery],
    queryFn: () => ScryfallAPI.autocomplete(autocompleteQuery),
    enabled: autocompleteQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Search results
  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    error: searchError,
  } = useQuery({
    queryKey: ["/api/search", debouncedSearchQuery],
    queryFn: () => ScryfallAPI.searchCards(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Card prints for selected card
  const {
    data: cardPrints = [],
    isLoading: isLoadingPrints,
  } = useQuery({
    queryKey: ["/api/card-prints", selectedCard?.id],
    queryFn: () => selectedCard ? ScryfallAPI.getCardPrints(selectedCard.id) : [],
    enabled: !!selectedCard,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const cards = useMemo(() => {
    return searchResults?.data || [];
  }, [searchResults]);

  const hasMore = useMemo(() => {
    return searchResults?.has_more || false;
  }, [searchResults]);

  return {
    searchQuery,
    setSearchQuery,
    suggestions,
    isLoadingSuggestions,
    cards,
    isLoadingSearch,
    searchError,
    hasMore,
    selectedCard,
    setSelectedCard,
    cardPrints,
    isLoadingPrints,
  };
}
