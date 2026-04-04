import { ToolCard } from "./ToolCard";
import { ImageIcon, AudioLinesIcon } from "lucide-react";

const base = import.meta.env.BASE_URL;

const tools = [
  {
    title: "Image Optimizer",
    description: "Convert and compress images. Supports PNG, JPG, WebP, AVIF with adjustable quality.",
    href: `${base}/image`,
    icon: <ImageIcon className="size-5" />,
  },
  {
    title: "Audio Optimizer",
    description: "Convert and compress audio files. Supports MP3, OGG, AAC, OPUS with bitrate control.",
    href: `${base}/audio`,
    icon: <AudioLinesIcon className="size-5" />,
  },
];

export function ToolGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tools.map((tool) => (
        <ToolCard key={tool.href} {...tool} />
      ))}
    </div>
  );
}
