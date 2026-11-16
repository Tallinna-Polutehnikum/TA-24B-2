import { Migration } from '@mikro-orm/migrations';

export class Migration20261116124700 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`voucher_offer\` (\`id\` int unsigned not null auto_increment primary key, \`label\` varchar(160) not null, \`title\` varchar(160) not null, \`description\` text not null, \`price\` double not null, \`image\` varchar(500) null, \`active\` tinyint(1) not null default true) default character set utf8mb4 engine = InnoDB;`);
  }

}
