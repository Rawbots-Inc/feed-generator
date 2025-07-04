import { Kysely, Migration, MigrationProvider } from 'kysely'

const migrations: Record<string, Migration> = {}

export const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return migrations
  },
}

migrations['001'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('post')
      .addColumn('uri', 'varchar', (col) => col.primaryKey())
      .addColumn('cid', 'varchar', (col) => col.notNull())
      .addColumn('indexedAt', 'varchar', (col) => col.notNull())
      .addColumn('community', 'varchar', (col) => col.notNull())
      .execute()
    await db.schema
      .createTable('sub_state')
      .addColumn('service', 'varchar', (col) => col.primaryKey())
      .addColumn('cursor', 'integer', (col) => col.notNull())
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('post').execute()
    await db.schema.dropTable('sub_state').execute()
  },
}

/**
 * 002: Add `embed` column to `post` table
 */
migrations['002'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .alterTable('post')
      .addColumn('embed', 'json')
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema
      .alterTable('post')
      .dropColumn('embed')
      .execute()
  },
}

/**
 * 003: Add `author` column to `post` table
 */
migrations['003'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .alterTable('post')
      .addColumn('author', 'varchar', (col) => col.notNull().defaultTo(''))
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema
      .alterTable('post')
      .dropColumn('author')
      .execute()
  },
}

/**
 * 004: Create `follows` table
 */
migrations['004'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('follows')
      .addColumn('id', 'varchar', (col) => col.primaryKey())
      .addColumn('follower', 'varchar', (col) => col.notNull())
      .addColumn('followed', 'varchar', (col) => col.notNull())
      .addColumn('createdAt', 'varchar', (col) => col.notNull())
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema
      .dropTable('follows')
      .execute()
  },
}


/**
 * 005: Add indexes for feed performance
 */
migrations['005'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createIndex('idx_follows_follower')
      .on('follows')
      .column('follower')
      .execute()

    await db.schema
      .createIndex('idx_post_author')
      .on('post')
      .column('author')
      .execute()
  },

  async down(db: Kysely<unknown>) {
    await db.schema.dropIndex('idx_post_author').execute()
    await db.schema.dropIndex('idx_follows_follower').execute()
  },
}

/**
 * 006: Create `active_users` table
 */
migrations['006'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('active_users')
      .addColumn('did', 'varchar', (col) => col.primaryKey())
      .addColumn('firstSeen', 'varchar', (col) => col.notNull())
      .execute()
  },

  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('active_users').execute()
  },
}