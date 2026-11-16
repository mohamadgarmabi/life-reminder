CREATE TABLE IF NOT EXISTS subs (id TEXT PRIMARY KEY, sub TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS items (sub_id TEXT NOT NULL, fire_at INTEGER NOT NULL, payload TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS items_fire_at ON items (fire_at);
CREATE INDEX IF NOT EXISTS items_sub_id ON items (sub_id);
-- Google sign-in + Calendar sync: one row per app install; the app holds the session, only its hash is stored.
CREATE TABLE IF NOT EXISTS google_tokens (session_hash TEXT PRIMARY KEY, refresh_token TEXT NOT NULL, access_token TEXT NOT NULL, expires_at INTEGER NOT NULL, name TEXT, email TEXT, picture TEXT);
