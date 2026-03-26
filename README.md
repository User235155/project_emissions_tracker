# Energy & Fuel Tracker

A web dashboard for monitoring energy and fuel usage across buildings, machinery, and vehicles. Track consumption over time, visualise trends, and log entries by asset.

---

## Features

- **Data Entry** — Step-by-step form to record fuel/energy usage per asset
- **Reports** — Charts showing monthly trends, fuel type breakdown, category comparison, and top assets
- **Activity Log** — Timeline of all entries grouped by date with contributor overview
- **Summary Cards** — At-a-glance totals for buildings, machinery, and vehicles

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [shadcn/ui](https://ui.shadcn.com/) | UI components |
| [Recharts](https://recharts.org/) | Charts |
| [React Router](https://reactrouter.com/) | Routing |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |

---

## Prerequisites

Make sure you have **Node.js** installed before running the project.

- Download: [nodejs.org](https://nodejs.org/) — install the **LTS** version

To verify it's installed, run:

```sh
node -v
npm -v
```

---

## Setup & Running Locally

**1. Install dependencies**

```sh
npm install
```

**2. Start the development server**

```sh
npm run dev
```

**3. Open in your browser**

```
http://localhost:8080
```

The app hot-reloads automatically when you save file changes.

---

## Other Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

---

## Project Structure

```
src/
├── components/          # UI components
│   ├── ActivityLog.tsx  # Activity timeline tab
│   ├── DataCharts.tsx   # Reports/charts tab
│   ├── FuelEntryForm.tsx# Multi-step entry form
│   ├── FuelEntryList.tsx# List of recorded entries
│   └── SummaryCards.tsx # Top-level stat cards
├── hooks/
│   └── useFuelEntries.ts# State management for entries
├── pages/
│   └── Index.tsx        # Main page layout
├── types/
│   └── fuelEntry.ts     # TypeScript types & constants
└── index.css            # Global styles & CSS variables
```

---

## Building for Production

```sh
npm run build
```

Output will be in the `dist/` folder. You can deploy this to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

To preview the production build locally before deploying:

```sh
npm run preview
```
