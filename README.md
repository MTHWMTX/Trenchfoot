# Trenchfoot

A companion app for [Trench Crusade](https://www.trenchcrusade.com/), a tabletop skirmish wargame. Trenchfoot handles warband building, rules reference, campaign tracking, and in-game state management so you can focus on playing.

## Features

- **Rules Reference** — Browse core rules, faction rules, scenarios, and equipment. Keywords are linked and searchable across the compendium.
- **Warband Builder** — Build warbands for standard or campaign play. Manage rosters, equipment loadouts, and model names with ducat and glory budget tracking.
- **Campaign Tracking** — Track games across a 12-game campaign including win/loss records, glory points, and ducat stash. A post-game wizard guides you through trauma rolls, promotions, reinforcements, and exploration.
- **Game Tracker** — Track model activation, blood/blessing/infection markers, and status (active/down/out) during a game, with undo support.
- **Homebrew** — Create custom factions, models, equipment, and addons alongside the official compendium.

## Tech Stack

- React 19, TypeScript, Vite
- Tailwind CSS, Radix UI
- Zustand (state management)
- Dexie / IndexedDB (local-first, no backend)
- Fuse.js (fuzzy search)
- PWA — installable on mobile devices from the browser

## Running Locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

All data is stored locally in your browser — no account or internet connection required after the initial load.
