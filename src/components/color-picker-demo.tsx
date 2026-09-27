"use client";

import { useState } from "react";
import { ColorPicker } from "@/../registry/default/color-picker/color-picker";

const SLOTS = ["finish", "accent", "lining"] as const;

export function ColorPickerDemo() {
  const [colors, setColors] = useState<Record<string, { name: string; hex: string }>>({
    finish: { name: "Rose Quartz", hex: "#f7cac9" },
  });

  return (
    <div className="space-y-4 p-8">
      <p className="text-xs text-fd-muted-foreground">
        Pick a shade, then tap one of the closest real color names — or search all ~32,000.
      </p>

      <div className="flex flex-wrap gap-3">
        {SLOTS.map((slot) => (
          <div
            key={slot}
            className="flex items-center gap-2 rounded-lg border px-2 py-1.5 text-fd-muted-foreground"
          >
            <ColorPicker
              value={colors[slot]?.name ?? ""}
              hex={colors[slot]?.hex}
              onPick={(name, hex) => setColors((c) => ({ ...c, [slot]: { name, hex } }))}
            />
            <span className="text-xs capitalize">{colors[slot]?.name || `${slot} — pick`}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setColors({})}
        className="text-xs text-fd-muted-foreground underline underline-offset-2 transition-colors hover:text-fd-foreground"
      >
        reset
      </button>
    </div>
  );
}
