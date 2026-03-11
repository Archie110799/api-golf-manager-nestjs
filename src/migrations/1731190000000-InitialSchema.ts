import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1731190000000 implements MigrationInterface {
  name = 'InitialSchema1731190000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" text PRIMARY KEY NOT NULL,
        "email" varchar NOT NULL UNIQUE,
        "password_hash" varchar NOT NULL,
        "full_name" varchar NOT NULL,
        "phone" varchar,
        "created_at" datetime DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "token" varchar NOT NULL,
        "expires_at" datetime NOT NULL,
        CONSTRAINT "fk_refresh_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "courses" (
        "id" text PRIMARY KEY NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "address" text,
        "created_at" datetime DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "slots" (
        "id" text PRIMARY KEY NOT NULL,
        "course_id" text NOT NULL,
        "date" date NOT NULL,
        "start_time" text NOT NULL,
        "end_time" text NOT NULL,
        "available" boolean DEFAULT 1,
        CONSTRAINT "fk_slot_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "course_id" text NOT NULL,
        "slot_id" text NOT NULL,
        "date" date NOT NULL,
        "status" varchar DEFAULT 'confirmed',
        "created_at" datetime DEFAULT (datetime('now')),
        CONSTRAINT "fk_booking_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_booking_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_booking_slot" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "bookings"');
    await queryRunner.query('DROP TABLE IF EXISTS "slots"');
    await queryRunner.query('DROP TABLE IF EXISTS "courses"');
    await queryRunner.query('DROP TABLE IF EXISTS "refresh_tokens"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
  }
}
