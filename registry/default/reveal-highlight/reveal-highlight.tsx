"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import "./reveal-highlight.css";

export interface RevealHighlightContextValue {
  enabled: boolean;
  intensity: number;
  radius: number;
  setEnabled: (enabled: boolean) => void;
  setIntensity: (intensity: number) => void;
  setRadius: (radius: number) => void;
  toggle: () => void;
}

const RevealHighlightContext = createContext<RevealHighlightContextValue>({
  enabled: true,
  intensity: 1,
  radius: 200,
  setEnabled: () => { },
  setIntensity: () => { },
  setRadius: () => { },
  toggle: () => { },
});

export const useRevealHighlight = () => useContext(RevealHighlightContext);

const ATTR = "data-reveal";

const SKIP = new Set([
  "HTML", "BODY", "HEAD", "SCRIPT", "STYLE", "LINK",
  "META", "TITLE", "NOSCRIPT", "TEMPLATE",
  "SVG", "PATH", "G", "CIRCLE", "RECT", "LINE", "POLYLINE", "POLYGON",
]);

function isBorderVisible(w: string, s: string, c: string) {
  if (parseFloat(w) <= 0 || s === "none" || s === "hidden" || c === "transparent") return false;
  const p = c.match(/[\d.]+/g);
  return !(p && p.length === 4 && parseFloat(p[3]) === 0);
}

function sync(el: Element, tracked: Set<HTMLElement>): boolean {
  if (SKIP.has(el.tagName)) return false;

  const cs = getComputedStyle(el);
  if (cs.position === "fixed" || cs.position === "sticky") return false;

  const t = isBorderVisible(cs.borderTopWidth, cs.borderTopStyle, cs.borderTopColor);
  const r = isBorderVisible(cs.borderRightWidth, cs.borderRightStyle, cs.borderRightColor);
  const b = isBorderVisible(cs.borderBottomWidth, cs.borderBottomStyle, cs.borderBottomColor);
  const l = isBorderVisible(cs.borderLeftWidth, cs.borderLeftStyle, cs.borderLeftColor);

  const html = el as HTMLElement;

  if (!(t || r || b || l)) {
    // console.log("Not tracked:", el.tagName, { w: cs.borderTopWidth, s: cs.borderTopStyle, c: cs.borderTopColor });
    if (tracked.has(html)) {
      el.removeAttribute(ATTR);
      if (html.style.position === "relative") html.style.removeProperty("position");
      html.style.removeProperty("--reveal-pt");
      html.style.removeProperty("--reveal-pr");
      html.style.removeProperty("--reveal-pb");
      html.style.removeProperty("--reveal-pl");
      tracked.delete(html);
    }
    return false;
  }

  // console.log("Tracked:", el.tagName);
  el.setAttribute(ATTR, t && r && b && l ? "full" : "partial");
  if (cs.position === "static") html.style.setProperty("position", "relative");
  html.style.setProperty("--reveal-pt", t ? "1px" : "0px");
  html.style.setProperty("--reveal-pr", r ? "1px" : "0px");
  html.style.setProperty("--reveal-pb", b ? "1px" : "0px");
  html.style.setProperty("--reveal-pl", l ? "1px" : "0px");
  tracked.add(html);
  return true;
}

function syncTree(root: Element | Document, tracked: Set<HTMLElement>) {
  const it = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
  let n: Node | null;
  while ((n = it.nextNode())) sync(n as Element, tracked);
}

export function RevealHighlightProvider({
  children,
  defaultEnabled = true,
  defaultIntensity = 1,
  defaultRadius = 200,
}: {
  children: React.ReactNode;
  defaultEnabled?: boolean;
  defaultIntensity?: number;
  defaultRadius?: number;
}) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [intensity, setIntensityRaw] = useState(defaultIntensity);
  const [radius, setRadiusRaw] = useState(defaultRadius);
  const setIntensity = useCallback((v: number) => setIntensityRaw(Math.max(0, Math.min(1, v))), []);
  const setRadius = useCallback((v: number) => setRadiusRaw(Math.max(0, v)), []);
  const toggle = useCallback(() => setEnabled((v) => !v), []);
  const ctx = useMemo(
    () => ({ enabled, intensity, radius, setEnabled, setIntensity, setRadius, toggle }),
    [enabled, intensity, radius, setIntensity, setRadius, toggle],
  );

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.style.setProperty("--reveal-intensity", String(intensity));
    return () => { rootRef.current?.style.removeProperty("--reveal-intensity"); };
  }, [intensity]);

  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.style.setProperty("--reveal-radius", `${radius}px`);
    return () => { rootRef.current?.style.removeProperty("--reveal-radius"); };
  }, [radius]);

  useEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;
    const tracked = new Set<HTMLElement>();

    const scanId = (globalThis.requestIdleCallback ?? setTimeout)(() =>
      syncTree(root, tracked)
    );

    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === Node.ELEMENT_NODE) syncTree(n as Element, tracked);
          });
          m.removedNodes.forEach((n) => {
            if (n.nodeType === Node.ELEMENT_NODE) {
              const it = document.createNodeIterator(n, NodeFilter.SHOW_ELEMENT);
              let node: Node | null;
              while ((node = it.nextNode())) tracked.delete(node as HTMLElement);
            }
          });
        } else if (m.type === "attributes" && m.attributeName !== ATTR) {
          sync(m.target as Element, tracked);
        }
      }
    });

    obs.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      obs.disconnect();
      (globalThis.cancelIdleCallback ?? clearTimeout)(scanId as number);
      tracked.clear();
    };
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;

    if (!enabled) {
      root.querySelectorAll<HTMLElement>(`[${ATTR}]`).forEach((el) => {
        el.style.removeProperty("--mouse-x");
        el.style.removeProperty("--mouse-y");
      });
      return;
    }

    const els = new Set(root.querySelectorAll<HTMLElement>(`[${ATTR}]`));

    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "attributes") {
          if (m.attributeName === ATTR) {
            const el = m.target as HTMLElement;
            if (el.hasAttribute(ATTR)) els.add(el);
            else els.delete(el);
          }
          continue;
        }
        if (m.type !== "childList") continue;
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement && n.hasAttribute(ATTR)) els.add(n);
          (n as Element).querySelectorAll?.(`[${ATTR}]`).forEach((c) => els.add(c as HTMLElement));
        });
        m.removedNodes.forEach((n) => {
          if (n instanceof HTMLElement) els.delete(n);
          (n as Element).querySelectorAll?.(`[${ATTR}]`).forEach((c) => els.delete(c as HTMLElement));
        });
      }
    });
    obs.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: [ATTR] });

    let raf: number | null = null;

    const onMove = (e: MouseEvent) => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        els.forEach((el) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
          el.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
        });
        raf = null;
      });
    };

    const onLeave = () => {
      els.forEach((el) => {
        el.style.removeProperty("--mouse-x");
        el.style.removeProperty("--mouse-y");
      });
    };

    root.addEventListener("mousemove", onMove);
    root.addEventListener("mouseleave", onLeave);

    return () => {
      obs.disconnect();
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseleave", onLeave);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return (
    <RevealHighlightContext.Provider value={ctx}>
      <div ref={rootRef} style={{ display: "contents" }}>
        {children}
      </div>
    </RevealHighlightContext.Provider>
  );
}