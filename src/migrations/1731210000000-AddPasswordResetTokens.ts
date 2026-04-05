import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetTokens1731210000000 implements MigrationInterface {
  name = 'AddPasswordResetTokens1731210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "token_hash" varchar NOT NULL UNIQUE,
        "expires_at" datetime NOT NULL,
        "used_at" datetime,
        "created_at" datetime DEFAULT (datetime('now')),
        CONSTRAINT "fk_password_reset_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "password_reset_tokens"');
  }
}
