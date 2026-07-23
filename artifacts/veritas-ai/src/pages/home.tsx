import { useState, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { usePredictImage, useGetModelStatus } from '@workspace/api-client-react';
import { UploadZone } from '@/components/upload-zone';
import { SampleSelector } from '@/components/sample-selector';
import { AnalyzingState } from '@/components/analyzing-state';
import { VerdictDisplay } from '@/components/verdict-display';
import { ModelWarming } from '@/components/model-warming';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { PredictionResult } from '@workspace/api-client-react';

export default function Home() {
  const [modelReady, setModelReady] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const { toast } = useToast();
  
  const predictMutation = usePredictImage();

  // Check model status on mount
  const { data: modelStatus } = useGetModelStatus();

  const handleImageSelect = useCallback(
    (base64: string) => {
      setCurrentImage(base64);
      setResult(null);

      predictMutation.mutate(
        { data: { imageBase64: base64 } },
        {
          onSuccess: (data) => {
            setResult(data);
          },
          onError: (error) => {
            toast({
              variant: 'destructive',
              title: 'Analysis failed',
              description: error.message || 'Could not analyze the image. Please try again.',
            });
          },
        }
      );
    },
    [predictMutation, toast]
  );

  const handleSampleSelect = useCallback(
    async (imageUrl: string) => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          handleImageSelect(base64);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to load sample',
          description: 'Could not load the sample image. Please try again.',
        });
      }
    },
    [handleImageSelect, toast]
  );

  const handleFileSelect = useCallback(
    (base64: string, _file: File) => {
      handleImageSelect(base64);
    },
    [handleImageSelect]
  );

  const handleReset = useCallback(() => {
    setCurrentImage(null);
    setResult(null);
  }, []);

  const handleModelReady = useCallback(() => {
    setModelReady(true);
  }, []);

  if (!modelReady && modelStatus && !modelStatus.ready) {
    return <ModelWarming onReady={handleModelReady} />;
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Veritas AI
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Deepfake detection instrument
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">
              Model ready
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Upload + Samples */}
          <div className="space-y-8">
            <UploadZone
              onImageSelect={handleFileSelect}
              disabled={predictMutation.isPending}
            />
            <SampleSelector
              onSampleSelect={handleSampleSelect}
              disabled={predictMutation.isPending}
            />
          </div>

          {/* Right: Image + Result */}
          <div className="lg:sticky lg:top-24">
            {currentImage ? (
              <div className="space-y-6">
                {/* Image preview */}
                <div className="relative rounded-lg overflow-hidden border border-border bg-card">
                  <img
                    src={currentImage}
                    alt="Uploaded for analysis"
                    className="w-full h-auto max-h-[500px] object-contain"
                    data-testid="img-preview"
                  />
                  <Button
                    data-testid="button-reset"
                    onClick={handleReset}
                    size="icon"
                    variant="destructive"
                    className="absolute top-4 right-4 rounded-full shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Analysis state or result */}
                {predictMutation.isPending && <AnalyzingState />}
                {result && !predictMutation.isPending && (
                  <VerdictDisplay result={result} />
                )}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">
                  Upload an image or select a sample to begin analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-xs text-muted-foreground">
            Veritas AI uses a convolutional neural network trained on deepfake datasets.
            Results are probabilistic and should be used as one factor in verification.
          </p>
        </div>
      </footer>
    </div>
  );
}
