"use client";

import { useState } from "react";
import { ImageTagger, type ImageTag } from "@/../registry/default/image-tagger/image-tagger";

// One photo, three shape variants — the case badges exist for.
const SRC = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480">
  <rect width="800" height="480" fill="#f7f2ec"/>
  <g fill="#8b3a62">
    <circle cx="180" cy="240" r="85"/>
    <rect x="315" y="155" width="170" height="170" rx="22"/>
    <path d="M565 325 L665 165 L765 325 Z"/>
  </g>
</svg>`,
)}`;

const INITIAL: ImageTag[] = [
  { id: "circle", label: "Circle", x: null, y: null },
  { id: "square", label: "Square", x: null, y: null },
  { id: "triangle", label: "Triangle", x: null, y: null },
];

export function ImageTaggerDemo() {
  const [tags, setTags] = useState<ImageTag[]>(INITIAL);

  return (
    <div className="space-y-3 p-8">
      <p className="text-xs text-fd-muted-foreground">
        Click the photo to drop the active badge, drag one to move it, × to take one back off.
      </p>

      <ImageTagger
        src={SRC}
        alt="A circle, a square and a triangle"
        tags={tags}
        onTagsChange={setTags}
        className="mx-auto max-w-md"
      />

      <div className="flex justify-center gap-3">
        <button
          onClick={() => setTags(INITIAL)}
          className="text-xs text-fd-muted-foreground underline underline-offset-2 transition-colors hover:text-fd-foreground"
        >
          reset
        </button>
        <span className="text-xs text-fd-muted-foreground">
          {tags.filter((t) => t.x !== null).length}/{tags.length} placed
        </span>
      </div>
    </div>
  );
}
