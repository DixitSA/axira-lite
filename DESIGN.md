---
name: Axira Lite
description: Precision operations for small contractor businesses.
colors:
  primary: "#2563eb"
  neutral-bg: "#f9fafb"
  neutral-text: "#111827"
  status-scheduled: "#dbeafe"
  status-pending: "#fef3c7"
  status-completed: "#dcfce7"
  status-overdue: "#fee2e2"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  md: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "20px"
---

# Design System: Axira Lite

## 1. Overview

**Creative North Star: "The Precision Cockpit"**

Axira Lite is a high-density, functional environment designed for operational speed. It rejects the "softness" of modern consumer SaaS in favor of a rigid, geometric aesthetic that feels like a professional tool. Every pixel serves a purpose, and visual decoration is stripped away to ensure that data and action are the primary focus.

**Key Characteristics:**
- High information density without clutter.
- Rigid 8px grid alignment.
- Zero gradients or shadows at rest.
- Semantic color use (color = meaning).

## 2. Colors

The palette is anchored by a confident "Operational Blue" that signals reliability and precision.

### Primary
- **Operational Blue** (#2563eb): Used for primary actions, navigation state, and brand accents.

### Neutral
- **Slate Background** (#f9fafb): The default canvas for the dashboard.
- **Ink Text** (#111827): High-contrast text for maximum legibility.
- **Subtle Border** (#e5e7eb): Used for layout structure and table dividers.

### Named Rules
**The Rarity Rule.** The primary accent is used on ≤10% of any given screen. Its rarity makes it an immediate target for the user's eye.

## 3. Typography

**Display Font:** Inter
**Body Font:** Inter

The system uses a single sans-serif family to maintain a utilitarian, "stock" feel that doesn't distract from the data.

### Hierarchy
- **Display** (700, 2.25rem, 1.2): Page titles and major KPIs.
- **Body** (400, 0.875rem, 1.5): The workhorse for tables and lists.
- **Label** (600, 0.75rem, normal, uppercase): Used for small headers and meta-data.

## 4. Elevation

Axira Lite is a flat-by-default system. Depth is conveyed through tonal layering and borders rather than shadows.

### Named Rules
**The Surface separation Rule.** Overlays like Modals and the Sidebar use subtle shadows (0 10px 15px -3px rgb(0 0 0 / 0.1)) to separate from the background, but all core UI cards remain flat.

## 5. Components

Components are tactile and confident, with clear state transitions and generous hit targets.

### Buttons
- **Shape:** Rounded-lg (8px)
- **Primary:** Operational Blue with white text.
- **Hover:** Darkens slightly to signal interaction.

### Cards
- **Corner Style:** Rounded-lg (8px)
- **Background:** Pure white (#ffffff)
- **Shadow Strategy:** Flat, defined by a 1px slate-200 border.

### Status Badges
- **Style:** Light tinted backgrounds with saturated text colors to provide a "color-coded" glance at health and progress.

## 6. Do's and Don'ts

### Do:
- **Do** use strict 8px spacing multiples for all layout gaps.
- **Do** ensure all text has a contrast ratio of at least 4.5:1.
- **Do** keep information density high in data tables.

### Don't:
- **Don't** use border-left greater than 1px as a colored stripe on cards.
- **Don't** use background gradients or text gradients.
- **Don't** add shadows to buttons or standard dashboard cards.
- **Don't** use em dashes in UI copy.
