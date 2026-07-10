import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ unique: true })
  declare email: string;

  @Column()
  @Exclude()
  declare password: string;

  @Column({ nullable: true })
  declare name: string;

  @Column({ nullable: true, type: 'varchar' })
  @Exclude()
  declare refreshToken: string | null;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;
}
