import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Barcode, Sparkles } from "lucide-react";

interface ManualInputProps {
  onSubmit: (barcode: string) => void;
}

export const ManualInput = ({ onSubmit }: ManualInputProps) => {
  const [barcode, setBarcode] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onSubmit(barcode.trim());
      setBarcode("");
    }
  };

  return (
    <div className="relative">
      {/* Outer glow */}
      <div className="absolute -inset-2 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-[2rem] blur-xl opacity-60 pointer-events-none" />
      
      <Card className="relative glass-card gradient-border inner-glow p-6 rounded-3xl" style={{ boxShadow: 'var(--shadow-scanner)' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Icon header */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Pulsing glow */}
              <div className="absolute inset-0 bg-primary/15 blur-xl rounded-full animate-pulse" />
              
              {/* Icon container */}
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-center overflow-hidden">
                {/* Inner shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <Barcode className="relative h-9 w-9 text-primary" />
              </div>
            </div>
          </div>

          {/* Input section */}
          <div className="space-y-4">
            <div className="text-center">
              <label htmlFor="barcode" className="text-base font-semibold text-foreground block mb-1">
                Enter Barcode Number
              </label>
              <p className="text-sm text-muted-foreground">
                Find the number below the barcode on product packaging
              </p>
            </div>
            
            {/* Input with enhanced styling */}
            <div className="relative">
              {/* Focus glow */}
              <div 
                className={`absolute -inset-1 rounded-2xl bg-primary/20 blur-md transition-opacity duration-300 ${
                  isFocused ? 'opacity-100' : 'opacity-0'
                }`}
              />
              
              <Input
                id="barcode"
                type="text"
                inputMode="numeric"
                placeholder="e.g., 3017620422003"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="relative h-14 text-center text-lg font-medium rounded-2xl border-2 border-border/50 bg-background/60 backdrop-blur-sm focus:border-primary/50 focus:bg-background/80 transition-all duration-300 placeholder:text-muted-foreground/40 focus-ring"
              />
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            size="lg"
            disabled={!barcode.trim()}
            className="w-full h-14 rounded-2xl btn-premium text-primary-foreground font-semibold text-base disabled:opacity-40 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed focus-ring group"
          >
            <Search className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            Search Product
            {barcode.trim() && (
              <Sparkles className="ml-2 h-4 w-4 opacity-60" />
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};