import { Migration } from '@mikro-orm/migrations';

export class Migration20261112111555 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`banner\` (\`id\` int unsigned not null auto_increment primary key, \`title\` varchar(160) not null, \`subtitle\` varchar(300) not null default '', \`image\` varchar(500) not null, \`seed_key\` varchar(64) null, \`active\` tinyint(1) not null default true) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`banner\` add unique \`banner_seed_key_unique\`(\`seed_key\`);`);
    this.addSql(`create table \`cinema_building\` (\`id\` int unsigned not null auto_increment primary key, \`seed_key\` varchar(64) not null, \`name\` varchar(160) not null, \`address\` varchar(255) not null, \`city\` varchar(120) not null, \`hall_count\` int not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`cinema_building\` add unique \`cinema_building_seed_key_unique\`(\`seed_key\`);`);
    this.addSql(`create table \`creator\` (\`id\` int unsigned not null auto_increment primary key, \`name\` varchar(160) not null, \`seed_key\` varchar(64) not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`creator\` add unique \`creator_seed_key_unique\`(\`seed_key\`);`);
    this.addSql(`create table \`movie\` (\`id\` int unsigned not null auto_increment primary key, \`title\` varchar(160) not null, \`genre\` varchar(80) not null, \`description\` text not null, \`duration\` int not null, \`poster_url\` varchar(500) null, \`banner_url\` varchar(500) null, \`trailer_url\` varchar(500) null, \`seed_key\` varchar(64) null, \`active\` tinyint(1) not null default true) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`movie\` add unique \`movie_seed_key_unique\`(\`seed_key\`);`);
    this.addSql(`create table \`movie_creator\` (\`id\` int unsigned not null auto_increment primary key, \`movie_id\` int unsigned not null, \`creator_id\` int unsigned not null, \`role\` varchar(80) not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`movie_creator\` add index \`movie_creator_movie_id_index\`(\`movie_id\`);`);
    this.addSql(`alter table \`movie_creator\` add index \`movie_creator_creator_id_index\`(\`creator_id\`);`);
    this.addSql(`create table \`movie_rating\` (\`id\` int unsigned not null auto_increment primary key, \`movie_id\` int unsigned not null, \`score\` double not null, \`vote_count\` int not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`movie_rating\` add unique \`movie_rating_movie_id_unique\`(\`movie_id\`);`);
    this.addSql(`create table \`screening\` (\`id\` int unsigned not null auto_increment primary key, \`seed_key\` varchar(100) not null, \`movie_id\` int unsigned not null, \`building_id\` int unsigned not null, \`hall_number\` int not null, \`starts_at\` datetime not null, \`language\` varchar(12) not null, \`ticket_price\` double not null, \`blocked_seats\` json null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`screening\` add unique \`screening_seed_key_unique\`(\`seed_key\`);`);
    this.addSql(`alter table \`screening\` add index \`screening_movie_id_index\`(\`movie_id\`);`);
    this.addSql(`alter table \`screening\` add index \`screening_building_id_index\`(\`building_id\`);`);
    this.addSql(`alter table \`screening\` add unique \`screening_building_id_hall_number_starts_at_unique\`(\`building_id\`, \`hall_number\`, \`starts_at\`);`);
    this.addSql(`alter table \`movie_creator\` add constraint \`movie_creator_movie_id_foreign\` foreign key (\`movie_id\`) references \`movie\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`movie_creator\` add constraint \`movie_creator_creator_id_foreign\` foreign key (\`creator_id\`) references \`creator\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`movie_rating\` add constraint \`movie_rating_movie_id_foreign\` foreign key (\`movie_id\`) references \`movie\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`screening\` add constraint \`screening_movie_id_foreign\` foreign key (\`movie_id\`) references \`movie\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`screening\` add constraint \`screening_building_id_foreign\` foreign key (\`building_id\`) references \`cinema_building\` (\`id\`) on update cascade on delete cascade;`);
  }

}
