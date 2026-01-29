# Styling & Design System

## Global Layout Constraint (`max-w-[430px]`)
The entire application is wrapped in a container that simulates a mobile viewport.
- **Desktop:** The container is centered with a shadow.
- **Mobile:** The container is 100% width.
- **Implication:** All fixed-position elements (headers, bottom navigation, modals) must be designed to fit within this width.

## Glassmorphism
The project uses a "Glass" aesthetic for headers and floating elements.

### Standard Header Style
Headers (like `FeatureHeader`) typically use:
- `bg-white/60` (or similar transparency)
- `backdrop-blur-md`
- `rounded-[100px]` (Pill shape)
- `shadow-sm` or `shadow-md`

## Typography
- **Font Family:** `IBM Plex Sans Thai`
- **Variable:** `--font-ibm-plex`
- **Weights:** 100, 200, 300, 400, 500, 600, 700

## Iconography
We use **Lucide React** (`lucide-react`) as the primary icon set.
**React Icons** (`react-icons`) is used for specific icons not found in Lucide.

```tsx
import { Bell } from "lucide-react";

<Bell className="w-6 h-6 text-gray-600" />
```

## Tailwind CSS v4
We use Tailwind v4. Configuration is primarily in `src/app/globals.css` via CSS variables, rather than a `tailwind.config.js`.

### Custom Utilities
Check `src/app/globals.css` for custom utility classes or layer definitions.
