import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Loader2, ScanLine, Focus } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export const BarcodeScanner = ({ onScan }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const controlsRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
  }, []);

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const startScanning = async () => {
    if (!videoRef.current || !readerRef.current) return;
    
    setIsLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const controls = await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result) => {
          if (result) {
            const barcode = result.getText();
            onScan(barcode);
            stopScanning();
            toast.success("Barcode scanned successfully!");
          }
        }
      );

      controlsRef.current = controls;
      setIsScanning(true);
      toast.success("Camera started! Point at a barcode to scan.");
    } catch (error: unknown) {
      console.error("Camera error:", error);
      
      const err = error as { name?: string };
      if (err.name === "NotAllowedError") {
        toast.error("Camera permission denied. Please allow camera access.");
      } else if (err.name === "NotFoundError") {
        toast.error("No camera found on this device.");
      } else if (err.name === "NotReadableError") {
        toast.error("Camera is in use by another application.");
      } else {
        toast.error("Failed to start camera. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Outer glow */}
      <div className="absolute -inset-2 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-[2rem] blur-xl opacity-60 pointer-events-none" />
      
      <Card className="relative glass-card gradient-border inner-glow scanner-pulse p-6 rounded-3xl" style={{ boxShadow: 'var(--shadow-scanner)' }}>
        <div className="space-y-5">
          {/* Scanner viewport */}
          <div 
            className="relative aspect-[4/3] overflow-hidden rounded-2xl"
            style={{ background: 'var(--gradient-scanner-bg)' }}
          >
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {/* Scanner overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Scanner frame */}
                  <div className="relative w-60 h-44">
                    {/* Corner brackets with glow */}
                    <div className="scan-corner scan-corner-tl top-0 left-0" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))' }} />
                    <div className="scan-corner scan-corner-tr top-0 right-0" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))' }} />
                    <div className="scan-corner scan-corner-bl bottom-0 left-0" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))' }} />
                    <div className="scan-corner scan-corner-br bottom-0 right-0" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))' }} />
                    
                    {/* Scanning beam */}
                    <div className="scan-beam" />
                  </div>
                </div>
                
                {/* Vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/20 pointer-events-none" />
              </>
            ) : (
              <>
                <video ref={videoRef} className="hidden" autoPlay playsInline muted />
                
                {/* Idle state with visual richness */}
                <div className="flex flex-col h-full items-center justify-center p-8">
                  {/* Animated scanner icon */}
                  <div className="relative mb-6">
                    {/* Pulsing glow */}
                    <div className="absolute inset-0 bg-primary/15 blur-2xl rounded-full animate-pulse" />
                    
                    {/* Dashed border with animation */}
                    <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center bg-gradient-to-br from-primary/5 to-transparent">
                      {/* Inner glow circle */}
                      <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-primary/10 to-transparent" />
                      <ScanLine className="relative h-12 w-12 text-primary/70 animate-pulse" style={{ animationDuration: '2s' }} />
                    </div>
                    
                    {/* Orbiting dot */}
                    <div 
                      className="absolute w-2 h-2 rounded-full bg-primary shadow-lg"
                      style={{
                        animation: 'orbit 4s linear infinite',
                        top: '50%',
                        left: '50%',
                        transformOrigin: '0 0',
                      }}
                    />
                  </div>
                  
                  {/* Helper text */}
                  <div className="text-center space-y-2">
                    <p className="font-semibold text-foreground">Ready to scan</p>
                    <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
                      Tap the button below to activate your camera and scan a product barcode
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action button */}
          <Button
            onClick={isScanning ? stopScanning : startScanning}
            disabled={isLoading}
            size="lg"
            className={`w-full h-14 rounded-2xl font-semibold text-base focus-ring ${
              isScanning 
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 hover:-translate-y-0.5 transition-all duration-300' 
                : 'btn-premium text-primary-foreground'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Starting Camera...
              </>
            ) : isScanning ? (
              <>
                <CameraOff className="mr-2 h-5 w-5" />
                Stop Scanning
              </>
            ) : (
              <>
                <Camera className="mr-2 h-5 w-5" />
                Start Camera Scan
              </>
            )}
          </Button>

          {/* Active scanning hint */}
          {isScanning && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-in">
              <Focus className="h-4 w-4 text-primary animate-pulse" />
              <span>Point your camera at the barcode</span>
            </div>
          )}
        </div>
      </Card>
      
      {/* Orbit animation keyframes */}
      <style>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(60px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(60px) rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
};