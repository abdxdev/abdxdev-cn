"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Palette, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  findColorHex,
  loadColorNameIndex,
  searchColorNames,
  suggestColorNames,
  type ColorNameIndex,
} from "@/lib/color-name-lookup";
import "./color-picker.css";

const SEARCH_LIMIT = 30;
const DEFAULT_HEX = "#808080"; // where the spectrum starts when a value has no known color

function NameChip({
  name,
  hex,
  onClick,
}: {
  name: string;
  hex: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={name}
      className="flex h-8 min-w-0 items-center gap-1.5 rounded-md border border-border bg-background px-2 text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        className="size-3 shrink-0 rounded-full border border-black/15"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <span className="truncate">{name}</span>
    </button>
  );
}

/**
 * Replaces a text input for a color. The button shows the current color name;
 * opening it lets you either pick a shade and tap one of the closest real
 * color names, or search the names directly. The name list (~200 KB) is only
 * downloaded the first time the popover opens.
 */
export interface ColorPickerProps {
  /** the current color name, shown on the trigger */
  value: string;
  /** the exact color saved for this value, if any */
  hex?: string | null;
  /** called with the chosen name and its color */
  onPick: (name: string, hex: string) => void;
  /** how many closest names to suggest; the box holds 6 (3 rows of 2) before scrolling */
  maxSuggestions?: number;
  /** disables the swatch trigger */
  disabled?: boolean;
}

export function ColorPicker({
  value,
  hex: savedHex,
  onPick,
  maxSuggestions = 6,
  disabled,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  // What the user has dragged to since opening (null = still on the value's own color)
  const [dragHex, setDragHex] = useState<string | null>(null);
  // Suggestions follow this, which trails `dragHex` while the color is being
  // dragged, so the name list holds still instead of flickering.
  const [settledDrag, setSettledDrag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<{ name: string; hex: string } | null>(null);
  const [index, setIndex] = useState<ColorNameIndex | null>(null);
  const [failed, setFailed] = useState(false);
  // The full name list is only fetched once the search box is used
  const [wantFull, setWantFull] = useState(false);
  const [fullIndex, setFullIndex] = useState<ColorNameIndex | null>(null);

  useEffect(() => {
    if (dragHex === null) return;
    const timer = setTimeout(() => setSettledDrag(dragHex), 150);
    return () => clearTimeout(timer);
  }, [dragHex]);

  useEffect(() => {
    if (!open || index) return;
    let alive = true;
    loadColorNameIndex()
      .then((loaded) => {
        if (!alive) return;
        setIndex(loaded);
        setFailed(false);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [open, index]);

  useEffect(() => {
    if (!open || !wantFull || fullIndex) return;
    let alive = true;
    // if this fails, search quietly keeps using the curated list
    loadColorNameIndex("all")
      .then((loaded) => alive && setFullIndex(loaded))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [open, wantFull, fullIndex]);

  const searching = query.trim() !== "";
  const searchIndex = fullIndex ?? index;

  // The spectrum always starts on the color of the current value: the name
  // just picked, or otherwise that name's color from the list.
  const known = savedHex ??
    (picked?.name === value
      ? picked.hex
      : value && searchIndex
        ? findColorHex(searchIndex, value)
        : null);
  const hex = dragHex ?? known ?? DEFAULT_HEX;
  const settledHex = settledDrag ?? hex;
  const pending = hex !== settledHex;
  // Only the saved color counts: it is exactly what the storefront paints.
  const dot = savedHex;

  const closest = index && !searching ? suggestColorNames(index, settledHex, Math.max(0, maxSuggestions)) : [];
  // searching the full list takes a few ms; deferring keeps typing snappy
  const deferredQuery = useDeferredValue(query);
  const matches =
    searchIndex && searching ? searchColorNames(searchIndex, deferredQuery, SEARCH_LIMIT) : [];
  const shown = searching ? matches : closest;

  function pick(name: string, chipHex: string) {
    onPick(name, chipHex);
    setPicked({ name, hex: chipHex });
    setDragHex(null);
    setSettledDrag(null);
    setQuery("");
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setDragHex(null);
          setSettledDrag(null);
        } else {
          setQuery("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          title={value || "Pick a color"}
          aria-label={value ? `Color: ${value}. Change color` : "Pick a color"}
        >
          {dot ? (
            <span className="size-5 rounded-full" style={{ backgroundColor: dot }} aria-hidden />
          ) : (
            <Palette className="size-4 text-muted-foreground" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="color-name-picker w-64 gap-3 p-3 ring-0">
        <HexColorPicker color={hex} onChange={setDragHex} />

        <div className="flex items-center gap-2">
          <span
            className="size-8 shrink-0 rounded-md border border-border"
            style={{ backgroundColor: hex }}
            aria-hidden
          />
          <HexColorInput
            color={hex}
            onChange={setDragHex}
            prefixed
            aria-label="Hex color"
            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 font-mono text-sm uppercase outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>

        <div className="space-y-1.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setWantFull(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (matches[0]) pick(matches[0].name, matches[0].hex);
                }
              }}
              placeholder="Search color names…"
              aria-label="Search color names"
              className="h-8 pl-8 pr-8 text-sm"
            />
            {searching && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {!searching
              ? "Closest names — tap one to use it"
              : !searchIndex
                ? "Searching…"
                : matches.length === 0
                  ? "No matches"
                  : `${matches.length === SEARCH_LIMIT ? `${SEARCH_LIMIT}+` : matches.length} matches — Enter or tap to use`}
          </p>

          {/* fixed height (3 rows of 2): the popover never resizes; long
              search results scroll inside the box */}
          <div className="h-31 overflow-y-auto rounded-lg border border-border bg-muted/30 p-2">
            {failed ? (
              <p className="text-xs text-destructive">
                Couldn&apos;t load color names. Close and reopen to retry.
              </p>
            ) : !index ? (
              <p className="text-xs text-muted-foreground">Loading names…</p>
            ) : searching && matches.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nothing matches &ldquo;{query.trim()}&rdquo;. Try a shorter word.
              </p>
            ) : (
              <div
                className={`grid grid-cols-2 content-start gap-1.5 transition-opacity duration-150 ${
                  !searching && pending ? "opacity-50" : ""
                }`}
              >
                {shown.map((s, i) => (
                  <NameChip key={i} name={s.name} hex={s.hex} onClick={() => pick(s.name, s.hex)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
