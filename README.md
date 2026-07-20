# Admin Dashboard

A reusable, bilingual (Arabic RTL / English LTR) admin dashboard built with **React + Vite +
TypeScript**, **Tailwind CSS**, and **shadcn/ui**-style components. It ships as a generic template —
a design system, layout shell, and data-driven widgets — that can be dropped into any project and
wired to a real API.

## Features

- **Bilingual & RTL-first** — Arabic/English toggle that flips `dir`, layout, and charts live (i18next).
- **Theming** — light/dark via CSS variables; re-theme the whole app by editing one token block.
- **Layout** — collapsible sidebar, sticky topbar, responsive shell.
- **Generic widgets** — KPI stat cards, area/bar/donut charts (Recharts), and a fully generic
  data table (sorting, global search, pagination) powered by TanStack Table.
- **Data-driven navigation** — edit one config file to change the menu.

## Stack

React 18 · Vite 5 · TypeScript · Tailwind CSS · Radix UI · TanStack Query & Table · Recharts ·
react-i18next · React Router.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

The dev server proxies `/api` to a backend on `http://localhost:5014` (see `vite.config.ts`).
Copy `.env.example` to `.env` to change the API base URL.

```bash
npm run build    # type-check + production build
npm run preview  # preview the build
```

## Structure

```
src/
  components/
    ui/          generic primitives (button, card, table, select, ...)
    layout/      sidebar, topbar, app shell, theme/language toggles
    dashboard/   reusable widgets: stat-card, chart-card, data-table, page-header
  config/        data-driven navigation
  i18n/          i18next setup + ar/en locale files
  pages/         dashboard + placeholder pages
  providers/     theme provider
  data/          mock data (swap for API hooks)
  lib/           utilities (cn)
```

## Reusing this template

1. Edit design tokens in `src/index.css` to match your brand.
2. Edit `src/config/navigation.ts` for your menu.
3. Replace `src/data/mock-*.ts` with React Query hooks against your API — the widgets consuming
   them don't change.
