import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2 } from "lucide-react";
import { useCardSearch } from "@/hooks/use-card-search";
import { ScryfallAPI } from "@/lib/scryfall-api";
import { ScryfallCard } from "@/types/mtg";

interface CardSearchProps {
  onCardSelect?: (card: ScryfallCard) => void;
  placeholder?: string;
  className?: string;
}

export function CardSearch({ onCardSelect, placeholder = "Search for cards...", className }: CardSearchProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    searchQuery,
    setSearchQuery,
    suggestions,
    isLoadingSuggestions,
  } = useCardSearch();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(value.length >= 2);
  };

  const handleSuggestionClick = async (cardName: string) => {
    setSearchQuery(cardName);
    setShowDropdown(false);
    
    if (onCardSelect) {
      try {
        const card = await ScryfallAPI.getCardByName(cardName);
        onCardSelect(card);
      } catch (error) {
        console.error("Error fetching card:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
          className="pl-10 pr-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {isLoadingSuggestions && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
        )}
      </div>

      {showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto z-50 border-border">
          {isLoadingSuggestions ? (
            <div className="p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full mb-2 last:mb-0" />
              ))}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((cardName, index) => (
                <div
                  key={index}
                  className="px-4 py-2 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSuggestionClick(cardName)}
                >
                  {cardName}
                </div>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="px-4 py-2 text-muted-foreground">
              No suggestions found
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}
