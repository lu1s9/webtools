import { useCallback, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import { UploadIcon } from "lucide-react";

interface DropZoneProps {
  accept: string;
  onFiles: (files: File[]) => void;
  maxFiles?: number;
  label?: string;
  description?: string;
}

export function DropZone({
  accept,
  onFiles,
  maxFiles = 100,
  label = "Drop files here or click to browse",
  description,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      if (files.length > 0) {
        onFiles(files);
      }
    },
    [onFiles, maxFiles],
  );

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = accept;
    input.onchange = () => {
      const files = Array.from(input.files ?? []).slice(0, maxFiles);
      if (files.length > 0) {
        onFiles(files);
      }
    };
    input.click();
  }, [accept, onFiles, maxFiles]);

  return (
    <button
      type="button"
      onClick={handleClick}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <UploadIcon className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </button>
  );
}
