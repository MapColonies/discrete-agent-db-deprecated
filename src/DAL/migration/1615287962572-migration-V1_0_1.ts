import {MigrationInterface, QueryRunner} from "typeorm";

export class migrationV1011615287962572 implements MigrationInterface {
    name = 'migrationV1011615287962572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "layer_history" ("layerId" character varying(300) NOT NULL, "version" character varying(30) NOT NULL, "status" character varying(300) NOT NULL, "createdOn" TIMESTAMP NOT NULL DEFAULT now(), "updatedOn" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_727c95a6a04ec30834a681ce004" PRIMARY KEY ("layerId", "version"))`);
        await queryRunner.query(`CREATE TABLE "setting" ("key" character varying(300) NOT NULL, "value" character varying(300) NOT NULL, CONSTRAINT "PK_1c4c95d773004250c157a744d6e" PRIMARY KEY ("key"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "setting"`);
        await queryRunner.query(`DROP TABLE "layer_history"`);
    }

}
