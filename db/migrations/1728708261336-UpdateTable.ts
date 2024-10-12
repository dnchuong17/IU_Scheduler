import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1728708261336 implements MigrationInterface {
    name = 'UpdateTable1728708261336'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_setting_info" ("uid" SERIAL NOT NULL, "role" character varying, "user_id" integer, CONSTRAINT "REL_c46522247b9264b98058d97bc7" UNIQUE ("user_id"), CONSTRAINT "PK_66c31fe485effc76ea79688e0fc" PRIMARY KEY ("uid"))`);
        await queryRunner.query(`ALTER TABLE "user_setting_info" ADD CONSTRAINT "FK_c46522247b9264b98058d97bc71" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_setting_info" DROP CONSTRAINT "FK_c46522247b9264b98058d97bc71"`);
        await queryRunner.query(`DROP TABLE "user_setting_info"`);
    }

}
