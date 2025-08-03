import SQLite from "better-sqlite3";
import path from "path";

class Database {
  constructor() {
    this.db = new SQLite("./database/4chan.db");
    this.createTables();
  }

  createTables() {
    const createThreadsTable = `CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board TEXT,
      no INTEGER,
      sticky INTEGER,
      closed INTEGER,
      now TEXT,
      name TEXT,
      com TEXT,
      filename TEXT,
      ext TEXT,
      w INTEGER,
      h INTEGER,
      tn_w INTEGER,
      tn_h INTEGER,
      tim INTEGER,
      time INTEGER,
      md5 TEXT,
      fsize INTEGER,
      resto INTEGER,
      capcode TEXT,
      semantic_url TEXT,
      replies INTEGER,
      images INTEGER,
      omitted_posts INTEGER,
      omitted_images INTEGER,
      last_modified INTEGER,
      UNIQUE(board, no)
    )`;

    const createRepliesTable = `CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board TEXT,
      no INTEGER,
      now TEXT,
      name TEXT,
      com TEXT,
      filename TEXT,
      ext TEXT,
      w INTEGER,
      h INTEGER,
      tn_w INTEGER,
      tn_h INTEGER,
      tim INTEGER,
      time INTEGER,
      md5 TEXT,
      fsize INTEGER,
      resto INTEGER,
      capcode TEXT,
      UNIQUE(board, no),
      FOREIGN KEY (board, resto) REFERENCES threads(board, no)
    )`;

    this.db.exec(createThreadsTable);
    this.db.exec(createRepliesTable);
  }

  insertThreadAndReplies(data, board) {
    const { parent, replies } = data;

    const insertThread = this.db.prepare(`
      INSERT INTO threads (
        board, no, sticky, closed, now, name, com, filename, ext, w, h,
        tn_w, tn_h, tim, time, md5, fsize, resto, capcode,
        semantic_url, replies, images, omitted_posts, omitted_images, last_modified
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(board, no) DO UPDATE SET replies = excluded.replies
    `);

    insertThread.run(
      board,
      parent.no,
      parent.sticky,
      parent.closed,
      parent.now,
      parent.name,
      parent.com,
      parent.filename,
      parent.ext,
      parent.w,
      parent.h,
      parent.tn_w,
      parent.tn_h,
      parent.tim,
      parent.time,
      parent.md5,
      parent.fsize,
      parent.resto,
      parent.capcode,
      parent.semantic_url,
      parent.replies,
      parent.images,
      parent.omitted_posts ?? 0,
      parent.omitted_images ?? 0,
      parent.last_modified,
    );

    const insertReply = this.db.prepare(`
      INSERT OR IGNORE INTO replies (
        board, no, now, name, com, filename, ext, w, h, tn_w, tn_h,
        tim, time, md5, fsize, resto, capcode
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const reply of replies) {
      insertReply.run(
        board,
        reply.no,
        reply.now,
        reply.name,
        reply.com,
        reply.filename,
        reply.ext,
        reply.w,
        reply.h,
        reply.tn_w,
        reply.tn_h,
        reply.tim,
        reply.time,
        reply.md5,
        reply.fsize,
        reply.resto,
        reply.capcode,
      );
    }
  }

  getReplyCount(board, id) {
    const stmt = this.db.prepare(
      "SELECT replies FROM threads WHERE board = ? AND no = ?",
    );
    const result = stmt.get(board, id);
    return result ? result.replies : -1;
  }
}

export default Database;
