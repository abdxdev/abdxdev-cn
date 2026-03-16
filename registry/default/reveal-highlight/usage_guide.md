# Reveal Highlight — Usage Guide

## Installation

### Via shadcn registry

```bash
npx shadcn@latest add https://reveal-highlight.vercel.app/registry.json reveal-highlight
```

## Setup

```tsx
import { RevealHighlightProvider } from "@/components/reveal-highlight";

export default function RootLayout({ children }) {
  return (
    <RevealHighlightProvider>
      {children}
    </RevealHighlightProvider>
  );
}
```

**That's it.** Every element with a visible CSS border automatically gets the glow. No extra props, no wrappers.

---

## API — [useRevealHighlight()](file:///c:/Users/abdul/OneDrive%20-%20student.uet.edu.pk/Documents/abd_codespace/abdxdev/portfolio/registry/reveal-highlight.tsx#24-25)

```tsx
const { enabled, intensity, setEnabled, setIntensity, toggle } = useRevealHighlight();
```

| Property                                                                                                                                               | Type                                                                                                                                                                  | Description                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `enabled`                                                                                                                                              | `boolean`                                                                                                                                                             | Whether mouse glow is active                                 |
| `intensity`                                                                                                                                            | `number`                                                                                                                                                              | Glow strength `0–1` (drives `--reveal-intensity` on `:root`) |
| [setEnabled](file:///c:/Users/abdul/OneDrive%20-%20student.uet.edu.pk/Documents/abd_codespace/abdxdev/portfolio/registry/reveal-highlight.tsx#19-20)   | [(v: boolean) => void](file:///c:/Users/abdul/OneDrive%20-%20student.uet.edu.pk/Documents/abd_codespace/abdxdev/portfolio/src/components/reveal-highlight.tsx#57-134) | Set enabled state                                            |
| [setIntensity](file:///c:/Users/abdul/OneDrive%20-%20student.uet.edu.pk/Documents/abd_codespace/abdxdev/portfolio/registry/reveal-highlight.tsx#20-21) | [(v: number) => void](file:///c:/Users/abdul/OneDrive%20-%20student.uet.edu.pk/Documents/abd_codespace/abdxdev/portfolio/src/components/reveal-highlight.tsx#57-134)  | Set intensity (clamped 0–1)                                  |
| [toggle](file:///c:/Users/abdul/OneDrive%20-%20student.uet.edu.pk/Documents/abd_codespace/abdxdev/portfolio/registry/reveal-highlight.tsx#21-22)       | [() => void](file:///c:/Users/abdul/OneDrive%20-%20student.uet.edu.pk/Documents/abd_codespace/abdxdev/portfolio/src/components/reveal-highlight.tsx#57-134)           | Toggle enabled on/off                                        |

---

## Form Elements (input / textarea / select)

`::before`/`::after` pseudo-elements **don't work** on `<input>` and render unreliably on `<textarea>`/`<select>`. The component handles this automatically:

When a bordered form element is detected, an **overlay `<div>`** is injected as a sibling and positioned to cover the form element. The overlay supports `::before`, so the glow effect works identically.

**No extra markup needed** — it's fully automatic.

> [!NOTE]
> The overlay uses `position: absolute` relative to the form element's parent. The parent gets `position: relative` automatically if it was `static`.

---

## Glow Position — On Top of Border?

By default the glow renders **just inside** the border (inner edge of the padding box). This is the most reliable approach since it works with `overflow: hidden`.

To make the glow render **on top of** the actual border, override the `inset` in CSS:

```css
[data-reveal]::before {
  inset: -1px; /* extend outward by the border width */
}
```

This moves the pseudo-element to cover the border area. The mask then creates the glow at the outer edge of the border.

> [!WARNING]
> Negative `inset` will be **clipped** on elements with `overflow: hidden` or `overflow: auto`. The default `inset: 0` avoids this.

---

## Customization

### Glow radius & color

Override CSS variables on `:root` or `.dark`:

```css
:root {
  --reveal-color: rgba(0, 0, 0, 0.5);
  --reveal-surface: rgba(0, 0, 0, 0.03);
  --reveal-intensity: 1; /* set via provider, or override here */
}
```

### Per-element opt-out

Elements with `position: fixed` or `position: sticky` are always skipped. To opt out any element, ensure it has no visible borders, or add its tag to the `SKIP` set in the source.
