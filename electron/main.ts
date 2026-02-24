import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let db: Database.Database | null = null

// Database initialization
function initDatabase() {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'noltrax.db')
  
  db = new Database(dbPath)
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      duration INTEGER,
      video_path TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      team TEXT,
      jersey_number INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      shortcut_key TEXT,
      metadata_schema TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      template_id INTEGER NOT NULL,
      timestamp_start REAL NOT NULL,
      timestamp_end REAL,
      player_id INTEGER,
      team TEXT,
      notes TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
      FOREIGN KEY (template_id) REFERENCES event_templates(id),
      FOREIGN KEY (player_id) REFERENCES players(id)
    );

    CREATE INDEX IF NOT EXISTS idx_events_match ON events(match_id);
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp_start);
  `)

  // Insert default templates if empty
  const templateCount = db.prepare('SELECT COUNT(*) as count FROM event_templates').get() as { count: number }
  if (templateCount.count === 0) {
    const defaultTemplates = [
      { name: 'Pass', color: '#3b82f6', shortcut_key: 'p' },
      { name: 'Shot', color: '#ef4444', shortcut_key: 's' },
      { name: 'Tackle', color: '#22c55e', shortcut_key: 't' },
      { name: 'Interception', color: '#f59e0b', shortcut_key: 'i' },
      { name: 'Dribble', color: '#8b5cf6', shortcut_key: 'd' },
      { name: 'Foul', color: '#dc2626', shortcut_key: 'f' },
    ]

    const insert = db.prepare('INSERT INTO event_templates (name, color, shortcut_key) VALUES (?, ?, ?)')
    defaultTemplates.forEach(template => {
      insert.run(template.name, template.color, template.shortcut_key)
    })
  }

  console.log('Database initialized at:', dbPath)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#0f172a',
    show: false,
  })

  // Show window when ready to avoid flicker
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC Handlers

// File Dialog
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Videos', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm'] }
    ]
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

// Match operations
ipcMain.handle('db:createMatch', (_event, matchData) => {
  if (!db) return null
  const stmt = db.prepare('INSERT INTO matches (name, date, duration, video_path) VALUES (?, ?, ?, ?)')
  const result = stmt.run(matchData.name, matchData.date, matchData.duration, matchData.video_path)
  return result.lastInsertRowid
})

ipcMain.handle('db:getMatches', () => {
  if (!db) return []
  return db.prepare('SELECT * FROM matches ORDER BY created_at DESC').all()
})

ipcMain.handle('db:getMatch', (_event, id) => {
  if (!db) return null
  return db.prepare('SELECT * FROM matches WHERE id = ?').get(id)
})

// Template operations
ipcMain.handle('db:getTemplates', () => {
  if (!db) return []
  return db.prepare('SELECT * FROM event_templates ORDER BY name').all()
})

ipcMain.handle('db:createTemplate', (_event, template) => {
  if (!db) return null
  const stmt = db.prepare('INSERT INTO event_templates (name, color, shortcut_key, metadata_schema) VALUES (?, ?, ?, ?)')
  const result = stmt.run(template.name, template.color, template.shortcut_key, template.metadata_schema)
  return result.lastInsertRowid
})

// Event operations
ipcMain.handle('db:createEvent', (_event, eventData) => {
  if (!db) return null
  const stmt = db.prepare(`
    INSERT INTO events (match_id, template_id, timestamp_start, timestamp_end, player_id, team, notes, metadata) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    eventData.match_id,
    eventData.template_id,
    eventData.timestamp_start,
    eventData.timestamp_end,
    eventData.player_id,
    eventData.team,
    eventData.notes,
    eventData.metadata
  )
  return result.lastInsertRowid
})

ipcMain.handle('db:getEvents', (_event, matchId) => {
  if (!db) return []
  return db.prepare(`
    SELECT e.*, t.name as template_name, t.color as template_color
    FROM events e
    JOIN event_templates t ON e.template_id = t.id
    WHERE e.match_id = ?
    ORDER BY e.timestamp_start
  `).all(matchId)
})

ipcMain.handle('db:deleteEvent', (_event, eventId) => {
  if (!db) return false
  const stmt = db.prepare('DELETE FROM events WHERE id = ?')
  stmt.run(eventId)
  return true
})

ipcMain.handle('db:updateEvent', (_event, eventId, updates) => {
  if (!db) return false
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
  const values = Object.values(updates)
  const stmt = db.prepare(`UPDATE events SET ${fields} WHERE id = ?`)
  stmt.run(...values, eventId)
  return true
})

// Player operations
ipcMain.handle('db:getPlayers', () => {
  if (!db) return []
  return db.prepare('SELECT * FROM players ORDER BY name').all()
})

ipcMain.handle('db:createPlayer', (_event, player) => {
  if (!db) return null
  const stmt = db.prepare('INSERT INTO players (name, team, jersey_number) VALUES (?, ?, ?)')
  const result = stmt.run(player.name, player.team, player.jersey_number)
  return result.lastInsertRowid
})

// App lifecycle
app.whenReady().then(() => {
  initDatabase()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (db) {
    db.close()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
