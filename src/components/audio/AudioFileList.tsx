import { XIcon, Music2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format-bytes";
import { estimateAudioOutputSize } from "@/lib/audio-processing";
import type { AudioFile, AudioProcessingOptions } from "@/lib/audio-types";

interface AudioFileListProps {
  files: AudioFile[];
  options: AudioProcessingOptions;
  onRemove: (id: string) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioFileList({ files, options, onRemove }: AudioFileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">
        {files.length} file{files.length > 1 ? "s" : ""} selected
      </h3>
      <div className="space-y-1.5">
        {files.map((file) => {
          const estimated = estimateAudioOutputSize(
            file.file.size,
            file.duration,
            options.bitrate,
          );
          const savings = Math.round(
            (1 - estimated / file.file.size) * 100,
          );

          return (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                <Music2Icon className="size-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDuration(file.duration)} &middot;{" "}
                  {formatBytes(file.file.size)}
                  <span className="mx-1">&rarr;</span>
                  <span
                    className={
                      savings > 0 ? "text-green-500" : "text-orange-500"
                    }
                  >
                    ~{formatBytes(estimated)}{" "}
                    {savings > 0 ? `(-${savings}%)` : `(+${Math.abs(savings)}%)`}
                  </span>
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onRemove(file.id)}
              >
                <XIcon className="size-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
