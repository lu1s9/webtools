export type OutputFormat = "png" | "jpeg" | "webp" | "avif";

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
}

export interface ProcessingOptions {
  format: OutputFormat;
  quality: number;
  resize: {
    enabled: boolean;
    width: number;
    height: number;
    maintainAspectRatio: boolean;
  };
}

export interface ProcessedResult {
  id: string;
  name: string;
  originalSize: number;
  outputSize: number;
  buffer: ArrayBuffer;
  width: number;
  height: number;
}
