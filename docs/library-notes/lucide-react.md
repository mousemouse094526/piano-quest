# lucide-react

**Kind:** library

**Version:** 1.70.0

**Docs:** https://lucide.dev/llms.txt

## Best practices

- Import icons by name from the package root (`import { Timer } from 'lucide-react'`). It is ES modules and tree-shakes, so only imported icons ship — [Getting started › Importing your first icon](https://lucide.dev/guide/react/getting-started)
- The props are `size` (24), `color` (`currentColor`), `strokeWidth` (2) and `nonScalingStroke`. Any SVG attribute also passes through — [Getting started › Props](https://lucide.dev/guide/react/getting-started)
- Icons render with `aria-hidden="true"` by default, which is right for decorative icons — [Accessibility (React)](https://lucide.dev/guide/react/advanced/accessibility)
- Only an icon that carries meaning on its own gets a name, either `aria-label` or a `<title>` child. Giving it a name removes `aria-hidden` — [Accessibility (React) › Making an icon accessible](https://lucide.dev/guide/react/advanced/accessibility)
- An icon button gets its accessible name on the button, not on the icon — [Accessibility (React) › Accessible icon buttons](https://lucide.dev/guide/react/advanced/accessibility)
- Show visible text beside icons. The clickable wrapper should be at least 44 by 44 px, and color must not be the only cue — [Accessibility in depth](https://lucide.dev/how-to/accessibility)
- **Avoid:** giving decorative icons a label, and leaving clickable icons outside a focusable element — [Accessibility in depth](https://lucide.dev/how-to/accessibility)

## Pattern

```tsx
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RestartButton({ onRestart }: { onRestart: () => void }) {
  return (
    <Button onClick={onRestart} className="min-h-11 min-w-11">
      <RotateCcw />
      เริ่มใหม่
    </Button>
  );
}
```

Follows [Accessibility (React)](https://lucide.dev/guide/react/advanced/accessibility). The icon stays hidden, and the visible text names the button.

## Traps

- Both `aria-label` on the icon and on its button gives screen readers two names. Label only the button — [Accessibility (React) › Accessible icon buttons](https://lucide.dev/guide/react/advanced/accessibility)
- `DynamicIcon` (load by name) is not recommended. It imports every icon at build time and splits each into its own module, which adds network requests. Prefer static imports — [Dynamic Icon Component › Caveats](https://lucide.dev/guide/react/advanced/dynamic-icon-component)
- `shadcn init` also adds `lucide-react`, with a caret range. Keep one pinned version in `package.json` — [shadcn.md](shadcn.md)

## Sources

- [Getting started (React)](https://lucide.dev/guide/react/getting-started) — imports, tree-shaking, props (accessed 2026-11-07)
- [Accessibility (React)](https://lucide.dev/guide/react/advanced/accessibility) — `aria-hidden` default, labels, icon buttons (accessed 2026-11-07)
- [Accessibility in depth](https://lucide.dev/how-to/accessibility) — visible labels, target size, contrast (accessed 2026-11-07)
- [Dynamic Icon Component](https://lucide.dev/guide/react/advanced/dynamic-icon-component) — dynamic loading caveats (accessed 2026-11-07)
