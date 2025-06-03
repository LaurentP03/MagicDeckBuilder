import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CloudUpload, FileText, AlertTriangle } from "lucide-react";
import { DeckParser } from "@/lib/deck-parser";

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string) => void;
}

export function FileUploadModal({ isOpen, onClose, onImport }: FileUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [deckText, setDeckText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const textFile = files.find(file => file.type === "text/plain" || file.name.endsWith(".txt"));
    
    if (textFile) {
      handleFileRead(textFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setDeckText(text);
      validateDeck(text);
    };
    reader.readAsText(file);
  };

  const validateDeck = (text: string) => {
    const validation = DeckParser.validateDeckFormat(text);
    setErrors(validation.errors);
  };

  const handleTextChange = (text: string) => {
    setDeckText(text);
    if (text.trim()) {
      validateDeck(text);
    } else {
      setErrors([]);
    }
  };

  const handleImport = () => {
    if (errors.length === 0 && deckText.trim()) {
      onImport(deckText);
      handleClose();
    }
  };

  const handleClose = () => {
    setDeckText("");
    setErrors([]);
    setDragActive(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Deck
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop your .txt file here</p>
            <p className="text-muted-foreground text-sm">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Text Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Or paste your deck list:
            </label>
            <Textarea
              placeholder="4 Lightning Bolt&#10;4 Counterspell&#10;20 Island"
              value={deckText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-32 font-mono"
            />
          </div>

          {/* Format Information */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Supported formats:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Standard format: "4 Lightning Bolt"</li>
              <li>Alternative format: "4x Lightning Bolt"</li>
              <li>Comments starting with "//" or "#"</li>
            </ul>
          </div>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p>Please fix the following errors:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!deckText.trim() || errors.length > 0}
            >
              Import Deck
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
