import { XIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format-bytes";
import { estimateOutputSize } from "@/lib/image-processing";
import type { ImageFile, ProcessingOptions } from "@/lib/types";

interface FileListProps {
  files: ImageFile[];
  options: ProcessingOptions;
  onRemove: (id: string) => void;
}

export function FileList({ files, options, onRemove }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">
        {files.length} file{files.length > 1 ? "s" : ""} selected
      </h3>
      <div className="space-y-1.5">
        {files.map((file) => {
          const estimated = estimateOutputSize(
            file.file.size,
            options.format,
            options.quality,
          );
          const savings = Math.round(
            (1 - estimated / file.file.size) * 100,
          );

          return (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="size-10 rounded-md object-cover"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                  <ImageIcon className="size-4 text-muted-foreground" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.width}x{file.height} &middot;{" "}
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
