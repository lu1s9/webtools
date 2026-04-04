export type AudioOutputFormat = "mp3" | "ogg" | "aac" | "opus";

export interface AudioFile {
  id: string;
  file: File;
  duration: number;
  name: string;
}

export interface AudioProcessingOptions {
  format: AudioOutputFormat;
  bitrate: number;
  sampleRate: number;
}

export interface AudioProcessedResult {
  id: string;
  name: string;
  originalSize: number;
  outputSize: number;
  blob: Blob;
}

export const AUDIO_FORMATS: { value: AudioOutputFormat; label: string; codec: string; mime: string }[] = [
  { value: "mp3", label: "MP3", codec: "libmp3lame", mime: "audio/mpeg" },
  { value: "ogg", label: "OGG (Vorbis)", codec: "libvorbis", mime: "audio/ogg" },
  { value: "aac", label: "AAC", codec: "aac", mime: "audio/aac" },
  { value: "opus", label: "OPUS", codec: "libopus", mime: "audio/opus" },
];

export const BITRATE_OPTIONS = [64, 96, 128, 192, 256, 320];
export const SAMPLE_RATE_OPTIONS = [22050, 44100, 48000];
