# Noltrax Origin

**Offline Football Video Tagging & Match Analysis Tool**

A lightweight, desktop-first video analysis application built for football analysts, coaches, and teams who need professional tagging capabilities without internet dependency.

## 🎯 Features (Phase 1 MVP)

### Core Functionality
- ✅ **Match Management** - Create and manage match sessions
- ✅ **Video Playback** - HTML5 player with precise timestamp control
- ✅ **Quick Tagging** - Keyboard-driven event creation (<100ms latency)
- ✅ **Custom Templates** - Define your own event types with shortcuts
- ✅ **Timeline Visualization** - Color-coded event markers on interactive timeline
- ✅ **Event Management** - Filter, sort, edit, and delete events
- ✅ **SQLite Database** - Persistent local storage
- ✅ **Data Export** - Export to CSV/JSON (coming soon)

### Keyboard Shortcuts
- `Space` - Play/Pause
- `←` / `→` - Skip backward/forward 5 seconds
- `P` - Tag Pass event
- `S` - Tag Shot event
- `T` - Tag Tackle event
- `I` - Tag Interception
- `D` - Tag Dribble
- `F` - Tag Foul

## 🛠️ Tech Stack

- **Desktop Framework**: Electron
- **UI Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Database**: SQLite (better-sqlite3)
- **State Management**: Zustand
- **Styling**: TailwindCSS

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Windows OS (primary target)

### Setup Steps

1. **Clone the repository**
```bash
   git clone <repo-url>
   cd noltrax-origin
```

2. **Install dependencies**
```bash
   npm install
```

3. **Run in development mode**
```bash
   npm run electron:dev
```

4. **Build for production**
```bash
   npm run electron:build
```
   The installer will be in the `release` folder.

## 🎮 Usage Guide

### Creating a Match
1. Click **"+ New Match"** button
2. Enter match name (e.g., "Arsenal vs Chelsea")
3. Select match date
4. Browse and select video file (MP4, MKV, AVI, MOV, WEBM)
5. Click **"Create Match"**

### Tagging Events
Two methods:

**Method 1: Keyboard Shortcuts (Fastest)**
- Play the video
- Press the shortcut key at the moment of the event
- Event is instantly created at current timestamp

**Method 2: Click Tags**
- Click the colored tag buttons in the left panel
- Event created at current video time

### Managing Events
- **View Events**: Right sidebar shows all events
- **Filter**: Click event type buttons to filter
- **Sort**: Toggle between time-based or type-based sorting
- **Jump to Event**: Click event to jump video to that timestamp
- **Delete Event**: Click trash icon on event

### Timeline Navigation
- **Click timeline** to jump to any point in the video
- **Click event markers** to jump to specific events
- **Zoom**: Scroll on timeline (coming soon)

## 📂 Project Structure
```
noltrax-origin/
├── electron/
│   ├── main.ts          # Electron main process
│   └── preload.ts       # IPC bridge
├── src/
│   ├── components/      # React components
│   │   ├── VideoPlayer.tsx
│   │   ├── Timeline.tsx
│   │   ├── TaggingPanel.tsx
│   │   ├── EventsList.tsx
│   │   └── MatchSelector.tsx
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Helper functions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # React entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🗃️ Database Schema

### Tables

**matches**
- id, name, date, duration, video_path, created_at

**event_templates**
- id, name, color, shortcut_key, metadata_schema, created_at

**events**
- id, match_id, template_id, timestamp_start, timestamp_end, player_id, team, notes, metadata, created_at

**players**
- id, name, team, jersey_number, created_at

## 🚀 Roadmap

### Phase 1: Core Tagging Engine (✅ Current)
- Match creation and video loading
- Basic event tagging
- Timeline visualization
- Local database storage

### Phase 2: Enhanced Tagging (Next)
- Custom keyboard shortcuts
- Event editing with forms
- Multi-select and batch operations
- CSV/JSON export
- Player management

### Phase 3: Advanced Features
- Video clips extraction
- Basic statistics (event counts, heatmaps)
- Match comparison
- Template import/export

### Phase 4: Noltrax Pro Preparation
- Plugin architecture
- API for external tools
- Performance optimization for long matches
- Multi-video support

## 🤝 Contributing

This is a proprietary project. For feature requests or bug reports, contact the development team.

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Review common issues in FAQ
3. Contact support team

---

**Version**: 1.0.0 (Origin)  
**Status**: Phase 1 MVP  
**Last Updated**: February 2026
