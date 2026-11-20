/**
 * The database of the static site's coordinator: SQLite (`node:sqlite`, WAL) on the volume of
 * `theme-static`, written by its one process. Its schema is migrated at start
 * (`PRAGMA user_version`). Everything in it is derived: a lost database costs the precision of
 * the invalidation until the next full build, never the site.
 */
import { DatabaseSync } from 'node:sqlite';

/** The migrations, in order: the version of a database is how many of them ran. */
const MIGRATIONS: readonly string[] = [
  `
  -- Known pages.
  CREATE TABLE pages (
    id                INTEGER PRIMARY KEY,
    locale            TEXT NOT NULL,
    path              TEXT NOT NULL,
    route             TEXT NOT NULL,
    owner_key         TEXT,
    status            TEXT NOT NULL,
    html_hash         TEXT,
    data_hash         TEXT,
    build_id          TEXT NOT NULL,
    render_started_at INTEGER NOT NULL,
    rendered_at       INTEGER NOT NULL,
    valid_until       INTEGER,
    dirty_since       INTEGER,
    dirty_reasons     TEXT,
    hits_7d           INTEGER NOT NULL DEFAULT 0,
    UNIQUE (locale, path)
  );
  CREATE INDEX pages_path ON pages (path);
  CREATE INDEX pages_owner ON pages (owner_key, locale);
  CREATE INDEX pages_valid_until ON pages (valid_until) WHERE valid_until IS NOT NULL;
  CREATE INDEX pages_dirty ON pages (dirty_since, hits_7d) WHERE dirty_since IS NOT NULL;
  CREATE INDEX pages_hits ON pages (hits_7d DESC) WHERE status = 'published';

  -- The reverse index: a dependency and the pages that have it.
  CREATE TABLE page_deps (
    dep_key TEXT NOT NULL,
    kind    INTEGER NOT NULL,
    aspects INTEGER NOT NULL,
    page_id INTEGER NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
    PRIMARY KEY (dep_key, page_id)
  ) WITHOUT ROWID;
  CREATE INDEX page_deps_page ON page_deps (page_id);

  -- Entities the layout of every page shows: a change of one builds the whole site.
  CREATE TABLE layout_deps (
    dep_key TEXT PRIMARY KEY,
    seen_at INTEGER NOT NULL
  ) WITHOUT ROWID;

  CREATE TABLE page_hits (
    page_id INTEGER NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
    day     INTEGER NOT NULL,
    hits    INTEGER NOT NULL,
    PRIMARY KEY (page_id, day)
  ) WITHOUT ROWID;

  CREATE TABLE jobs (
    id         INTEGER PRIMARY KEY,
    locale     TEXT NOT NULL,
    target     TEXT NOT NULL,
    priority   INTEGER NOT NULL,
    reasons    TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    not_before INTEGER NOT NULL,
    state      TEXT NOT NULL,
    lease_id   TEXT,
    attempts   INTEGER NOT NULL DEFAULT 0,
    api_id     TEXT,
    route      TEXT,
    request_id TEXT,
    last_error TEXT
  );
  CREATE UNIQUE INDEX jobs_queued_target ON jobs (locale, target) WHERE state = 'queued';
  CREATE INDEX jobs_ready ON jobs (state, not_before, priority);
  CREATE INDEX jobs_lease ON jobs (lease_id) WHERE lease_id IS NOT NULL;

  CREATE TABLE dead_jobs (
    id INTEGER PRIMARY KEY, locale TEXT, target TEXT, reasons TEXT, last_error TEXT,
    died_at INTEGER
  );

  CREATE TABLE leases (
    id TEXT PRIMARY KEY, request_id TEXT, run_id TEXT, run_attempt INTEGER,
    mode TEXT NOT NULL, image TEXT, created_at INTEGER, heartbeat_at INTEGER,
    expires_at INTEGER, state TEXT NOT NULL
  );

  CREATE TABLE dispatches (
    request_id TEXT PRIMARY KEY, mode TEXT NOT NULL, reason TEXT,
    dispatched_at INTEGER, claimed_at INTEGER, run_id TEXT, state TEXT NOT NULL
  );

  CREATE TABLE build_requests (
    request_id TEXT PRIMARY KEY, mode TEXT NOT NULL, reason TEXT, image TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE purge_queue (
    tag TEXT PRIMARY KEY, enqueued_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0
  ) WITHOUT ROWID;

  CREATE TABLE event_cursor (
    id INTEGER PRIMARY KEY CHECK (id = 1), cursor TEXT NOT NULL, updated_at INTEGER NOT NULL
  );

  CREATE TABLE event_log (
    event_id TEXT PRIMARY KEY, topic TEXT, occurred_at INTEGER, received_at INTEGER,
    changes INTEGER, eager INTEGER, dirty INTEGER, purged INTEGER
  );
  CREATE INDEX event_log_received ON event_log (received_at);

  -- Values of the coordinator: the current image, the last full build, a rotated refresh
  -- token of the event feed, the default language.
  CREATE TABLE settings (
    key TEXT PRIMARY KEY, value TEXT NOT NULL
  ) WITHOUT ROWID;
  `,
];

export const SCHEMA_VERSION = MIGRATIONS.length;

/** Opens (and migrates) the database of a file, or `:memory:`. */
export function openCoordinatorDb(file: string): DatabaseSync {
  const db = new DatabaseSync(file);
  db.exec('PRAGMA busy_timeout = 5000');
  if (file !== ':memory:') db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA synchronous = NORMAL');
  db.exec('PRAGMA foreign_keys = ON');
  const { user_version: version } = db.prepare('PRAGMA user_version').get() as {
    user_version: number;
  };
  if (version > MIGRATIONS.length) {
    throw new Error(
      `${file}: schema ${version} is newer than this coordinator (${MIGRATIONS.length})`
    );
  }
  for (let index = version; index < MIGRATIONS.length; index += 1) {
    db.exec('BEGIN');
    try {
      db.exec(MIGRATIONS[index]);
      db.exec(`PRAGMA user_version = ${index + 1}`);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
  return db;
}
