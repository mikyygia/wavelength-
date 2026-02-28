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
