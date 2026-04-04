import { useState, useCallback } from "react";
import { DownloadIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DropZone } from "@/components/DropZone";
import { AudioFileList } from "./AudioFileList";
import { AudioControls } from "./AudioControls";
import { getFFmpeg, processAudio } from "@/lib/audio-processing";
import { formatBytes } from "@/lib/format-bytes";
import type { AudioFile, AudioProcessingOptions, AudioProcessedResult } from "@/lib/audio-types";

const ACCEPTED_FORMATS = ".wav,.mp3,.flac,.ogg,.aac,.m4a,.opus,.wma";

const DEFAULT_OPTIONS: AudioProcessingOptions = {
  format: "mp3",
  bitrate: 128,
  sampleRate: 44100,
};

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function loadAudioMetadata(file: File): Promise<{ duration: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";

    const timeout = setTimeout(() => {
      cleanup();
      resolve({ duration: 0 });
    }, 5000);

    function cleanup() {
      clearTimeout(timeout);
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.src = "";
      URL.revokeObjectURL(url);
    }

    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      cleanup();
      resolve({ duration: Number.isFinite(duration) ? duration : 0 });
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load audio: ${file.name}`));
    };
    audio.src = url;
  });
}

export function AudioOptimizer() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [options, setOptions] = useState<AudioProcessingOptions>(DEFAULT_OPTIONS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AudioProcessedResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const handleFiles = useCallback(async (newFiles: File[]) => {
    setError(null);
    const audioFiles: AudioFile[] = [];

    for (const file of newFiles) {
      try {
        const { duration } = await loadAudioMetadata(file);
        audioFiles.push({
          id: generateId(),
          file,
          duration,
          name: file.name,
        });
      } catch {
        // Skip files that can't be loaded as audio
      }
    }

    setFiles((prev) => [...prev, ...audioFiles]);
    setResults([]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResults([]);
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    setResults([]);
    setError(null);
    setProgress(null);
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const ffmpeg = await getFFmpeg((msg) => setProgress(msg));
      setIsLoading(false);

      const processed: AudioProcessedResult[] = [];

      for (let i = 0; i < files.length; i++) {
        setProgress(`Processing ${i + 1} of ${files.length}: ${files[i].name}`);
        const result = await processAudio(files[i], options, ffmpeg);
        processed.push(result);
      }

      setResults(processed);
      setProgress(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during processing",
      );
      setProgress(null);
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  }, [files, options]);

  const handleDownload = useCallback(async () => {
    if (results.length === 0) return;

    if (results.length === 1) {
      const result = results[0];
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.name;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const zip = new JSZip();
    for (const result of results) {
      zip.file(result.name, result.blob);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-audio.zip";
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
          description="Supports WAV, MP3, FLAC, OGG, AAC, M4A, OPUS, WMA — up to 100 files"
        />

        <AudioFileList files={files} options={options} onRemove={handleRemove} />

        {files.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleProcess} disabled={isProcessing}>
              {isProcessing && (
                <Loader2Icon className="size-4 animate-spin" data-icon="inline-start" />
              )}
              {isLoading ? "Loading FFmpeg..." : isProcessing ? "Processing..." : "Convert"}
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

        {progress && isProcessing && (
          <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
            {progress}
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
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-medium">Results</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold">{formatBytes(totalOriginal)}</p>
                    <p className="text-xs text-muted-foreground">Original</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{formatBytes(totalOutput)}</p>
                    <p className="text-xs text-muted-foreground">Converted</p>
                  </div>
                  <div>
                    <p
                      className={`text-lg font-bold ${totalSavings > 0 ? "text-green-500" : "text-orange-500"}`}
                    >
                      {totalSavings > 0 ? `-${totalSavings}%` : `+${Math.abs(totalSavings)}%`}
                    </p>
                    <p className="text-xs text-muted-foreground">Difference</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Preview</h3>
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{result.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(result.outputSize)}
                      </p>
                    </div>
                    <audio
                      controls
                      src={URL.createObjectURL(result.blob)}
                      className="h-8 w-48"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Settings</h3>
        <AudioControls options={options} onChange={setOptions} />
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p className="font-medium">First time?</p>
          <p className="mt-1">
            FFmpeg loads ~30 MB on first use. It&apos;s cached after that.
          </p>
        </div>
      </div>
    </div>
  );
}
