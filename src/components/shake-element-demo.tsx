"use client";

import { useRef } from "react";
import { ShakeElement, ShakeHandle } from "@/../registry/default/shake-element/shake-element";

export function ShakeElementDemo() {
  const cardRef = useRef<ShakeHandle>(null);
  const badgeRef = useRef<ShakeHandle>(null);
  const buttonRef = useRef<ShakeHandle>(null);

  return (
    <div className="flex flex-col items-center gap-6 p-8">

      {/* wrong password card */}
      <ShakeElement ref={cardRef} className="w-full max-w-sm rounded-lg border p-5 space-y-3">
        <p className="text-sm font-medium">Wrong password</p>
        <p className="text-xs text-fd-muted-foreground">
          Click the button to simulate a failed login shake.
        </p>
        <button
          onClick={() => cardRef.current?.shake()}
          className="w-full rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-fd-accent transition-colors"
        >
          Shake card
        </button>
      </ShakeElement>

      <div className="flex items-center gap-4">
        {/* badge */}
        <ShakeElement ref={badgeRef}>
          <span className="rounded-full border px-3 py-1 text-xs text-fd-muted-foreground cursor-pointer select-none">
            badge
          </span>
        </ShakeElement>
        <button
          onClick={() => badgeRef.current?.shake()}
          className="text-xs text-fd-muted-foreground underline underline-offset-2 hover:text-fd-foreground transition-colors"
        >
          shake badge
        </button>

        <div className="w-px h-4 bg-fd-border" />

        {/* button shaking itself */}
        <ShakeElement ref={buttonRef}>
          <button
            onClick={() => buttonRef.current?.shake()}
            className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-fd-accent transition-colors"
          >
            Shake me
          </button>
        </ShakeElement>
      </div>

    </div>
  );
}