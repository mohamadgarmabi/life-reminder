CREATE TABLE IF NOT EXISTS subs (id TEXT PRIMARY KEY, sub TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS items (sub_id TEXT NOT NULL, fire_at INTEGER NOT NULL, payload TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS items_fire_at ON items (fire_at);
CREATE INDEX IF NOT EXISTS items_sub_id ON items (sub_id);
-- Google sign-in + Calendar sync: one row per app install; the app holds the session, only its hash is stored.
CREATE TABLE IF NOT EXISTS google_tokens (session_hash TEXT PRIMARY KEY, refresh_token TEXT NOT NULL, access_token TEXT NOT NULL, expires_at INTEGER NOT NULL, name TEXT, email TEXT, picture TEXT);
-- Synced app data. One family = one shared data set; every signed-in user belongs to exactly one family.
CREATE TABLE IF NOT EXISTS members (email TEXT PRIMARY KEY, family_id TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS members_family ON members (family_id);
CREATE TABLE IF NOT EXISTS invites (family_id TEXT NOT NULL, email TEXT NOT NULL, invited_by TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY (family_id, email));
CREATE INDEX IF NOT EXISTS invites_email ON invites (email);
-- data NULL = deleted (kept so other devices learn about the delete). seq increases per family; clients pull seq > cursor.
CREATE TABLE IF NOT EXISTS records (family_id TEXT NOT NULL, store TEXT NOT NULL, id TEXT NOT NULL, data TEXT, seq INTEGER NOT NULL, PRIMARY KEY (family_id, store, id));
CREATE INDEX IF NOT EXISTS records_family_seq ON records (family_id, seq);
