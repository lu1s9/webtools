import { useState, useCallback } from "react";
import { DownloadIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DropZone } from "@/components/DropZone";
import { FileList } from "./FileList";
import { Controls } from "./Controls";
import { processImage } from "@/lib/image-processing";
import { formatBytes } from "@/lib/format-bytes";
import type { ImageFile, ProcessingOptions, ProcessedResult } from "@/lib/types";

const ACCEPTED_FORMATS = ".png,.jpg,.jpeg,.webp,.avif";

const DEFAULT_OPTIONS: ProcessingOptions = {
  format: "webp",
  quality: 80,
  resize: {
    enabled: false,
    width: 1920,
    height: 1080,
    maintainAspectRatio: true,
  },
};

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function loadImageDimensions(
  file: File,
): Promise<{ width: number; height: number; preview: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight, preview: url });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = url;
  });
}

export function ImageOptimizer() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>(DEFAULT_OPTIONS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessedResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (newFiles: File[]) => {
    setError(null);
    const imageFiles: ImageFile[] = [];

    for (const file of newFiles) {
      try {
        const { width, height, preview } = await loadImageDimensions(file);
        imageFiles.push({
          id: generateId(),
          file,
          preview,
          width,
          height,
        });
      } catch {
        // Skip files that can't be loaded as images
      }
    }

    setFiles((prev) => [...prev, ...imageFiles]);
    setResults([]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
    setResults([]);
  }, []);

  const handleClearAll = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setResults([]);
    setError(null);
  }, [files]);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setResults([]);

    try {
      const processed: ProcessedResult[] = [];

      for (const file of files) {
        const result = await processImage(file, options);
        processed.push(result);
      }

      setResults(processed);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during processing",
      );
    } finally {
      setIsProcessing(false);
    }
  }, [files, options]);

  const handleDownload = useCallback(async () => {
    if (results.length === 0) return;

    if (results.length === 1) {
      const result = results[0];
      const blob = new Blob([result.buffer]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.name;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const zip = new JSZip();
    for (const result of results) {
      zip.file(result.name, result.buffer);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-images.zip";
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalOutput = results.reduce((sum, r) => sum + r.outputSize, 0);
  const totalSavings =
    totalOriginal > 0 ? Math.round((1 - totalOutput / totalOriginal) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <DropZone
          accept={ACCEPTED_FORMATS}
          onFiles={handleFiles}
          description="Supports PNG, JPG, WebP, AVIF — up to 100 files"
        />

        <FileList files={files} options={options} onRemove={handleRemove} />

        {files.length > 0 && (
          <div className="flex items-center gap-2">
            <Button onClick={handleProcess} disabled={isProcessing}>
              {isProcessing && (
                <Loader2Icon className="size-4 animate-spin" data-icon="inline-start" />
              )}
              {isProcessing ? "Processing..." : "Optimize"}
            </Button>

            {results.length > 0 && (
              <Button variant="outline" onClick={handleDownload}>
                <DownloadIcon className="size-4" data-icon="inline-start" />
                Download {results.length > 1 ? "ZIP" : results[0].name}
              </Button>
            )}

            <div className="flex-1" />

            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              <Trash2Icon className="size-3.5" data-icon="inline-start" />
              Clear all
            </Button>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <>
            <Separator />
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-medium">Results</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">{formatBytes(totalOriginal)}</p>
                  <p className="text-xs text-muted-foreground">Original</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{formatBytes(totalOutput)}</p>
                  <p className="text-xs text-muted-foreground">Optimized</p>
                </div>
                <div>
                  <p
                    className={`text-lg font-bold ${totalSavings > 0 ? "text-green-500" : "text-orange-500"}`}
                  >
                    {totalSavings > 0 ? `-${totalSavings}%` : `+${Math.abs(totalSavings)}%`}
                  </p>
                  <p className="text-xs text-muted-foreground">Savings</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Settings</h3>
        <Controls options={options} onChange={setOptions} />
      </div>
    </div>
  );
}
