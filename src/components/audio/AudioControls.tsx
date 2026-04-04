import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AudioOutputFormat, AudioProcessingOptions } from "@/lib/audio-types";
import {
  AUDIO_FORMATS,
  BITRATE_OPTIONS,
  SAMPLE_RATE_OPTIONS,
} from "@/lib/audio-types";

interface AudioControlsProps {
  options: AudioProcessingOptions;
  onChange: (options: AudioProcessingOptions) => void;
}

export function AudioControls({ options, onChange }: AudioControlsProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="audio-format">Output format</Label>
        <Select
          value={options.format}
          onValueChange={(value) => {
            if (value) onChange({ ...options, format: value as AudioOutputFormat });
          }}
        >
          <SelectTrigger id="audio-format" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AUDIO_FORMATS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bitrate">Bitrate</Label>
        <Select
          value={String(options.bitrate)}
          onValueChange={(value) => {
            if (value) onChange({ ...options, bitrate: Number(value) });
          }}
        >
          <SelectTrigger id="bitrate" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BITRATE_OPTIONS.map((b) => (
              <SelectItem key={b} value={String(b)}>
                {b} kbps
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sample-rate">Sample rate</Label>
        <Select
          value={String(options.sampleRate)}
          onValueChange={(value) => {
            if (value) onChange({ ...options, sampleRate: Number(value) });
          }}
        >
          <SelectTrigger id="sample-rate" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SAMPLE_RATE_OPTIONS.map((sr) => (
              <SelectItem key={sr} value={String(sr)}>
                {(sr / 1000).toFixed(1)} kHz
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
