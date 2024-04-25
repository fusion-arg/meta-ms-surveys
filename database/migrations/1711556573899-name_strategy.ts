import { MigrationInterface, QueryRunner } from 'typeorm';

export class NameStrategy1711556573899 implements MigrationInterface {
  name = 'NameStrategy1711556573899';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`surv_user_survey\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_id\` varchar(255) NOT NULL, \`responded\` tinyint NOT NULL DEFAULT 0, \`surveyId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`surv_survey\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`project_id\` varchar(255) NOT NULL, \`sprint_id\` varchar(255) NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`delivered_at\` timestamp NULL, \`closed_at\` timestamp NULL, \`status\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`module\` varchar(255) NOT NULL, \`metadata\` json NOT NULL, \`segmentation\` json NOT NULL, \`total_answered\` int NOT NULL DEFAULT '0', \`total_expected\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`surv_question\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`order\` int NOT NULL, \`type\` varchar(255) NOT NULL, \`image_url\` varchar(255) NULL, \`dropdown_options\` json NULL, \`presentation_link\` varchar(255) NULL, \`metadata\` json NOT NULL, \`surveyId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`surv_answer\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`responded_at\` datetime NULL, \`user_id\` varchar(255) NOT NULL, \`response\` json NOT NULL, \`questionId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`surv_user_survey\` ADD CONSTRAINT \`FK_f4a802c177b258852405ab87588\` FOREIGN KEY (\`surveyId\`) REFERENCES \`surv_survey\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`surv_question\` ADD CONSTRAINT \`FK_d93a3319ef8f8afd9de3f5de11e\` FOREIGN KEY (\`surveyId\`) REFERENCES \`surv_survey\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`surv_answer\` ADD CONSTRAINT \`FK_4d635ecc348f5ef5c81c7351986\` FOREIGN KEY (\`questionId\`) REFERENCES \`surv_question\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`surv_answer\` DROP FOREIGN KEY \`FK_4d635ecc348f5ef5c81c7351986\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`surv_question\` DROP FOREIGN KEY \`FK_d93a3319ef8f8afd9de3f5de11e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`surv_user_survey\` DROP FOREIGN KEY \`FK_f4a802c177b258852405ab87588\``,
    );
    await queryRunner.query(`DROP TABLE \`surv_answer\``);
    await queryRunner.query(`DROP TABLE \`surv_question\``);
    await queryRunner.query(`DROP TABLE \`surv_survey\``);
    await queryRunner.query(`DROP TABLE \`surv_user_survey\``);
  }
}
