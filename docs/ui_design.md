# Premium Enterprise UI/UX Design System Documentation

This document describes the design decisions, component architecture, layout guidelines, and animation systems implemented in the redesigned **Tony Health Analysis Platform**.

---

## 1. Core Design System

### Color Palette (Inspired by Stripe, Linear, and Vercel)
We leverage standard CSS variables mapped to Tailwind CSS v4 colors:
- **Brand Primary (`#3b82f6` / `#60a5fa`):** Used for primary actions, gauges, highlights, and active sidebar items.
- **Brand Secondary (`#6366f1` / `#818cf8`):** Used for specialized secondary widgets, user chat bubbles, and gradient details.
- **Brand Accent (`#10b981` / `#34d399`):** Represents positive wellness markers, healthy statuses, and optimal trajectories.
- **Base Backgrounds:**
  - **Light Mode:** Slate background (`#f8fafc`) with card surfaces (`#ffffff`) and subtle borders (`#e2e8f0`).
  - **Dark Mode:** Deep blue-grey background (`#0b0f19`) with surface tiles (`#151c2c`) and borders (`#1e293b`).

### Typography & Spacing
- **Typography:** Using the **Inter** font family with a high-contrast hierarchy:
  - Headers: Extrabold / Black tracker style, tracking tight (`tracking-tight`).
  - Body: Semibold / Medium for UI text, ensuring high legibility and clear contrast.
- **8px Spacing System:** Grid margins, gutters, padding, and gaps are structured in increments of 8px (0.5rem, 1rem, 1.5rem, 2rem) for consistent alignment.
- **Large Rounded Cards:** Primary cards feature an outer radius of `1.5rem` (24px) or `1rem` (16px).

---

## 2. Shared Layout Primitives

We introduced a responsive dashboard layout wrapped in [Shell.jsx](file:///c:/Users/prash/OneDrive/Documents/Heart-AI-System/frontend/src/layouts/Shell.jsx):
1.  **Sidebar ([Sidebar.jsx](file:///c:/Users/prash/OneDrive/Documents/Heart-AI-System/frontend/src/layouts/Sidebar.jsx)):** Left navigation panel. Collapsible to 80px icons or expandable to 256px wide menu items.
2.  **Top Navigation ([TopNav.jsx](file:///c:/Users/prash/OneDrive/Documents/Heart-AI-System/frontend/src/layouts/TopNav.jsx)):** Header containing path-generated Breadcrumbs, a global search button showing the keyboard shortcut (Ctrl+K), and a profile dropdown.
3.  **Command Palette ([CommandPalette.jsx](file:///c:/Users/prash/OneDrive/Documents/Heart-AI-System/frontend/src/layouts/CommandPalette.jsx)):** Keyboard-accessible overlay triggered via `Ctrl+K` for instant command filtering and page routing.

---

## 3. Reusable UI Components

| Primitive Component | Location | Details |
|---|---|---|
| [Card.jsx](file:///c:/Users/prash/OneDrive/Documents/Heart-AI-System/frontend/src/components/Card.jsx) | `components/Card.jsx` | Rounded tile using spring hover micro-animations. |
| [Button.jsx](file:///c:/Users/prash/OneDrive/Documents/Heart-AI-System/frontend/src/components/Button.jsx) | `components/Button.jsx` | Interactive trigger with size and type variants, including a spinner. |
| [Badge.jsx](file:///c:/Users/prash/OneDrive/Documents/Heart-AI-System/frontend/src/components/Badge.jsx) | `components/Badge.jsx` | Small tag representing status (Success, Warning, Danger, Info). |
| [Modal.jsx](file:///c:/Users/prash/OneDrive/Documents/Heart-AI-System/frontend/src/components/Modal.jsx) | `components/Modal.jsx` | Backdrop-blurred overlay utilizing AnimatePresence. |
| [Input.jsx](file:///c:/Users/prash/OneDrive/Documents/Heart-AI-System/frontend/src/components/Input.jsx) | `components/Input.jsx` | Text input primitive with label and error mappings. |
| [StatCard.jsx](file:///c:/Users/prash/OneDrive/Documents/Heart-AI-System/frontend/src/components/StatCard.jsx) | `components/StatCard.jsx` | Displays numeric vitals (e.g. Heart Rate, Blood Pressure) with trend indicators. |

---

## 4. Animation Guidelines (Framer Motion)

We integrate Framer Motion to provide premium micro-interactions:
*   **Page Transitions:** Initial slide-up (`initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}`) to prevent abrupt jumps.
*   **Card Hover Effects:** Subtle scale up and drop shadow changes on active pointer hovers.
*   **Modal Overlays:** Elastic spring scaling for modal content, combined with soft fade transitions on backdrops.
