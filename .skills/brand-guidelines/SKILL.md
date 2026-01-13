---
name: brand-guidelines
description: OpenNotify brand identity - Blue/purple tech theme for unified notification API platform
---

# OpenNotify Brand Guidelines

## Brand Identity

**Product:** OpenNotify — Unified notification API for Uzbekistan/Central Asia
**Mood:** Professional, reliable, technical, developer-friendly
**Theme:** Communication/Tech with multi-channel visualization

## Color Palette

### Primary Colors (Blue - Reliability)
| Name | HEX | Usage |
|------|-----|-------|
| primary-50 | #EFF6FF | Light backgrounds |
| primary-100 | #DBEAFE | Hover backgrounds |
| primary-200 | #BFDBFE | Borders |
| primary-300 | #93C5FD | Light accents |
| primary-400 | #60A5FA | Highlights |
| primary-500 | #3B82F6 | Secondary blue |
| primary-600 | #2563EB | **Primary DEFAULT** |
| primary-700 | #1D4ED8 | Hover states |
| primary-800 | #1E40AF | Active states |
| primary-900 | #1E3A8A | Dark accents |
| primary-950 | #172554 | Darkest |

### Accent Colors (Violet - Innovation)
| Name | HEX | Usage |
|------|-----|-------|
| accent-50 | #F5F3FF | Light backgrounds |
| accent-100 | #EDE9FE | Hover backgrounds |
| accent-200 | #DDD6FE | Borders |
| accent-300 | #C4B5FD | Light accents |
| accent-400 | #A78BFA | Highlights |
| accent-500 | #8B5CF6 | Secondary violet |
| accent-600 | #7C3AED | **Accent DEFAULT** |
| accent-700 | #6D28D9 | Hover states |
| accent-800 | #5B21B6 | Active states |
| accent-900 | #4C1D95 | Dark accents |
| accent-950 | #2E1065 | Darkest |

### Semantic Colors
| Name | HEX | Usage |
|------|-----|-------|
| success | #10B981 | Success, delivered |
| warning | #F59E0B | Pending, warnings |
| error | #EF4444 | Failed, errors |

### Channel Colors (for visualization)
| Channel | Color | HEX |
|---------|-------|-----|
| SMS | Green | #10B981 |
| Telegram | Blue | #0088CC |
| Email | Gray | #6B7280 |
| Push | Orange | #F59E0B |
| WhatsApp | Green | #25D366 |

## Typography

| Element | Font | Fallback |
|---------|------|----------|
| UI text | Inter | system-ui, sans-serif |
| Code | JetBrains Mono | monospace |

### CSS Variables
```css
--font-sans: var(--font-inter), system-ui, sans-serif;
--font-mono: var(--font-jetbrains), monospace;
```

## Animations

| Name | Duration | Usage |
|------|----------|-------|
| fade-in | 0.5s ease-out | Fade effects |
| slide-up | 0.5s ease-out | Entry animations |
| marquee | 30s linear infinite | Scrolling content |

## Usage Rules

1. **Blue for primary actions** — Trust, reliability
2. **Violet for premium/advanced** — Innovation, API features
3. **Channel colors consistent** — Each channel has its color
4. **Code-friendly styling** — Developer documentation focus
5. **Dark mode support** — Developers prefer dark themes
6. **Minimal, clean design** — Focus on functionality

## Button Styles

| Type | Background | Text | Border |
|------|------------|------|--------|
| Primary | primary-600 | white | none |
| Secondary | accent-600 | white | none |
| Outline | transparent | primary-600 | primary-600 |
| Ghost | transparent | gray-700 | gray-300 |

## Card Styles

```css
/* API card */
background: white;
border-radius: 0.75rem;
border: 1px solid #E5E7EB;
box-shadow: 0 1px 3px rgba(0,0,0,0.1);

/* Code block */
background: #1F2937;
border-radius: 0.5rem;
font-family: var(--font-mono);
```

## Gradients

```css
/* Primary gradient */
background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);

/* Header gradient */
background: linear-gradient(90deg, #1E3A8A 0%, #4C1D95 100%);
```

## Status Indicators

| Status | Color | Icon |
|--------|-------|------|
| Sent | primary-600 | arrow-up |
| Delivered | success | check |
| Failed | error | x |
| Pending | warning | clock |
| Queued | gray | queue |
