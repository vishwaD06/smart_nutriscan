import { useState } from "react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { ManualInput } from "@/components/ManualInput";
import { NutritionDisplay } from "@/components/NutritionDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ScanLine, Camera, Keyboard, Sparkles, Leaf, Zap } from "lucide-react";
import { useProductSearch } from "@/hooks/useProductSearch";

const Index = () => {
  const [activeTab, setActiveTab] = useState("camera");
  const { nutritionData, isLoading, loadingStage, fetchNutritionData } = useProductSearch();

  return (
    <div className="min-h-screen relative texture-noise" style={{ background: 'var(--gradient-hero)' }}>
      {/* Ambient background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top-left orb */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/8 to-transparent blur-3xl float-subtle" />
        {/* Bottom-right orb */}
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-accent/6 to-transparent blur-3xl float-subtle" style={{ animationDelay: '-4s' }} />
        {/* Center glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-b from-primary/4 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-border/40 bg-card/50 backdrop-blur-2xl sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3.5">
            {/* Logo with glow */}
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/25 blur-xl rounded-full transition-all duration-500 group-hover:bg-primary/35 group-hover:blur-2xl" />
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-105">
                <ScanLine className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
                NutriScan
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">
                Smart Nutrition Insights
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-12 max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-sm font-medium mb-8 animate-in hover-lift cursor-default">
            <Sparkles className="h-4 w-4" />
            <span>Instant nutrition data</span>
          </div>
          
          {/* Headline */}
          <h2 className="font-display text-[2.75rem] md:text-5xl lg:text-[3.25rem] font-bold text-foreground mb-5 tracking-tight leading-[1.1] animate-in delay-1">
            Scan Your Food,
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-emerald-500 bg-clip-text text-transparent">
              Know What You Eat
            </span>
          </h2>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto leading-relaxed font-light animate-in delay-2">
            Get detailed nutrition information instantly by scanning barcodes or entering them manually
          </p>
        </div>

        {/* Scanner/Input Section */}
        <div className="mb-12 animate-in delay-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Segmented Control */}
            <div className="relative mb-8">
              <TabsList className="relative grid w-full grid-cols-2 p-1.5 h-auto rounded-2xl bg-muted/50 backdrop-blur-sm border border-border/40 segment-container">
                {/* Sliding indicator */}
                <div 
                  className="segment-indicator"
                  style={{
                    left: activeTab === 'camera' ? '6px' : 'calc(50% + 3px)',
                    width: 'calc(50% - 9px)',
                  }}
                />
                
                <TabsTrigger 
                  value="camera" 
                  className="segment-item flex items-center justify-center gap-2.5 focus-ring"
                >
                  <Camera className="h-[18px] w-[18px]" />
                  <span>Camera Scan</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="manual"
                  className="segment-item flex items-center justify-center gap-2.5 focus-ring"
                >
                  <Keyboard className="h-[18px] w-[18px]" />
                  <span>Manual Entry</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="camera" className="mt-0 focus-visible:outline-none">
              <div className="animate-in">
                <BarcodeScanner onScan={fetchNutritionData} />
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="mt-0 focus-visible:outline-none">
              <div className="animate-in">
                <ManualInput onSubmit={fetchNutritionData} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Loading State - only show when no partial data yet */}
        {isLoading && !nutritionData && (
          <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-in">
            <div className="relative">
              {/* Pulsing rings */}
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <div className="absolute -inset-4 border-2 border-primary/20 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="absolute -inset-8 border border-primary/10 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
              
              {/* Center spinner */}
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-card to-secondary border border-border/50 shadow-card">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-2 justify-center">
                <Zap className="h-4 w-4 text-primary" />
                Fetching nutrition data
              </p>
              <p className="text-sm text-muted-foreground">Analyzing product information...</p>
            </div>
          </div>
        )}

        {/* Nutrition Display - show immediately when data arrives (even partial) */}
        {!isLoading && nutritionData && (
          <div className="animate-in">
            <NutritionDisplay data={nutritionData} />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !nutritionData && (
          <div className="text-center py-10 animate-in delay-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted/50 border border-border/30 mb-4">
              <Leaf className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              Your nutrition results will appear here
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;