import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { OutputFormat, ProcessingOptions } from "@/lib/types";

interface ControlsProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
}

const formats: { value: OutputFormat; label: string }[] = [
  { value: "webp", label: "WebP" },
  { value: "avif", label: "AVIF" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
];

export function Controls({ options, onChange }: ControlsProps) {
  const isPng = options.format === "png";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="format">Output format</Label>
        <Select
          value={options.format}
          onValueChange={(value) => {
            if (value) onChange({ ...options, format: value as OutputFormat });
          }}
        >
          <SelectTrigger id="format" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {formats.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="quality">Quality</Label>
          <span className="text-sm tabular-nums text-muted-foreground">
            {isPng ? "Lossless" : `${options.quality}%`}
          </span>
        </div>
        <Slider
          id="quality"
          min={1}
          max={100}
          step={1}
          value={[options.quality]}
          onValueChange={(value) => {
            const v = Array.isArray(value) ? value[0] : value;
            onChange({ ...options, quality: v });
          }}
          disabled={isPng}
        />
        {isPng && (
          <p className="text-xs text-muted-foreground">
            PNG is always lossless — quality setting does not apply.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="resize">Resize</Label>
          <Switch
            id="resize"
            checked={options.resize.enabled}
            onCheckedChange={(enabled) =>
              onChange({
                ...options,
                resize: { ...options.resize, enabled },
              })
            }
          />
        </div>

        {options.resize.enabled && (
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="width" className="text-xs text-muted-foreground">
                Width
              </Label>
              <input
                id="width"
                type="number"
                min={1}
                max={10000}
                value={options.resize.width}
                onChange={(e) => {
                  const width = Number(e.target.value) || 1;
                  const height = options.resize.maintainAspectRatio
                    ? Math.round(
                        (width / options.resize.width) * options.resize.height,
                      )
                    : options.resize.height;
                  onChange({
                    ...options,
                    resize: { ...options.resize, width, height },
                  });
                }}
                className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
              />
            </div>
            <span className="mt-5 text-muted-foreground">&times;</span>
            <div className="flex-1 space-y-1">
              <Label htmlFor="height" className="text-xs text-muted-foreground">
                Height
              </Label>
              <input
                id="height"
                type="number"
                min={1}
                max={10000}
                value={options.resize.height}
                onChange={(e) => {
                  const height = Number(e.target.value) || 1;
                  const width = options.resize.maintainAspectRatio
                    ? Math.round(
                        (height / options.resize.height) * options.resize.width,
                      )
                    : options.resize.width;
                  onChange({
                    ...options,
                    resize: { ...options.resize, width, height },
                  });
                }}
                className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
