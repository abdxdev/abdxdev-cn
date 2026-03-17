"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RevealHighlightProvider, useRevealHighlight } from "@/../registry/default/reveal-highlight/reveal-highlight";
import { RevealHighlightDemo } from "./reveal-highlight-demo";

// ─── token components ────────────────────────────────────────────────────────

function Kw({ c }: { c: string }) { return <span className="text-[#cf8dfb]">{c}</span>; }
function Str({ c }: { c: string }) { return <span className="text-[#79c0ff]">"{c}"</span>; }
function Tag({ c }: { c: string }) { return <span className="text-[#7ee787]">{c}</span>; }
function Attr({ c }: { c: string }) { return <span className="text-[#ffa657]">{c}</span>; }
function Val({ c }: { c: string }) { return <span className="text-[#79c0ff]">{c}</span>; }
function Pt({ c }: { c: string }) { return <span className="text-fd-muted-foreground">{c}</span>; }
function Line({ indent = 0, children }: { indent?: number; children?: React.ReactNode }) {
  return (
    <div className="leading-6">
      {indent > 0 && <span>{" ".repeat(indent * 2)}</span>}
      {children}
    </div>
  );
}

// ─── live code snippet ───────────────────────────────────────────────────────

function buildRaw(enabled: boolean, intensity: number, radius: number) {
  const props: string[] = [];
  if (!enabled)        props.push(`defaultEnabled={false}`);
  if (intensity !== 1) props.push(`defaultIntensity={${intensity}}`);
  if (radius !== 200)  props.push(`defaultRadius={${radius}}`);

  const inner = `  {children}`;
  if (props.length === 0) {
    return `import { RevealHighlightProvider } from "@/components/reveal-highlight";\n\n<RevealHighlightProvider>\n${inner}\n</RevealHighlightProvider>`;
  }
  return `import { RevealHighlightProvider } from "@/components/reveal-highlight";\n\n<RevealHighlightProvider\n  ${props.join("\n  ")}\n>\n${inner}\n</RevealHighlightProvider>`;
}

function LiveCodeSnippet({ enabled, intensity, radius }: { enabled: boolean; intensity: number; radius: number }) {
  const [copied, setCopied] = useState(false);

  const props: Array<{ name: string; value: string }> = [];
  if (!enabled)        props.push({ name: "defaultEnabled",   value: "false" });
  if (intensity !== 1) props.push({ name: "defaultIntensity", value: String(intensity) });
  if (radius !== 200)  props.push({ name: "defaultRadius",    value: String(radius) });
  const hasProps = props.length > 0;

  function copy() {
    navigator.clipboard.writeText(buildRaw(enabled, intensity, radius)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="border-t">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-fd-muted/20">
        <span className="text-xs font-mono text-fd-muted-foreground">usage</span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors"
        >
          {copied
            ? <><Check className="size-3.5 text-green-500" /><span className="text-green-500">Copied</span></>
            : <><Copy className="size-3.5" />Copy</>}
        </button>
      </div>
      <pre className="overflow-x-auto px-5 py-4 text-xs font-mono bg-fd-card/50 m-0">
        <Line>
          <Kw c="import" /> <Pt c="{ " />RevealHighlightProvider<Pt c=" }" />
          <Kw c=" from " /><Str c="@/components/reveal-highlight" /><Pt c=";" />
        </Line>
        <Line />
        {hasProps ? <>
          <Line><Pt c="<" /><Tag c="RevealHighlightProvider" /></Line>
          {props.map((p) => (
            <Line key={p.name} indent={1}>
              <Attr c={p.name} /><Pt c="={" /><Val c={p.value} /><Pt c="}" />
            </Line>
          ))}
          <Line><Pt c=">" /></Line>
        </> : (
          <Line><Pt c="<" /><Tag c="RevealHighlightProvider" /><Pt c=">" /></Line>
        )}
        <Line indent={1}><Pt c="{" /><Val c="children" /><Pt c="}" /></Line>
        <Line><Pt c="</" /><Tag c="RevealHighlightProvider" /><Pt c=">" /></Line>
      </pre>
    </div>
  );
}

// ─── provider sync ───────────────────────────────────────────────────────────

function ProviderSync({ enabled, intensity, radius }: { enabled: boolean; intensity: number; radius: number }) {
  const { setEnabled, setIntensity, setRadius } = useRevealHighlight();
  useEffect(() => { setEnabled(enabled); }, [enabled]);
  useEffect(() => { setIntensity(intensity); }, [intensity]);
  useEffect(() => { setRadius(radius); }, [radius]);
  return null;
}

// ─── controls ────────────────────────────────────────────────────────────────

function PlaygroundControls({
  enabled, setEnabled, intensity, setIntensity, radius, setRadius,
}: {
  enabled: boolean; setEnabled: (v: boolean) => void;
  intensity: number; setIntensity: (v: number) => void;
  radius: number; setRadius: (v: number) => void;
}) {
  return (
    <div className="border-t bg-fd-muted/30 px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-4">
      <div className="flex items-center gap-2">
        <Switch id="reveal-enabled" checked={enabled} onCheckedChange={setEnabled} />
        <Label htmlFor="reveal-enabled" className="text-xs cursor-pointer">Effect</Label>
      </div>

      <div className="flex items-center gap-3">
        <Label className="text-xs text-fd-muted-foreground w-14 shrink-0">Intensity</Label>
        <Slider
          min={0} max={1} step={0.01}
          value={[intensity]}
          onValueChange={([v]) => setIntensity(v)}
          disabled={!enabled}
          className="w-28"
        />
        <span className="text-xs text-fd-muted-foreground tabular-nums w-8">
          {Math.round(intensity * 100)}%
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Label className="text-xs text-fd-muted-foreground w-14 shrink-0">Radius</Label>
        <Slider
          min={50} max={400} step={10}
          value={[radius]}
          onValueChange={([v]) => setRadius(v)}
          disabled={!enabled}
          className="w-28"
        />
        <span className="text-xs text-fd-muted-foreground tabular-nums w-10">
          {radius}px
        </span>
      </div>
    </div>
  );
}

// ─── public export ───────────────────────────────────────────────────────────

export function RevealHighlightPlayground() {
  const [enabled, setEnabled] = useState(true);
  const [intensity, setIntensity] = useState(1);
  const [radius, setRadius] = useState(200);

  return (
    <div className="rounded-xl border overflow-hidden not-prose">
      <RevealHighlightProvider>
        <ProviderSync enabled={enabled} intensity={intensity} radius={radius} />
        <RevealHighlightDemo />
      </RevealHighlightProvider>

      <PlaygroundControls
        enabled={enabled} setEnabled={setEnabled}
        intensity={intensity} setIntensity={setIntensity}
        radius={radius} setRadius={setRadius}
      />
      <LiveCodeSnippet enabled={enabled} intensity={intensity} radius={radius} />
    </div>
  );
}