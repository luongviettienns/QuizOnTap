import { quizDb } from './quizDb';

/**
 * Migration helper to verify schema integrity and handle local version upgrades
 */
export async function runMigrations(): Promise<void> {
  if (!quizDb.isOpen()) {
    await quizDb.open();
  }
}
