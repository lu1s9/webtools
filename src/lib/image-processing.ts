import type { ImageFile, OutputFormat, ProcessingOptions, ProcessedResult } from "./types";

async function decodeImage(file: File): Promise<ImageData> {
  const buffer = await file.arrayBuffer();
  const ext = file.name.split(".").pop()?.toLowerCase();

  let result: ImageData | null = null;

  switch (ext) {
    case "png": {
      const { decode } = await import("@jsquash/png");
      result = await decode(buffer);
      break;
    }
    case "jpg":
    case "jpeg": {
      const { decode } = await import("@jsquash/jpeg");
      result = await decode(buffer);
      break;
    }
    case "webp": {
      const { decode } = await import("@jsquash/webp");
      result = await decode(buffer);
      break;
    }
    case "avif": {
      const { decode } = await import("@jsquash/avif");
      result = await decode(buffer);
      break;
    }
    default:
      throw new Error(`Unsupported input format: ${ext}`);
  }

  if (!result) throw new Error(`Failed to decode image: ${file.name}`);
  return result;
}

async function encodeImage(
  imageData: ImageData,
  format: OutputFormat,
  quality: number,
): Promise<ArrayBuffer> {
  switch (format) {
    case "png": {
      const { encode } = await import("@jsquash/png");
      return encode(imageData);
    }
    case "jpeg": {
      const { encode } = await import("@jsquash/jpeg");
      return encode(imageData, { quality });
    }
    case "webp": {
      const { encode } = await import("@jsquash/webp");
      return encode(imageData, { quality });
    }
    case "avif": {
      const { encode } = await import("@jsquash/avif");
      return encode(imageData, {
        quality,
        speed: 6,
      });
    }
  }
}

async function resizeImageData(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
): Promise<ImageData> {
  const resizeModule = await import("@jsquash/resize");
  const resize = resizeModule.default;
  return resize(imageData, {
    width: targetWidth,
    height: targetHeight,
    fitMethod: "stretch",
  });
}

export async function processImage(
  file: ImageFile,
  options: ProcessingOptions,
): Promise<ProcessedResult> {
  let imageData = await decodeImage(file.file);

  if (options.resize.enabled) {
    imageData = await resizeImageData(
      imageData,
      options.resize.width,
      options.resize.height,
    );
  }

  const outputBuffer = await encodeImage(
    imageData,
    options.format,
    options.quality,
  );

  const originalName = file.file.name.replace(/\.[^.]+$/, "");
  const outputName = `${originalName}.${options.format === "jpeg" ? "jpg" : options.format}`;

  return {
    id: file.id,
    name: outputName,
    originalSize: file.file.size,
    outputSize: outputBuffer.byteLength,
    buffer: outputBuffer,
    width: options.resize.enabled ? options.resize.width : file.width,
    height: options.resize.enabled ? options.resize.height : file.height,
  };
}

export function estimateOutputSize(
  originalSize: number,
  format: OutputFormat,
  quality: number,
): number {
  const qualityFactor = quality / 100;

  const formatFactors: Record<OutputFormat, number> = {
    png: 0.95,
    jpeg: 0.15 + 0.7 * qualityFactor,
    webp: 0.1 + 0.5 * qualityFactor,
    avif: 0.08 + 0.4 * qualityFactor,
  };

  return Math.round(originalSize * formatFactors[format]);
}
