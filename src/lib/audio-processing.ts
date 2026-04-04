import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import type {
  AudioFile,
  AudioProcessingOptions,
  AudioProcessedResult,
  AudioOutputFormat,
} from "./audio-types";
import { AUDIO_FORMATS } from "./audio-types";

const CORE_VERSION = "0.12.10";
const BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

let ffmpeg: FFmpeg | null = null;

export async function getFFmpeg(
  onProgress?: (message: string) => void,
): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg;

  ffmpeg = new FFmpeg();

  ffmpeg.on("log", ({ message }) => {
    onProgress?.(message);
  });

  onProgress?.("Loading FFmpeg core...");

  await ffmpeg.load({
    coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg;
}

function getExtension(format: AudioOutputFormat): string {
  return format;
}

function getCodec(format: AudioOutputFormat): string {
  const found = AUDIO_FORMATS.find((f) => f.value === format);
  return found?.codec ?? format;
}

function getMime(format: AudioOutputFormat): string {
  const found = AUDIO_FORMATS.find((f) => f.value === format);
  return found?.mime ?? "audio/octet-stream";
}

export async function processAudio(
  file: AudioFile,
  options: AudioProcessingOptions,
  ffmpegInstance: FFmpeg,
): Promise<AudioProcessedResult> {
  const inputName = `input_${file.id}`;
  const ext = getExtension(options.format);
  const outputName = `output_${file.id}.${ext}`;

  await ffmpegInstance.writeFile(inputName, await fetchFile(file.file));

  await ffmpegInstance.exec([
    "-i", inputName,
    "-c:a", getCodec(options.format),
    "-b:a", `${options.bitrate}k`,
    "-ar", `${options.sampleRate}`,
    outputName,
  ]);

  const data = await ffmpegInstance.readFile(outputName);
  const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: getMime(options.format) });

  // Cleanup
  await ffmpegInstance.deleteFile(inputName);
  await ffmpegInstance.deleteFile(outputName);

  const originalName = file.name.replace(/\.[^.]+$/, "");

  return {
    id: file.id,
    name: `${originalName}.${ext}`,
    originalSize: file.file.size,
    outputSize: blob.size,
    blob,
  };
}

export function estimateAudioOutputSize(
  originalSize: number,
  duration: number,
  bitrate: number,
): number {
  if (duration <= 0) return originalSize;
  // bitrate is in kbps, duration in seconds
  const estimated = (bitrate * 1000 * duration) / 8;
  return Math.round(estimated);
}
