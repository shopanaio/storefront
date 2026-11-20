/**
 * The database of the static site's coordinator: SQLite (`node:sqlite`, WAL) on the volume of
 * `theme-static`, written by its one process. Its schema is migrated at start
 * (`PRAGMA user_version`). Everything in it is derived: a lost database costs the queue and the
 * hits until the next full build, never the site.
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
    status            TEXT NOT NULL,
    html_hash         TEXT,
    build_id          TEXT NOT NULL,
    render_started_at INTEGER NOT NULL,
    rendered_at       INTEGER NOT NULL,
    valid_until       INTEGER,
    hits_7d           INTEGER NOT NULL DEFAULT 0,
    UNIQUE (locale, path)
  );
  CREATE INDEX pages_path ON pages (path);
  CREATE INDEX pages_valid_until ON pages (valid_until) WHERE valid_until IS NOT NULL;
  CREATE INDEX pages_hits ON pages (hits_7d DESC) WHERE status = 'published';

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
    id TEXT PRIMARY KEY, mode TEXT NOT NULL, image TEXT, created_at INTEGER,
    heartbeat_at INTEGER, expires_at INTEGER, state TEXT NOT NULL
  );

  CREATE TABLE build_requests (
    request_id TEXT PRIMARY KEY, mode TEXT NOT NULL, reason TEXT, image TEXT,
    created_at INTEGER NOT NULL
  );

  -- Values of the coordinator: the current image, the last full build, the day of the nightly
  -- one, the default language.
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
