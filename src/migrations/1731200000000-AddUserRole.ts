import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRole1731200000000 implements MigrationInterface {
  name = 'AddUserRole1731200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "role" varchar DEFAULT 'user'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
  }
}
