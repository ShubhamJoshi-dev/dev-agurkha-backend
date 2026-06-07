import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ContactStatus {
  NEW = 'new',
  READ = 'read',
  ARCHIVED = 'archived',
}

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: ContactStatus, default: ContactStatus.NEW })
  status: ContactStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
