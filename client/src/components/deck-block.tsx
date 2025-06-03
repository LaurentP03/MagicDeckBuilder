import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical, X } from "lucide-react";
import { DeckBlock as DeckBlockType, DeckCard, ScryfallCard } from "@/types/mtg";
import { ScryfallAPI } from "@/lib/scryfall-api";

interface DeckBlockProps {
  block: DeckBlockType;
  onUpdateBlock: (blockId: string, updates: Partial<DeckBlockType>) => void;
  onDeleteBlock: (blockId: string) => void;
  onRemoveCard: (cardId: string, blockId: string, quantity?: number) => void;
  onCardClick?: (card: ScryfallCard) => void;
  onDragStart?: (e: React.DragEvent, card: DeckCard) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, blockId: string) => void;
}

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#64748b", "#6b7280", "#71717a"
];

export function DeckBlock({
  block,
  onUpdateBlock,
  onDeleteBlock,
  onRemoveCard,
  onCardClick,
  onDragStart,
  onDragOver,
  onDrop,
}: DeckBlockProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const totalCards = block.cards.reduce((sum, card) => sum + card.quantity, 0);

  const handleNameSubmit = () => {
    setIsEditingName(false);
    if (nameInputRef.current) {
      onUpdateBlock(block.id, { name: nameInputRef.current.value });
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
    }
  };

  const handleColorChange = (color: string) => {
    onUpdateBlock(block.id, { color });
    setShowColorPicker(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
    onDragOver?.(e);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    onDrop?.(e, block.id);
  };

  return (
    <Card 
      className="p-4 bg-card border-2 border-dashed border-border min-h-32 transition-colors"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          {/* Color Indicator */}
          <div className="relative">
            <div
              className="w-4 h-4 rounded-full cursor-pointer border border-border"
              style={{ backgroundColor: block.color }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            {showColorPicker && (
              <div className="absolute top-6 left-0 z-10 bg-popover border border-border rounded-lg p-2 shadow-lg grid grid-cols-5 gap-1">
                {PRESET_COLORS.map((color) => (
                  <div
                    key={color}
                    className="w-6 h-6 rounded-full cursor-pointer border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Block Name */}
          {isEditingName ? (
            <Input
              ref={nameInputRef}
              defaultValue={block.name}
              className="text-lg font-semibold bg-transparent border-none p-0 h-auto"
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              autoFocus
            />
          ) : (
            <h3
              className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsEditingName(true)}
            >
              {block.name}
            </h3>
          )}

          <Badge variant="secondary" className="text-xs">
            {totalCards}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteBlock(block.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-8 gap-2">
        {block.cards.map((deckCard, index) => (
          <div
            key={`${deckCard.card.id}-${block.id}-${index}`}
            className="card-hover cursor-pointer relative group"
            draggable
            onDragStart={(e) => onDragStart?.(e, deckCard)}
            onClick={() => onCardClick?.(deckCard.card)}
          >
            <div className="aspect-[5/7] overflow-hidden rounded border border-border">
              <img
                src={ScryfallAPI.getCardImageUrl(deckCard.card, 'small')}
                alt={deckCard.card.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Quantity Badge */}
            <Badge 
              className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold bg-primary"
            >
              {deckCard.quantity}
            </Badge>
            
            {/* Remove Button (shown on hover) */}
            <div className="absolute inset-0 bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCard(deckCard.card.id, block.id);
                }}
                className="text-white hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {block.cards.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Drag cards here or use the search to add cards</p>
        </div>
      )}
    </Card>
  );
}
