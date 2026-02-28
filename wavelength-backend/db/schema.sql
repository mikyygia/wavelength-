CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  mood TEXT NOT NULL,
  note TEXT NOT NULL,
  song_url TEXT,
  reaction_felt INTEGER DEFAULT 0,
  reaction_hug INTEGER DEFAULT 0,
  reaction_heart INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS replies (
  id TEXT PRIMARY KEY,
  signal_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (signal_id) REFERENCES signals(id)
);

CREATE TABLE IF NOT EXISTS static_reports (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  location_label TEXT,
  status TEXT DEFAULT 'active',
  resolved_at TEXT,
  resolution_note TEXT,
  affected_count INTEGER DEFAULT 0,
  confirmations INTEGER DEFAULT 0,
  start_date TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  source TEXT DEFAULT 'community',
  news_links TEXT DEFAULT '[]'
);
