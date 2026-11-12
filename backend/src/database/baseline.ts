import { MikroORM } from '@mikro-orm/mysql';
import mikroOrmConfig from './mikro-orm.config';

const initialMigration = 'Migration20261112111555';

async function baselineDatabase() {
  const orm = await MikroORM.init(mikroOrmConfig);

  try {
    const schemaDiff = await orm.getSchemaGenerator().getUpdateSchemaSQL();
    if (schemaDiff.trim()) {
      throw new Error('Database schema differs from the initial migration. No migration version was recorded.');
    }

    const storage = orm.getMigrator().getStorage();
    if (!storage.ensureTable) throw new Error('Migration storage cannot initialize its tracking table.');
    await storage.ensureTable();
    const executedMigrations = await storage.executed();
    if (executedMigrations.includes(initialMigration)) {
      console.log(`${initialMigration} is already recorded.`);
      return;
    }
    if (executedMigrations.length > 0) {
      throw new Error('Different migration history already exists. No migration version was recorded.');
    }

    await storage.logMigration({ name: initialMigration, context: null });
    console.log(`Recorded ${initialMigration} for the existing schema.`);
  } finally {
    await orm.close(true);
  }
}

void baselineDatabase().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});