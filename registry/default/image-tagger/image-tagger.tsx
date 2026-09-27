"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface ImageTag {
  /** stable id, used to keep the active badge and each badge apart */
  id: string;
  label: string;
  /** 0–1 fractions of the image, so a tag survives any rendered size */
  x: number | null;
  y: number | null;
}

export interface ImageTaggerProps {
  src: string;
  alt?: string;
  tags: ImageTag[];
  onTagsChange: (tags: ImageTag[]) => void;
  className?: string;
}

/** Pointer position inside `el` as 0..1 fractions, clamped and rounded. */
function pointFromEvent(e: { clientX: number; clientY: number }, el: Element) {
  const r = el.getBoundingClientRect();
  const f = (v: number) => Math.min(1, Math.max(0, Math.round(v * 1000) / 1000));
  return { x: f((e.clientX - r.left) / r.width), y: f((e.clientY - r.top) / r.height) };
}

/**
 * Marks a point on an image with a labeled badge. Click the photo to move the
 * active badge there, drag a badge to nudge it, × to take one back off (it stays
 * in `tags`, unplaced, and becomes active again). Positions are stored as
 * fractions of the image, so they hold at any size.
 *
 * Usually used on one photo that shows several options (a picture with both a
 * circle and a square in it) — the badges tell the customer which is which.
 */
export function ImageTagger({ src, alt = "", tags, onTagsChange, className = "" }: ImageTaggerProps) {
  const [activeId, setActiveId] = useState<string | null>(tags[0]?.id ?? null);
  // the active badge, falling back to the first one when the picked id is gone
  const active = tags.find((t) => t.id === activeId) ?? tags[0] ?? null;

  const move = (id: string, p: { x: number; y: number }) =>
    onTagsChange(tags.map((t) => (t.id === id ? { ...t, ...p } : t)));

  return (
    <div
      className={`relative w-full cursor-crosshair select-none overflow-hidden rounded-lg border ${className}`}
      onClick={(e) => {
        if (!active) return;
        move(active.id, pointFromEvent(e, e.currentTarget));
        // Move on to the next badge that hasn't been placed yet.
        const next = tags.find((t) => t.id !== active.id && t.x === null);
        if (next) setActiveId(next.id);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-auto w-full" draggable={false} />

      {tags.map((tag) =>
        tag.x === null || tag.y === null ? null : (
          <span
            key={tag.id}
            className="absolute flex cursor-grab touch-none items-center gap-1 rounded-full border border-accent-foreground bg-accent py-1 pl-2.5 pr-1 text-accent-foreground shadow-sm active:cursor-grabbing"
            style={{ left: `${tag.x * 100}%`, top: `${tag.y * 100}%`, transform: "translate(-50%, -50%)" }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              setActiveId(tag.id);
            }}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
              move(tag.id, pointFromEvent(e, e.currentTarget.parentElement!));
            }}
          >
            <span className="text-xs font-semibold whitespace-nowrap sm:text-sm">{tag.label}</span>
            <button
              type="button"
              aria-label={`Remove ${tag.label} tag from the image`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                // Take the badge off the image but keep the tag, so it can be
                // placed again later. Dropping it from `tags` is the caller's
                // job — the list belongs to them.
                onTagsChange(tags.map((t) => (t.id === tag.id ? { ...t, x: null, y: null } : t)));
                setActiveId(tag.id);
              }}
              className="flex size-4 items-center justify-center rounded-full opacity-60 transition-opacity hover:bg-accent-foreground/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <X className="size-3" />
            </button>
          </span>
        ),
      )}

      {active && (
        <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-foreground/80 px-2.5 py-1 text-xs text-background">
          {active.x === null
            ? `Click the photo to place ${active.label}`
            : `Click to move ${active.label}`}
        </p>
      )}
    </div>
  );
}
